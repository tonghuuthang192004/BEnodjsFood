  // Get /admin/products
  const product=require('../../modal/productModal');
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

module.exports.createProductItem = async(req,res)=>{
  

  try{
    const {filename}=req.file
    const Product={...req.body,hinh_anh:filename};
    const result=await product.createProduct(Product)
    console.log("Thêm sản phẩm thành công",{result});
    res.status(201).json({ message: 'Thêm sản phẩm thành công', data: result });
  }
  catch(error)
  {
    console.error("lỗi khi thêm sản phẩm")
    res.status(500).json({ message: 'Lỗi server khi thêm sản phẩm', error: error.message });

  }
  console.log(req.file);
}

module.exports.editProduct = async (req, res) => {
  try {
    console.log('Dữ liệu nhận để sửa:', req.body); // Log dữ liệu nhận vào
    const Product = req.body;
    const result = await product.updateProduct(Product);
    console.log("Sửa sản phẩm thành công", { result });
    res.status(201).json({ message: 'Sửa sản phẩm thành công', data: result });
  } catch (error) {
    console.error("Lỗi khi sửa sản phẩm:", error.message);
    res.status(500).json({ message: 'Lỗi server khi sửa sản phẩm', error: error.message });
  }
};
