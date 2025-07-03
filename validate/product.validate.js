const product =require('../modal/admin/productModal')
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
    if (!mo_ta || !mo_ta.trim()) { 
  return res.status(400).json({ message: 'Mô tả là bắt buộc' });
}

    if (!file || !file.filename) {
      return res.status(400).json({ message: 'Ảnh sản phẩm là bắt buộc' });
    }

    next();
}
module.exports.editProduct = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ (body không tồn tại)' });
  }

  const { ten, id_danh_muc, gia, mo_ta, trang_thai } = req.body;
  const file = req.file;
  const id_san_pham = req.params.id_san_pham;  // Lấy ID sản phẩm từ URL

  // Kiểm tra dữ liệu đầu vào
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

  if (!mo_ta || !mo_ta.trim()) {
    return res.status(400).json({ message: 'Mô tả là bắt buộc' });
  }

  // Lấy sản phẩm hiện tại từ database để lấy ảnh cũ nếu không có ảnh mới
  const existingProduct = await product.getAllProductsId(id_san_pham);
  if (!existingProduct) {
    return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
  }

  // Nếu không có ảnh mới, sử dụng ảnh cũ
  const hinh_anh = file ? file.filename : existingProduct.hinh_anh;

  // Kiểm tra ảnh nếu không có cả ảnh mới và ảnh cũ
  if (!hinh_anh) {
    return res.status(400).json({ message: 'Ảnh sản phẩm là bắt buộc' });
  }

  // Gán lại các giá trị vào request body để xử lý tiếp
  req.body.hinh_anh = hinh_anh;

  // Tiến hành tiếp tục xử lý (hoặc gọi next())
  next();
};
