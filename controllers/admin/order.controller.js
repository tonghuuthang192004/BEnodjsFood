
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
    // Kiểm tra trạng thái hợp lệ (nếu bạn muốn kiểm soát)
    const validStatuses = ['Đang xử lý', 'Xác nhận', 'Chờ thanh toán', 'Đã giao', 'Đã hủy'];
    if (!validStatuses.includes(trang_thai)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    // Gọi model để cập nhật trạng thái
    const updatedOrder = await orderModel.updateOrderStatus(id, trang_thai);
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
