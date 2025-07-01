
const orderModel=require('../../modal/orderMedal');
module.exports.getOrder= async (req,res)=>{
    const {status}=req.query
    const data=await orderModel.getOrder(status);
    res.json(data);
    

}
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

module.exports.createOrder = async (req, res) => {
  const orderData = req.body; // Dữ liệu đơn hàng từ client (body của request)
  
  try {
    // Gọi hàm createOrder đã được định nghĩa
    const orderId = await orderModel.createOrder(orderData); // orderService là nơi bạn đã định nghĩa các chức năng liên quan đến DB.

    // Trả về thông tin đơn hàng vừa tạo
    res.status(201).json({
      message: 'Đơn hàng đã được tạo thành công.',
      orderId: orderId
    });
    
  } catch (err) {
    console.error('Error while creating order:', err);
    res.status(500).json({
      message: 'Đã có lỗi xảy ra khi tạo đơn hàng.',
      error: err.message
    });
  }
};
