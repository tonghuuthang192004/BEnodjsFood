const { url } = require('inspector');
const codmodel = require('../../modal/admin/CodPaymet')
const axios = require('axios');
const db = require('../../config/database'); // đường dẫn tuỳ theo dự án bạn

const crypto = require('crypto');
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // key giống trong payMentMomo
var accessKey = 'F8BBA842ECF85'; // test, thay bằng của bạn
module.exports.payOrderCODController = async (req, res) => {
  const orderId = req.params.id; // lấy id từ params
  try {
    const result = await codmodel.payOrderCOD(orderId);
    res.json({ success: true, message: 'Thanh toán được COD ghi nhận', data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }

};


// module.exports.payMentMomo = async (req, res) => {
//   var orderInfo = 'pay with MoMo';
//   var partnerCode = 'MOMO';
//   var redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
//   var ipnUrl = 'https://aa61-2402-800-63ac-9375-686b-c5df-f8fc-2535.ngrok-free.app/admin/cod/callback';
//   var requestType = "payWithMethod";
//   var amount = '50000';
//   var orderId = partnerCode + new Date().getTime();
//   var requestId = orderId;
//   var extraData = '';
//   var orderGroupId = '';
//   var autoCapture = true;
//   var lang = 'vi';

//   var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
//   console.log("--------------------RAW SIGNATURE----------------")
//   console.log(rawSignature)

//   var signature = crypto.createHmac('sha256', secretKey)
//     .update(rawSignature)
//     .digest('hex');
  
//   console.log("--------------------SIGNATURE----------------")
//   console.log(signature)

//   const requestBody = {
//     partnerCode: partnerCode,
//     partnerName: "Test",
//     storeId: "MomoTestStore",
//     requestId: requestId,
//     amount: amount,
//     orderId: orderId,
//     orderInfo: orderInfo,
//     redirectUrl: redirectUrl,
//     ipnUrl: ipnUrl,
//     lang: lang,
//     requestType: requestType,
//     autoCapture: autoCapture,
//     extraData: extraData,
//     orderGroupId: orderGroupId,
//     signature: signature
//   };

//   const option = {
//     method: "POST",
//     url: 'https://test-payment.momo.vn/v2/gateway/api/create',
//     headers: {
//       'Content-Type': 'application/json',
//       'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
//     },
//     data: requestBody
//   };

//   try {
//     const result = await axios(option);
//     // trả kết quả về client
//     return res.status(200).json(result.data);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

module.exports.callback = async (req, res) => {
  console.log("📥 MoMo callback nhận:", req.body);
  // res.send('ok'); // <-- Remove this line

  const {
    orderId,    // momo_order_id
    amount,
    resultCode,
    message,
    transId,
  } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "❌ Thiếu orderId trong dữ liệu callback"
    });
  }

  try {
    if (resultCode === 0) {
      // 1. Tìm đơn hàng
      const [orders] = await db.query(
        'SELECT * FROM don_hang WHERE momo_order_id = ?',
        [orderId]
      );

      if (!orders.length) {
        // Even if the order isn't found, MoMo successfully delivered the callback.
        // Respond with 200 OK to acknowledge receipt, but indicate the internal error.
        return res.status(200).json({ // Changed to 200 OK here
          success: false,
          message: "❌ Không tìm thấy đơn hàng"
        });
      }

      const order = orders[0];
      const idDonHang = order.id_don_hang;

      // 2. Xử lý thanh toán
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
        console.log('✅ Insert thanh toán');
      } else {
        await db.query(
          `UPDATE thanh_toan
          SET trang_thai = 'Đã thanh toán', ngay_thanh_toan = NOW()
          WHERE id_don_hang = ? AND phuong_thuc = 'MoMo'`,
          [idDonHang]
        );
        console.log('🔁 Update thanh toán');
      }

      // 3. Cập nhật đơn hàng
      await db.query(
        `UPDATE don_hang
        SET trang_thai = ?, trang_thai_thanh_toan = ?, phuong_thuc_thanh_toan = ?
        WHERE id_don_hang = ?`,
        ['Đã giao', 'Đã thanh toán', 'MoMo', idDonHang]
      );
      console.log('📦 Đã cập nhật đơn hàng');

      // 4. Lưu lịch sử
      await db.query(
        `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
         VALUES (?, NOW(), ?, ?)`,
        [idDonHang, 'Đã giao', 'Thanh toán MoMo thành công']
      );

      // This is the correct and final response for a successful MoMo processing
      return res.status(200).json({
        success: true,
        message: "✅ Đã xử lý callback MoMo thành công"
      });
    } else {
      // For a failed payment from MoMo, respond with 200 OK to acknowledge receipt
      // but indicate the failure in your JSON response.
      return res.status(200).json({ // Changed to 200 OK here
        success: false,
        message: `❌ Thanh toán thất bại từ MoMo: ${message}`,
        resultCode
      });
    }
  } catch (error) {
    console.error('❌ Lỗi xử lý callback:', error);
    // In case of a server error during processing, still try to respond with 200 OK
    // to MoMo to acknowledge the callback, but indicate internal server error.
    return res.status(200).json({ // Changed to 200 OK here
      success: false,
      message: "Lỗi server nội bộ khi xử lý MoMo callback", // More specific message
      error: error.message
    });
  }
};



module.exports.statusPayment = async (req, res) => {
  try {
    const { id_don_hang } = req.body;  // id đơn hàng bạn gửi từ client

    // Mình giả sử orderId = id_don_hang (nếu khác thì sửa lại)
    const orderId = id_don_hang;
    const requestId = id_don_hang;

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${requestId}`;

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: "MOMO",
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi'
    };

    const option = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/query',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody
    };

    const response = await axios(option);

    // Trả kết quả về client
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Lỗi truy vấn trạng thái thanh toán:', error);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
      error: error.message
    });
  }
};