  const orderModel = require('../../modal/client/order.model');
  const cartModel = require('../../modal/client/cart.model');
  const crypto = require('crypto');
  const axios = require('axios');
  const db = require("../../config/database");
  const moment = require("moment");

  const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // đổi theo bạn
  const accessKey = 'F8BBA842ECF85'; // đổi theo bạn

  // 📥 Lấy danh sách đơn hàng
  module.exports.getOrdersByUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      const orders = await orderModel.getOrdersByUserId(userId, status);

      res.json({ success: true, message: 'Danh sách đơn hàng', data: orders });
    } catch (err) {
      console.error('❌ Lỗi getOrdersByUser:', err);
      res.status(500).json({ success: false, message: 'Lỗi server lấy đơn hàng' });
    }
  };

  // 🔍 Xem chi tiết đơn hàng - chỉ trả về mảng chi tiết sản phẩm
module.exports.getOrderDetailByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    // Thay vì gọi getProductsFromOrder, gọi đúng hàm lấy sản phẩm chi tiết
    const products = await orderModel.getOrderProductsByUser(orderId, userId);

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong đơn hàng hoặc không thuộc về bạn.' });
    }

    return res.json({
      success: true,
      message: 'Danh sách sản phẩm trong đơn hàng',
      data: products
    });
  } catch (err) {
    console.error('❌ Lỗi getOrderDetailByUser:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server lấy chi tiết đơn hàng'
    });
  }
};



  // 🛒 Tạo đơn hàng (COD/MoMo)
  module.exports.createOrderAndPay = async (req, res) => {
  const orderData = req.body;

  try {
    const userId = req.user.id;

    // 🛒 Lấy sản phẩm trong giỏ hàng
    const [cartItems] = await db.query(`
      SELECT gct.id_san_pham, gct.so_luong, sp.gia
      FROM gio_hang_chi_tiet gct
      JOIN gio_hang gh ON gct.id_gio_hang = gh.id_gio_hang
      JOIN san_pham sp ON gct.id_san_pham = sp.id_san_pham
      WHERE gh.id_nguoi_dung = ? AND gct.deleted = 0
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống, không thể tạo đơn.' });
    }

    // 💰 Tính tổng giá và giảm giá
    let tong_gia_truoc_giam = 0;
    cartItems.forEach(item => {
      tong_gia_truoc_giam += item.gia * item.so_luong;
    });

    let gia_tri_giam = 0;
    let id_giam_gia = null;

    if (orderData.ma_giam_gia?.trim()) {
      const ma = orderData.ma_giam_gia.trim();

      const [rows] = await db.execute(`
        SELECT * FROM giam_gia
        WHERE ma_giam_gia = ? AND deleted = 0 AND trang_thai = 'active'
      `, [ma]);

      const giamGia = rows[0];
      if (!giamGia) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ.' });
      }

      const now = moment();
      if (now.isBefore(giamGia.ngay_bat_dau) || now.isAfter(giamGia.ngay_ket_thuc)) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá hết hạn hoặc chưa bắt đầu.' });
      }

      if (giamGia.so_luong_con_lai <= 0) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt.' });
      }

      if (tong_gia_truoc_giam < giamGia.dieu_kien) {
        return res.status(400).json({ success: false, message: `Đơn hàng phải từ ${giamGia.dieu_kien}đ để áp dụng mã.` });
      }

      gia_tri_giam = giamGia.loai === 'phan_tram'
        ? Math.floor(tong_gia_truoc_giam * giamGia.gia_tri / 100)
        : giamGia.gia_tri;

      await db.execute(`
        UPDATE giam_gia
        SET so_luong_con_lai = so_luong_con_lai - 1
        WHERE id_giam_gia = ?
      `, [giamGia.id_giam_gia]);

      id_giam_gia = giamGia.id_giam_gia;
    }

    const tong_gia = tong_gia_truoc_giam - gia_tri_giam;

    // 📦 Tạo đơn hàng
    orderData.id_nguoi_dung = userId;
    orderData.tong_gia_truoc_giam = tong_gia_truoc_giam;
    orderData.gia_tri_giam = gia_tri_giam;
    orderData.tong_gia = tong_gia;
    orderData.id_giam_gia = id_giam_gia;

    const { orderId, momo_order_id } = await orderModel.createOrder(orderData);

    // 🗑️ Xoá giỏ hàng
    await db.query(`
      DELETE gct FROM gio_hang_chi_tiet gct
      JOIN gio_hang gh ON gct.id_gio_hang = gh.id_gio_hang
      WHERE gh.id_nguoi_dung = ?
    `, [userId]);

    // 💳 Thanh toán MoMo
    if (orderData.phuong_thuc_thanh_toan === 'momo') {
      try {
        const partnerCode = 'MOMO';
       const requestType =
  process.env.NODE_ENV === 'production' ? 'payWithMethod' : 'captureWallet';

        const amount = tong_gia.toString();
        const orderInfo = `Thanh toán đơn hàng #${orderId}`;
        const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
        const ipnUrl = 'https://c4eb-115-74-130-106.ngrok-free.app/order/momo/callback';
        const requestId = 'REQ_' + Date.now();
        const extraData = '';

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momo_order_id}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
          partnerCode,
          requestId,
          amount,
          orderId: momo_order_id,
          orderInfo,
          redirectUrl,
          ipnUrl,
          requestType,
          extraData,
          signature
        };

        const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (momoRes.data.resultCode !== 0) {
          await orderModel.deleteOrder(orderId);
          return res.status(400).json({
            success: false,
            message: 'Tạo yêu cầu thanh toán MoMo thất bại.',
            momoResponse: momoRes.data
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Đơn hàng được tạo thành công. Vui lòng thanh toán qua MoMo.',
          orderId,
          payUrl: momoRes.data.payUrl
        });
      } catch (momoError) {
        await orderModel.deleteOrder(orderId);
        console.error('❌ Lỗi MoMo API:', momoError.message);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi tạo yêu cầu thanh toán MoMo.',
          error: momoError.message
        });
      }
    }

    // 💵 Thanh toán COD
    if (orderData.phuong_thuc_thanh_toan === 'cod') {
      return res.status(201).json({
        success: true,
        message: 'Đơn hàng COD tạo thành công.',
        orderId
      });
    }

    // ❌ Phương thức thanh toán không hợp lệ
    return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
  } catch (err) {
    console.error('❌ Lỗi createOrderAndPay:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng.',
      error: err.message
    });
  }
};


  // 🗑️ Huỷ đơn hàng
  module.exports.cancelOrderByUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const success = await orderModel.cancelOrderByUser(orderId, userId);
      if (!success) {
        return res.status(400).json({ success: false, message: 'Không thể huỷ đơn hàng này.' });
      }

      res.json({ success: true, message: 'Huỷ đơn hàng thành công.' });
    } catch (err) {
      console.error('❌ Lỗi cancelOrderByUser:', err);
      res.status(500).json({ success: false, message: 'Lỗi server khi huỷ đơn hàng.' });
    }
  };

  // 🔄 Mua lại đơn hàng
  module.exports.reorder = async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const items = await orderModel.getProductsFromOrder(orderId, userId);
      if (!items.length) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc không thuộc về bạn.' });
      }

      const cart = await cartModel.createCart(userId);
      for (const item of items) {
        await cartModel.addItemToCart(cart.id_gio_hang, item.id_san_pham, item.so_luong);
      }

      res.json({ success: true, message: 'Sản phẩm đã được thêm lại vào giỏ hàng.' });
    } catch (err) {
      console.error('❌ Lỗi reorder:', err);
      res.status(500).json({ success: false, message: 'Lỗi khi mua lại đơn hàng.' });
    }
  };

  // ⭐ Đánh giá sản phẩm
 module.exports.reviewProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const { diem_so, nhan_xet } = req.body;

    // Validate đầu vào ngay controller, tránh gọi hàm addReview khi dữ liệu sai
    if (!diem_so || diem_so < 1 || diem_so > 5) {
      return res.status(400).json({ success: false, message: 'Điểm số phải từ 1 đến 5' });
    }
    if (!nhan_xet || nhan_xet.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nhận xét' });
    }

    await orderModel.addReview(productId, userId, diem_so, nhan_xet.trim());

    res.json({ success: true, message: 'Đánh giá thành công.' });
  } catch (err) {
    console.error('❌ Lỗi reviewProduct:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


  // 📩 Callback từ MoMo
  module.exports.callback = async (req, res) => {
    const { orderId, amount, resultCode, message } = req.body;

    try {
      if (resultCode === 0) {
        await orderModel.markOrderPaid(orderId, amount, 'MoMo');
        res.json({ success: true, message: 'Thanh toán thành công.' });
      } else {
        await orderModel.markOrderFailed(orderId);
        res.status(400).json({ success: false, message: `Thanh toán thất bại: ${message}` });
      }
    } catch (err) {
      console.error('❌ Callback MoMo lỗi:', err);
      res.status(500).json({ success: false, message: 'Lỗi xử lý callback MoMo.' });
    }
  };

  // 📥 Lấy tất cả đánh giá
  module.exports.getReviews = async (req, res) => {
    try {
      const productId = req.params.id;
      const reviews = await orderModel.getReviewsByProductId(productId);

      res.status(200).json({
        success: true,
        message: 'Danh sách đánh giá',
        data: reviews
      });
    } catch (err) {
      console.error('❌ Lỗi getReviews:', err);
      res.status(500).json({ success: false, message: 'Lỗi lấy đánh giá.' });
    }
  };

  // 📥 Lấy lịch sử đơn hàng của user
module.exports.getOrderHistoriesByUser = async (req, res) => {
  try {
    console.log('📌 [getOrderHistoriesByUser] req.user:', req.user);

    if (!req.user || !req.user.id) {
      console.error('❌ Middleware không gắn user hoặc token sai');
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập hoặc token không hợp lệ'
      });
    }

    const userId = req.user.id;

    // 📥 Lấy status từ query params
    const status = req.query.status;
    console.log('📥 [getOrderHistoriesByUser] Filter trạng thái:', status);

    // Gọi model với userId và status
    const histories = await orderModel.getOrderHistoriesByUser(userId, status);

    console.log('📦 [getOrderHistoriesByUser] Dữ liệu trả về:', histories);

    return res.status(200).json({
      success: true,
      message: 'Danh sách lịch sử đơn hàng',
      data: histories
    });

  } catch (err) {
    console.error('❌ [getOrderHistoriesByUser] Lỗi server:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lịch sử đơn hàng'
    });
  }
};



