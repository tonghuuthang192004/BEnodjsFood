
const orderModel=require('../../modal/admin/orderMedal');
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // đổi theo bạn
const accessKey = 'F8BBA842ECF85'; // đổi theo bạn
const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment');

const db=require('../../config/database');


module.exports.getOrder = async (req, res) => {
  try {
     const page = req.query.page ? parseInt(req.query.page) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const offset = page && limit ? (page - 1) * limit : undefined;
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const offset = (page - 1) * limit;

    const filters = {
      status: req.query.status || undefined,
      search: req.query.search || undefined,
      deleted: 0,
      limit,
      offset
    };

    const data = await orderModel.getOrder(filters);
    res.json(data);
  } catch (error) {
    console.error("Lỗi đơn hàng:", error);
    res.status(500).json({ error: 'Lỗi server khi lấy đơn hàng' });
  }
};
module.exports.detailOrder=async (req,res)=>{
      try {
        const { id} = req.params;
    
      
    const data = await orderModel.orderDetail(id);
    
        res.json({ success: true, order: data[0] });
      } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
}
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    const validStatuses = ['Đang xử lý', 'Xác nhận', 'Chờ thanh toán', 'Đã giao', 'Đã hủy'];
    if (!validStatuses.includes(trang_thai)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    // Nếu trạng thái là "Đã giao" thì mặc định cập nhật thanh toán là "Đã thanh toán"
    const newPaymentStatus = trang_thai === 'Đã giao' ? 'Đã thanh toán' : undefined;

    const updatedOrder = await orderModel.updateOrderStatus(id, trang_thai, newPaymentStatus);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật trạng thái đơn hàng'
    });
  }
};

module.exports.updatePaymentStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai_thanh_toan } = req.body;

    // Kiểm tra trạng thái thanh toán hợp lệ
    const validPaymentStatuses = ['Chưa thanh toán', 'Đã thanh toán', 'Thanh toán thất bại'];
    if (!validPaymentStatuses.includes(trang_thai_thanh_toan)) {
      return res.status(400).json({ success: false, message: 'Trạng thái thanh toán không hợp lệ' });
    }

    // Gọi model cập nhật trạng thái thanh toán
    const updatedOrder = await orderModel.updatePaymentStatus(id, trang_thai_thanh_toan);

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Lỗi cập nhật trạng thái thanh toán:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

// module.exports.createOrder = async (req, res) => {
//   const orderData = req.body; // Dữ liệu đơn hàng từ client (body của request)
  
//   try {
//     // Gọi hàm createOrder đã được định nghĩa
//     const orderId = await orderModel.createOrder(orderData); // orderService là nơi bạn đã định nghĩa các chức năng liên quan đến DB.

//     // Trả về thông tin đơn hàng vừa tạo
//     res.status(201).json({
//       message: 'Đơn hàng đã được tạo thành công.',
//       orderId: orderId
//     });
    
//   } catch (err) {
//     console.error('Error while creating order:', err);
//     res.status(500).json({
//       message: 'Đã có lỗi xảy ra khi tạo đơn hàng.',
//       error: err.message
//     });
//   }
// }
// };
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

  var ipnUrl = 'https://a075-2402-800-63ac-8971-7828-7380-b173-e3b2.ngrok-free.app/admin/cod/callback';
      // const momoOrderId = 'MOMO_' + Date.now(); // orderId gửi MoMo
      const requestId = 'REQ_' + Date.now();
      const extraData = '';

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momo_order_id}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

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
