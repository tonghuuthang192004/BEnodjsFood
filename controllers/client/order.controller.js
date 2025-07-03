const orderModel = require('../../modal/client/order.model');
const cartModel = require('../../modal/client/cart.model');
const crypto = require('crypto');
const axios = require('axios');

const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const accessKey = 'F8BBA842ECF85';

// 📥 Lấy danh sách đơn hàng (có lọc trạng thái)
exports.getOrdersByUser = async (req, res) => {
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
exports.getOrderDetailByUser = async (req, res) => {
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
exports.createOrderAndPay = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;
    orderData.user_id = userId;

    const { orderId, momo_order_id } = await orderModel.createOrder(orderData);

    if (orderData.phuong_thuc_thanh_toan === 'momo') {
      const partnerCode = 'MOMO';
      const requestType = "payWithMethod";
      const amount = orderData.tong_gia.toString();
      const orderInfo = `Thanh toán đơn hàng #${orderId}`;
      const redirectUrl = 'https://your-app.com/payment/success';
      const ipnUrl = 'https://your-backend.com/user/order/momo/callback';
      const requestId = 'REQ_' + Date.now();
      const extraData = '';

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momo_order_id}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

      const requestBody = {
        partnerCode, partnerName: "FastFoodApp", storeId: "Store001",
        requestId, amount, orderId: momo_order_id, orderInfo, redirectUrl, ipnUrl,
        lang: 'vi', requestType, autoCapture: true, extraData, signature
      };

      const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);

      if (momoRes.data.resultCode !== 0) {
        await orderModel.cancelOrderByUser(orderId, userId);
        return res.status(400).json({ success: false, message: 'Tạo thanh toán MoMo thất bại', momoResponse: momoRes.data });
      }

      return res.status(201).json({
        success: true,
        message: 'Đơn hàng tạo thành công, chuyển đến MoMo để thanh toán',
        data: { orderId, payUrl: momoRes.data.payUrl }
      });
    }

    res.status(201).json({ success: true, message: 'Đơn hàng COD tạo thành công', data: { orderId } });
  } catch (err) {
    console.error('❌ Lỗi createOrderAndPay:', err);
    res.status(500).json({ success: false, message: 'Lỗi server tạo đơn hàng' });
  }
};

// 🗑️ Huỷ đơn hàng
exports.cancelOrderByUser = async (req, res) => {
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
exports.reorder = async (req, res) => {
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
exports.reviewProduct = async (req, res) => {
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
exports.momoCallback = async (req, res) => {
  try {
    const { orderId, resultCode, message, amount } = req.body;
    console.log('📩 MoMo Callback:', req.body);

    if (resultCode === 0) {
      await orderModel.markOrderPaid(orderId, amount, 'MoMo');
      return res.json({ success: true, message: 'Thanh toán thành công' });
    } else {
      await orderModel.markOrderFailed(orderId);
      return res.status(400).json({ success: false, message: `Thanh toán thất bại: ${message}` });
    }
  } catch (err) {
    console.error('❌ Lỗi momoCallback:', err);
    res.status(500).json({ success: false, message: 'Lỗi xử lý callback MoMo' });
  }
};
