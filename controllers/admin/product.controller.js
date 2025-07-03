  // Get /admin/products
  const product=require('../../modal/admin/productModal');
  // console.log(product);
  module.exports.index = async (req, res) => {
    
    
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      status: req.query.status || undefined,
      search: req.query.search || undefined,
      deleted: 0,
      limit,
      offset,
    };

    const products = await product.getAllProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy sản phẩm' });
  }

  }

  // change Status
 module.exports.changeStatus = async (req, res) => {
   const { status, id } = req.params;
  const newStatus = status === 'active' ? 'inactive' : 'active';

  try {
    await product.updateProductStatus(id, newStatus); // truyền đúng newStatus
    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('Lỗi khi đổi trạng thái:', err);
    res.status(500).json({ error: 'Đổi trạng thái thất bại' });
  }
  // console.log('Status:', status);
  // console.log('ID:', id);

  // res.send(`Status: ${status}, ID: ${id}`);

  // res.redirect
}

module.exports.changeMulti = async (req,res) => {
  const{ ids,status}=req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Danh sách sản phẩm không hợp lệ' });
  }

  try {
    // Cập nhật trạng thái cho tất cả sản phẩm được chọn
    await  product.updateProductsStatusMulti(ids, status);
    res.json({ success: true, message: `Đã cập nhật trạng thái cho ${ids.length} sản phẩm.` });
  } catch (err) {
    console.error('Lỗi khi đổi trạng thái:', err);
    res.status(500).json({ error: 'Đổi trạng thái thất bại' });
  }
  
}
module.exports.deleteId= async (req,res)=>{

  const id=req.params.id;
  try {
    const result = await product.deleteItem(id);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Đã xoá sản phẩm thành công' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xoá' });
    }
  } catch (error) {
    console.error('Lỗi khi xoá sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xoá sản phẩm' });
  }
}

module.exports.deleteMultiple =async(req,res)=>{
  const {ids}=req.body;
  try {
    const result=await product.deleteAll(ids);
    res.json({success:true,affectedRows:result.affectedRows});
  }
  catch(error)
  {
      res.status(400).json({ success: false, message: error.message || 'Lỗi server khi xóa sản phẩm' });

  }
}
module.exports.createProductItem = async (req, res) => {
  try {
   
    // ==== TẠO SẢN PHẨM ====
    const Product = {
      ...req.body,
      hinh_anh: req.file ? req.file.filename : null, // ✅ Sửa tại đây
    };

    const result = await product.createProduct(Product);
    console.log("✅ Thêm sản phẩm thành công", result);

    return res.status(201).json({
      message: 'Thêm sản phẩm thành công',
      data: result
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    return res.status(500).json({
      message: 'Lỗi server khi thêm sản phẩm',
      error: error.message,
    });
  }
};



module.exports.getEditProduct = async (req, res) => {
  const { id_san_pham } = req.params;
  try {
    console.log("Fetching product with ID:", id_san_pham); // Log ID sản phẩm nhận được từ URL
    const result = await product.getAllProductsId(id_san_pham);

    if (!result) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    console.log("Product data:", result);  // Log dữ liệu sản phẩm

    res.json(result); // Trả về dữ liệu sản phẩm
  } catch (error) {
    console.error("Server error:", error);  // Log lỗi từ server
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports.editProduct = async (req, res) => {
  try {
    // console.log('Body:', req.body);
    // console.log('File:', req.file);
    const id_san_pham = req.params.id_san_pham;
    const file = req.file;
    const {
      ten,
      id_danh_muc,
      gia,
      mo_ta,
      trang_thai,
    } = req.body;

    // Lấy sản phẩm hiện tại từ DB (để lấy ảnh cũ)
    const existingProduct = await product.getAllProductsId(id_san_pham);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Nếu có file mới thì lấy tên file mới, còn không thì lấy ảnh cũ từ DB
    const hinh_anh = file ? file.filename : existingProduct.hinh_anh;

    // Kiểm tra ảnh (bắt buộc phải có ảnh, ảnh cũ hoặc mới)
    if (!hinh_anh) {
      return res.status(400).json({ message: 'Ảnh sản phẩm là bắt buộc' });
    }

    // Tạo object update
    const productUpdate = {
      ten,
      id_danh_muc,
      gia,
      mo_ta,
      trang_thai,
      hinh_anh,
    };

    // Cập nhật sản phẩm
    const result = await product.updateProduct(productUpdate, id_san_pham);

    res.status(200).json({ message: 'Sửa sản phẩm thành công', data: result });
  } catch (error) {
    console.error('Lỗi khi sửa sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server khi sửa sản phẩm', error: error.message });
  }
};


module.exports.productDetail = async (req, res) => {
  try {
    const { id_san_pham } = req.params;

    if (!id_san_pham) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const data = await product.getAllProductsId(id_san_pham);

    if (!data) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
