const { url } = require('inspector');
const paymentModel = require('../../modal/client/payment.model');
const codModel = require('../../modal/client/cod.model');
const momoModel = require('../../modal/client/momo.model');
const axios = require('axios');
const db = require('../../config/database');
const crypto = require('crypto');

const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // key test MoMo
const accessKey = 'F8BBA842ECF85'; // key test MoMo
  // ✅ Ghi nhận COD khi đặt hàng
module.exports.payOrderCODController = async (req, res) => {
  const orderId = req.params.id;
  try {
    const result = await codModel.payOrderCOD(orderId);
    res.json({ success: true, message: '✅ Thanh toán COD được ghi nhận', data: result });
  } catch (err) {
    console.error('❌ Lỗi payOrderCODController:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};


module.exports.callback = async (req, res) => {
  console.log("📥 [MoMo Callback] Dữ liệu nhận được:", req.body);

  const {
    orderId,    // momo_order_id
    amount,
    resultCode,
    message,
    transId,
  } = req.body;

  if (!orderId) {
    return res.status(200).json({
      success: false,
      message: "❌ Thiếu orderId trong dữ liệu callback"
    });
  }

  try {
    if (resultCode === 0) {
      // 🔍 1. Tìm đơn hàng
      const [orders] = await db.query(
        'SELECT * FROM don_hang WHERE momo_order_id = ?',
        [orderId]
      );

      if (!orders.length) {
        console.warn(`⚠️ Không tìm thấy đơn hàng với momo_order_id: ${orderId}`);
        return res.status(200).json({
          success: false,
          message: "❌ Không tìm thấy đơn hàng"
        });
      }

      const order = orders[0];
      const idDonHang = order.id_don_hang;

      // ✅ Kiểm tra số tiền MoMo trả có khớp không
      if (parseInt(amount) !== parseInt(order.tong_gia)) {
        console.error(`❌ Số tiền không khớp. MoMo gửi: ${amount}, hệ thống: ${order.tong_gia}`);
        return res.status(200).json({
          success: false,
          message: "❌ Số tiền thanh toán không khớp"
        });
      }

      // 💳 2. Xử lý thanh toán
      const [existing] = await db.query(
        'SELECT * FROM thanh_toan WHERE id_don_hang = ? AND phuong_thuc = ?',
        [idDonHang, 'MoMo']
      );

      if (!existing.length) {
        await db.query(
          `INSERT INTO thanh_toan
          (id_don_hang, so_tien, phuong_thuc, trang_thai, ngay_thanh_toan)
          VALUES (?, ?, 'MoMo', 'Đã thanh toán', NOW())`,
          [idDonHang, amount]
        );
        console.log('✅ Insert thanh toán MoMo');
      } else {
        await db.query(
          `UPDATE thanh_toan
          SET trang_thai = 'Đã thanh toán', ngay_thanh_toan = NOW()
          WHERE id_don_hang = ? AND phuong_thuc = 'MoMo'`,
          [idDonHang]
        );
        console.log('🔁 Update thanh toán MoMo');
      }

      // 📦 3. Cập nhật đơn hàng
      await db.query(
        `UPDATE don_hang
        SET trang_thai = ?, trang_thai_thanh_toan = ?, phuong_thuc_thanh_toan = ?
        WHERE id_don_hang = ?`,
        ['Đã giao', 'Đã thanh toán', 'MoMo', idDonHang]
      );
      console.log('📦 Đã cập nhật trạng thái đơn hàng');

      // 📝 4. Lưu lịch sử đơn hàng
      await db.query(
        `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
        VALUES (?, NOW(), ?, ?)`,
        [idDonHang, 'Đã giao', 'Thanh toán MoMo thành công']
      );

      return res.status(200).json({
        success: true,
        message: "✅ Đã xử lý callback MoMo thành công"
      });
    } else {
      // ❌ Xử lý trường hợp thanh toán thất bại
      console.warn(`❌ Thanh toán thất bại từ MoMo. resultCode=${resultCode}, message=${message}`);
      return res.status(200).json({
        success: false,
        message: `❌ Thanh toán thất bại từ MoMo: ${message}`,
        resultCode
      });
    }
  } catch (error) {
    console.error('❌ Lỗi xử lý callback MoMo:', error);
    return res.status(200).json({
      success: false,
      message: "❌ Lỗi server khi xử lý callback MoMo",
      error: error.message
    });
  }
};


  // ✅ Xác nhận COD (khi nhân viên hoặc khách check)
module.exports.confirmCod = async (req, res) => {
  try {
    const { id_don_hang } = req.body;
    const userId = req.user.id; // Lấy từ token

    if (!id_don_hang) {
      return res.status(400).json({ success: false, message: '❌ Thiếu ID đơn hàng' });
    }

    const success = await paymentModel.confirmCodPayment(id_don_hang, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '❌ Không tìm thấy đơn hàng hoặc bạn không có quyền'
      });
    }

    res.status(200).json({
      success: true,
      message: '✅ Xác nhận COD thành công'
    });
  } catch (err) {
    console.error('❌ Lỗi confirmCod:', err);
    res.status(500).json({
      success: false,
      message: '❌ Lỗi server khi xác nhận COD',
      error: err.message
    });
  }
};


// ✅ Check trạng thái thanh toán MoMo
module.exports.statusPayment = async (req, res) => {
  try {
    const { id_don_hang } = req.body;
    const orderId = id_don_hang;
    const requestId = id_don_hang;

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${requestId}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = {
      partnerCode: "MOMO",
      requestId,
      orderId,
      signature,
      lang: 'vi'
    };

    const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Lỗi truy vấn trạng thái thanh toán:', error);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
      error: error.message
    });
  }
};
