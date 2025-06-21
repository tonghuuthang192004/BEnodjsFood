module.exports.creatPost =(req,res,next)=>{
 const { ten, id_danh_muc, gia, mo_ta, trang_thai } = req.body;
    const file = req.file;

    // ==== VALIDATE BẮT BUỘC ====
    if (!ten || !ten.trim()) {
      return res.status(400).json({ message: 'Tên sản phẩm là bắt buộc' });
    }

    if (!id_danh_muc || isNaN(Number(id_danh_muc))) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ' });
    }

    if (!gia || isNaN(gia) || gia <= 0) {
      return res.status(400).json({ message: 'Giá phải là số lớn hơn 0' });
    }

    if (!trang_thai || !['active', 'inactive'].includes(trang_thai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    if (!mo_ta || !mo_ta.trim()) { // <- sai điều kiện ban đầu (kiểm tra theo ['active', 'inactive'])
  return res.status(400).json({ message: 'Mô tả là bắt buộc' });
}

    if (!file || !file.filename) {
      return res.status(400).json({ message: 'Ảnh sản phẩm là bắt buộc' });
    }

    next();
}