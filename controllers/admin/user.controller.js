const user = require('../../modal/admin/user.Medal');
console.log(user);
// Lấy danh sách người dùng
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

    const users = await user.getAllUser(filters);
    res.json(users);
  } catch (error) {
    console.error('Lỗi lấy người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy người dùng' });
  }
};

// Thay đổi trạng thái một người dùng
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;
  const newStatus = status === 'active' ? 'inactive' : 'active';

  try {
    await user.updateUserStatus(id, newStatus);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('Lỗi khi đổi trạng thái:', err);
    res.status(500).json({ error: 'Đổi trạng thái thất bại' });
  }
};

// Thay đổi trạng thái nhiều người dùng
module.exports.changeMulti = async (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Danh sách người dùng không hợp lệ' });
  }

  try {
    await user.updateUserStatusMulti(ids, status);
    res.json({ success: true, message: `Đã cập nhật trạng thái cho ${ids.length} người dùng.` });
  } catch (err) {
    console.error('Lỗi khi đổi trạng thái:', err);
    res.status(500).json({ error: 'Đổi trạng thái thất bại' });
  }
};

// Xóa 1 người dùng
module.exports.deleteId = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await user.deleteItem(id);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Đã xoá người dùng thành công' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để xoá' });
    }
  } catch (error) {
    console.error('Lỗi khi xoá người dùng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xoá người dùng' });
  }
};

// Xóa nhiều người dùng
module.exports.deleteMultiple = async (req, res) => {
  const { ids } = req.body;
  try {
    const result = await user.deleteAll(ids);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi server khi xóa người dùng' });
  }
};

// Tạo người dùng mới
module.exports.createUser = async (req, res) => {
  try {
    const newUser = {
      ...req.body,
      avatar: req.file ? req.file.filename : null,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      deleted: 0,
    };
    const result = await user.createUser(newUser);
    res.status(201).json({ message: 'Thêm người dùng thành công', data: result });
  } catch (error) {
    console.error('❌ Lỗi khi thêm người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm người dùng', error: error.message });
  }
};

// Lấy thông tin 1 người dùng
module.exports.getEditUser = async (req, res) => {
  const { id_nguoi_dung } = req.params;
  try {
    const result = await user.getAllUserId(id_nguoi_dung);

    if (!result) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật người dùng
module.exports.editUser = async (req, res) => {
  try {
    const { id_nguoi_dung } = req.params;
    const file = req.file;

    const {
      id_vai_tro,
      ten,
      email,
      so_dien_thoai,
      trang_thai,
    } = req.body;

    const existingUser = await user.getAllUserId(id_nguoi_dung);
    if (!existingUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const avatar = file ? file.filename : existingUser.avatar;

    const userUpdate = {
      id_vai_tro,
      ten,
      email,
      so_dien_thoai,
      trang_thai,
      avatar,
    };

    const result = await user.updateUser(userUpdate, id_nguoi_dung);
    res.status(200).json({ message: 'Cập nhật người dùng thành công', data: result });
  } catch (error) {
    console.error('Lỗi khi sửa người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi sửa người dùng', error: error.message });
  }
};
