const addressModel = require('../../modal/client/address.model');

exports.getAllAddresses = async (req, res) => {
  try {
    const userId = req.user.id_nguoi_dung || req.user.id;
    const addresses = await addressModel.getAddresses(userId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error('❌ [getAllAddresses] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id_nguoi_dung || req.user.id;
    const { ten_nguoi_dung, so_dien_thoai, dia_chi_day_du } = req.body;

    if (!ten_nguoi_dung || !so_dien_thoai || !dia_chi_day_du) {
      return res.status(400).json({ success: false, message: '! Thiếu thông tin cần thiết' });
    }

    await addressModel.addAddress({
      id_nguoi_dung: userId,
      ten_nguoi_dung,
      so_dien_thoai,
      dia_chi_day_du
    });

    res.status(201).json({ success: true, message: '✅ Thêm địa chỉ thành công' });
  } catch (error) {
    console.error('❌ [addAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm địa chỉ' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { ten_nguoi_dung, so_dien_thoai, dia_chi_day_du } = req.body;

    if (!ten_nguoi_dung || !so_dien_thoai || !dia_chi_day_du) {
      return res.status(400).json({ success: false, message: '! Thiếu thông tin cần thiết' });
    }

    await addressModel.updateAddress(id, {
      ten_nguoi_dung,
      so_dien_thoai,
      dia_chi_day_du
    });

    res.status(200).json({ success: true, message: '✅ Cập nhật địa chỉ thành công' });
  } catch (error) {
    console.error('❌ [updateAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật địa chỉ' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await addressModel.deleteAddress(id);
    res.status(200).json({ success: true, message: '🗑️ Xoá địa chỉ thành công' });
  } catch (error) {
    console.error('❌ [deleteAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xoá địa chỉ' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id_nguoi_dung || req.user.id;
    const { id } = req.params;

    await addressModel.setDefaultAddress(userId, id);

    res.status(200).json({ success: true, message: '✅ Đặt địa chỉ mặc định thành công' });
  } catch (error) {
    console.error('❌ [setDefaultAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đặt mặc định' });
  }
};
