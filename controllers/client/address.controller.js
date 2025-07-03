const addressModel = require('../../modal/client/address.model'); // Nếu folder là "modal"


exports.getAllAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;
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

exports.addAddress = async (req, res) => {
  try {
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

exports.updateAddress = async (req, res) => {
  try {
    const id = req.params.id;
    await addressModel.updateAddress(id, req.body);

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

exports.deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    await addressModel.deleteAddress(id);

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

exports.setDefaultAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_nguoi_dung } = req.body;

    await addressModel.setDefaultAddress(id, id_nguoi_dung);

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
