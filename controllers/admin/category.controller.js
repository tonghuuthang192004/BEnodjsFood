const category =require('../../modal/categoryMedal')
// module.exports.index = async(req, res) =>{
//  try {

//   const page=parseInt(req.require.page)||1
//    const data= await category.categoryAll();
//     res.json(data);
//   } catch (err) {
//     console.error('Lỗi khi đổi trạng thái:', err);
//     res.status(500).json({ error: 'Đổi trạng thái thất bại' });
//   }
// }




// Lấy tất cả danh mục




// Lấy danh mục theo ID

// Xóa mềm 1 danh mục
module. exports.deleteId = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await category.deleteItem(id);
    res.json({ message: 'Xóa thành công', result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
  }
};

// Xóa mềm nhiều danh mục
module. exports.deleteMultiple = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await category.deleteAll(ids);
    res.json({ message: 'Đã xóa nhiều danh mục', result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa nhiều danh mục', error: error.message });
  }
};


// Lấy tất cả danh mục
module.exports.index = async (req, res) => {
  try {
    const filters = {
      deleted: req.query.deleted !== undefined ? parseInt(req.query.deleted) : undefined,
      search: req.query.search || '',
      limit: req.query.limit ? parseInt(req.query.limit) : 10,  // Mặc định 10 nếu không có limit
      offset: req.query.offset ? parseInt(req.query.offset) : 0, // Mặc định offset = 0
    };

    // Kiểm tra giá trị filter
    if (isNaN(filters.limit) || filters.limit <= 0) filters.limit = 10;
    if (isNaN(filters.offset) || filters.offset < 0) filters.offset = 0;

    const data = await category.categoryAlls(filters);
    res.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error: error.message });
  }
};

// Lấy danh mục theo ID
module.exports.getEditCategory = async (req, res) => {
  try {
    const id_danh_muc = req.params.id_danh_muc;  // Chú ý thay 'id' thành 'id_danh_muc'
    const data = await category.getAllCategoryId(id_danh_muc);
    if (!data) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: error.message });
  }
};

// Thêm danh mục
module.exports.createCategoryItem = async (req, res) => {
  try {
    const category = req.body;
    const now = new Date();
    category.ngay_tao = now;
    category.ngay_cap_nhat = now;
    category.deleted = 0;

    // Xử lý trường hợp không có hình ảnh được tải lên
    if (req.file) {
      category.hinh_anh = req.file.path;  // Lưu đường dẫn file hình ảnh
    }

    const result = await category.createCategory(category);
    res.status(201).json({ message: 'Tạo danh mục thành công', result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

// Cập nhật danh mục
module.exports.update = async (req, res) => {
  try {
    const id = req.params.id_danh_muc;  // Đảm bảo sử dụng id_danh_muc
    const category = req.body;

    // Xử lý hình ảnh nếu có
    if (req.file) {
      category.hinh_anh = req.file.path;  // Lưu đường dẫn file hình ảnh
    }

    const result = await category.updateCategory(category, id);
    res.json({ message: 'Cập nhật thành công', result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error: error.message });
  }
};

// Cập nhật trạng thái 1 danh mục
module.exports.changeStatus = async (req, res) => {
  const { id_danh_muc, status } = req.params;
  const newStatus = status === 'active' ? 'inactive' : 'active'; // Switch status
  
  try {
    await category.updateCategoryStatus(id_danh_muc, newStatus);
    res.json({ success: true, status: newStatus });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
  }
};

// Cập nhật trạng thái nhiều danh mục
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, newStatus } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ' });
    }

    const result = await category.updateCategoryStatusMulti(ids, newStatus);
    res.json({ message: 'Cập nhật trạng thái nhiều danh mục thành công', result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái nhiều danh mục', error: error.message });
  }
};
