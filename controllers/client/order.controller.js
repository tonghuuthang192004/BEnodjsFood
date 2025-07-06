const orderModel = require('../../modal/client/order.model');
const cartModel = require('../../modal/client/cart.model');
const crypto = require('crypto');
const axios = require('axios');
const db = require("../../config/database")
const moment = require("moment")
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const accessKey = 'F8BBA842ECF85';

// 📥 Lấy danh sách đơn hàng (có lọc trạng thái)
module.exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // ?status=Đã giao
    const orders = await orderModel.getOrdersByUserId(userId, status);

    res.json({ success: true, message: 'Danh sách đơn hàng', data: orders });
  } catch (err) {
    console.error('❌ Lỗi getOrdersByUser:', err);
    res.status(500).json({ success: false, message: 'Lỗi server lấy đơn hàng' });
  }
};

// 🔍 Xem chi tiết đơn hàng
module.exports.getOrderDetailByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const order = await orderModel.getOrderDetailByUser(orderId, userId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ success: true, message: 'Chi tiết đơn hàng', data: order });
  } catch (err) {
    console.error('❌ Lỗi getOrderDetailByUser:', err);
    res.status(500).json({ success: false, message: 'Lỗi server lấy chi tiết đơn hàng' });
  }
};

// 🛒 Tạo đơn hàng (COD/MoMo)
module.exports.createOrderAndPay = async (req, res) => {
  const orderData = req.body;

  

  
  try {
      // =======================
    // ✅ TÍNH TỔNG GIÁ + GIẢM
    // =======================
 let tong_gia_truoc_giam = 0;

for (const sp of orderData.chi_tiet_san_pham) {
  const [rows] = await db.execute(`SELECT gia FROM san_pham WHERE id_san_pham = ?`, [sp.id_san_pham]);

  if (rows.length === 0) {
    return res.status(400).json({ message: `Sản phẩm với ID ${sp.id_san_pham} không tồn tại.` });
  }

  const gia = rows[0].gia;
  sp.gia = gia; // gán lại để insert vào chi tiết đơn hàng
  tong_gia_truoc_giam += gia * sp.so_luong;
}
let gia_tri_giam = 0;

if (orderData.ma_giam_gia?.trim()) {
  const ma = orderData.ma_giam_gia.trim();

  const [rows] = await db.execute(`
    SELECT * FROM giam_gia 
    WHERE ma_giam_gia = ? AND deleted = 0 AND trang_thai = 'active'
  `, [ma]);

  const giamGia = rows[0];
  if (!giamGia) return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });

  const now = moment();

  if (now.isBefore(giamGia.ngay_bat_dau) || now.isAfter(giamGia.ngay_ket_thuc)) {
    return res.status(400).json({ message: 'Mã giảm giá đã hết hạn hoặc chưa bắt đầu.' });
  }

  if (giamGia.so_luong_con_lai <= 0) {
    return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' });
  }

  if (tong_gia_truoc_giam < giamGia.dieu_kien) {
    return res.status(400).json({ message: `Đơn hàng phải từ ${giamGia.dieu_kien}đ để dùng mã.` });
  }

  // Tính giá trị giảm
  if (giamGia.loai === 'phan_tram') {
    gia_tri_giam = Math.floor(tong_gia_truoc_giam * giamGia.gia_tri / 100);
  } else {
    gia_tri_giam = giamGia.gia_tri;
  }

  // Trừ lượt
  await db.execute(`
    UPDATE giam_gia 
    SET so_luong_con_lai = so_luong_con_lai - 1 
    WHERE id_giam_gia = ?
  `, [giamGia.id_giam_gia]);

  // Gán id_giam_gia vào orderData để lưu đơn hàng
  orderData.id_giam_gia = giamGia.id_giam_gia;
}

// ✅ GÁN GIÁ TRỊ VÀO orderData
orderData.tong_gia_truoc_giam = tong_gia_truoc_giam;
orderData.gia_tri_giam = gia_tri_giam;
orderData.tong_gia = tong_gia_truoc_giam - gia_tri_giam;
    // 1. Tạo đơn hàng trong hệ thống
    const {orderId,momo_order_id} = await orderModel.createOrder(orderData);

    // 2. Nếu chọn thanh toán MoMo
    if (orderData.phuong_thuc_thanh_toan === 'momo') {
      const partnerCode = 'MOMO';
      const requestType = "payWithMethod";
      const amount = orderData.tong_gia.toString();
      const orderInfo = `Thanh toán đơn hàng #${orderId}`;
      const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';

  var ipnUrl = 'https://ee7c-113-185-64-1.ngrok-free.app/order/momo/callback';
      // const momoOrderId = 'MOMO_' + Date.now(); // orderId gửi MoMo
      const requestId = 'REQ_' + Date.now();
      const extraData = '';const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momo_order_id}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

      const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

      const requestBody = {
        partnerCode,
        partnerName: "YourStore",
        storeId: "Store001",
        requestId,
        amount,
        orderId: momo_order_id,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        requestType,
        autoCapture: true,
        extraData,
        orderGroupId: '',
        signature
      };

      const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (momoRes.data.resultCode !== 0) {
        // Xoá đơn hàng nếu MoMo tạo thất bại
        await orderModel.deleteOrder(orderId);
        return res.status(400).json({
          message: 'Tạo yêu cầu thanh toán MoMo thất bại.',
          momoResponse: momoRes.data
        });
      }

      return res.status(200).json({
        message: 'Đơn hàng được tạo thành công. Vui lòng thanh toán qua MoMo.',
        orderId,
        payUrl: momoRes.data.payUrl,
        momoResponse: momoRes.data
      });
    }

    // 3. Nếu chọn COD
    if (orderData.phuong_thuc_thanh_toan === 'cod') {
      return res.status(201).json({
        message: 'Đơn hàng được tạo thành công. Phương thức thanh toán COD đã được ghi nhận.',
        orderId
      });
    }

    // 4. Phương thức không hợp lệ
    return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });

  } catch (err) {
    console.error('❌ Lỗi khi tạo đơn hàng hoặc thanh toán:', err.message);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi tạo đơn hàng.',
      error: err.message
    });
  }
};

// 🗑️ Huỷ đơn hàng
module.exports.cancelOrderByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    await orderModel.cancelOrderByUser(orderId, userId);

    res.json({ success: true, message: 'Huỷ đơn hàng thành công' });
  } catch (err) {
    console.error('❌ Lỗi cancelOrderByUser:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// 🔄 Mua lại đơn hàng → Đẩy sp vào giỏ hàng
module.exports.reorder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const items = await orderModel.getProductsFromOrder(orderId, userId);
    if (!items.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc đơn không thuộc về bạn' });
    }

    const cart = await cartModel.createCart(userId);

    for (const item of items) {
      await cartModel.addItemToCart(cart.id_gio_hang, item.id_san_pham, item.so_luong);
    }

    res.json({ success: true, message: 'Đã tạo giỏ hàng mới và thêm sản phẩm từ đơn hàng vào giỏ.' });
  } catch (err) {
    console.error('❌ Lỗi reorder:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi mua lại đơn hàng' });
  }
};

// ⭐ Đánh giá sản phẩm (chỉ khi thanh toán thành công & đã giao)
module.exports.reviewProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id; // id_san_pham
    const { diem_so, nhan_xet } = req.body;

    await orderModel.addReview(productId, userId, diem_so, nhan_xet);

    res.json({ success: true, message: 'Đánh giá sản phẩm thành công' });
  } catch (err) {
    console.error('❌ Lỗi reviewProduct:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// 📩 Callback MoMo
// exports.momoCallback = async (req, res) => {
//   try {
//     const { orderId, resultCode, message, amount } = req.body;
//     console.log('📩 MoMo Callback:', req.body);

//     if (resultCode === 0) {
//       await orderModel.markOrderPaid(orderId, amount, 'MoMo');
//       return res.json({ success: true, message: 'Thanh toán thành công' });
//     } else {
//       await orderModel.markOrderFailed(orderId);
//       return res.status(400).json({ success: false, message: `Thanh toán thất bại: ${message}` });
//     }
//   } catch (err) {
//     console.error('❌ Lỗi momoCallback:', err);
//     res.status(500).json({ success: false, message: 'Lỗi xử lý callback MoMo' });
//   }
// };
module.exports.callback = async (req, res) => {
  // console.log("callback:::");
  // res.send('ok');
    console.log('--- CALLBACK MO MO ĐƯỢC GỌI ---', req.method, req.path);

  const {
    orderId,    // Đây là momo_order_id
    amount,
    resultCode,
    message,
    transId,
  } = req.body;

  console.log('📥 Callback MoMo nhận:', req.body);

  try {
    if (resultCode === 0) {
      // 1. Tìm đơn hàng dựa vào momo_order_id
      const [orders] = await db.query(
        'SELECT * FROM don_hang WHERE momo_order_id = ?',
        [orderId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng với momo_order_id này',
        });
      }

      const order = orders[0];
      const idDonHang = order.id_don_hang;

      // 2. Kiểm tra thanh toán
      const [existingPayment] = await db.query(
        'SELECT * FROM thanh_toan WHERE id_don_hang = ? AND phuong_thuc = ?',
        [idDonHang, 'MoMo']
      );

      if (existingPayment.length === 0) {
        await db.query(
          `INSERT INTO thanh_toan 
            (id_don_hang, so_tien, phuong_thuc, trang_thai, ngay_thanh_toan) 
           VALUES (?, ?, 'MoMo', 'Đã thanh toán', NOW())`,
          [idDonHang, amount]
        );
        console.log('✅ Insert thanh toán.');
      } else {
        await db.query(
          `UPDATE thanh_toan 
           SET trang_thai = 'Đã thanh toán', ngay_thanh_toan = NOW()
           WHERE id_don_hang = ? AND phuong_thuc = 'MoMo'`,
          [idDonHang]
        );
        console.log('🔁 Update thanh toán.');
      }

      // 3. Cập nhật trạng thái đơn hàng
      if (order.trang_thai !== 'Đã giao' || order.trang_thai_thanh_toan !== 'Đã thanh toán') {
        await db.query(
          `UPDATE don_hang 
           SET trang_thai = ?, trang_thai_thanh_toan = ?, phuong_thuc_thanh_toan = ? 
           WHERE id_don_hang = ?`,
          ['Đã giao', 'Đã thanh toán', 'MoMo', idDonHang]
        );
        console.log('📦 Cập nhật đơn hàng.');
      } else {
        console.log('ℹ️ Đơn hàng đã ở trạng thái chính xác.');
      }

      // 4. Lưu lịch sử
      await db.query(
        `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
         VALUES (?, NOW(), ?, ?)`,
        [idDonHang, 'Đã giao', 'Thanh toán MoMo thành công, cập nhật đơn hàng']
      );

      return res.status(200).json({
        success: true,
        message: 'Đã xử lý callback MoMo thành công',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Thanh toán thất bại: ${message}`,
        resultCode,
      });
    }
  } catch (error) {
    console.error('❌ Callback MoMo lỗi:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý callback MoMo',
      error: error.message
    });
  }
};