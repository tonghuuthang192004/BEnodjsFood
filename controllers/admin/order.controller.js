
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
    
        res.json({ success: true, product: data });
      } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
}
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    if (!trang_thai) {
      return res.status(400).json({ success: false, message: 'Trạng thái mới không được để trống' });
    }

    await orderModel.updateOrderStatus(id, trang_thai);

    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái đơn hàng' });
  }
};
