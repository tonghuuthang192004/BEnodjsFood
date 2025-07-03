const addressModel = require('../../modal/client/address.model');

// 📥 Lấy tất cả địa chỉ của người dùng
exports.getAllAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId trong URL'
      });
    }

    const addresses = await addressModel.getAllAddresses(userId);

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('❌ [getAllAddresses] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách địa chỉ'
    });
  }
};

// ➕ Thêm địa chỉ mới
exports.addAddress = async (req, res) => {
  try {
    const { id_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh } = req.body;

    if (!id_nguoi_dung || !ten_nguoi_nhan || !so_dien_thoai || !dia_chi_day_du) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết để thêm địa chỉ'
      });
    }

    await addressModel.addAddress(req.body);

    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ thành công'
    });
  } catch (error) {
    console.error('❌ [addAddress] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm địa chỉ'
    });
  }
};

// ✏️ Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu id địa chỉ trong URL'
      });
    }

    if (!id_nguoi_dung || !ten_nguoi_nhan || !so_dien_thoai || !dia_chi_day_du) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết để cập nhật địa chỉ'
      });
    }

    const result = await addressModel.updateAddress(id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ để cập nhật'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật địa chỉ thành công'
    });
  } catch (error) {
    console.error('❌ [updateAddress] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật địa chỉ'
    });
  }
};

// 🗑️ Xoá địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu id địa chỉ trong URL'
      });
    }

    const result = await addressModel.deleteAddress(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ để xoá'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xoá địa chỉ thành công'
    });
  } catch (error) {
    console.error('❌ [deleteAddress] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xoá địa chỉ'
    });
  }
};

// 🌟 Đặt địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_nguoi_dung } = req.body;

    if (!id || !id_nguoi_dung) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu id hoặc id_nguoi_dung'
      });
    }

    const result = await addressModel.setDefaultAddress(id, id_nguoi_dung);

    res.status(200).json({
      success: true,
      message: 'Đặt địa chỉ mặc định thành công'
    });
  } catch (error) {
    console.error('❌ [setDefaultAddress] Error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
