const VoucherModel = require('../../modal/client/voucher.model');

// 📌 1️⃣ Lấy danh sách voucher đang hoạt động
exports.getActiveVouchers = async (req, res) => {
  try {
    const vouchers = await VoucherModel.getAllActiveVouchers();
    res.status(200).json(vouchers);
  } catch (error) {
    console.error('❌ [getActiveVouchers] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách voucher' });
  }
};

// 📌 2️⃣ Lưu voucher
exports.saveVoucher = async (req, res) => {
  const { id_nguoi_dung, id_giam_gia } = req.body;
  if (!id_nguoi_dung || !id_giam_gia) {
    return res.status(400).json({ success: false, message: 'Thiếu id_nguoi_dung hoặc id_giam_gia' });
  }

  try {
    const voucher = await VoucherModel.getVoucherById(id_giam_gia);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher không tồn tại hoặc hết hạn' });
    }

    const result = await VoucherModel.saveVoucherForUser(id_nguoi_dung, id_giam_gia);
    if (result.existed) {
      return res.status(409).json({ success: false, message: 'Voucher này đã được lưu' });
    }

    res.status(200).json({ success: true, message: 'Đã lưu voucher thành công' });
  } catch (error) {
    console.error('❌ [saveVoucher] Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server khi lưu voucher' });
  }
};

// 📌 3️⃣ Lấy danh sách voucher đã lưu
exports.getSavedVouchers = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Thiếu userId' });
  }

  try {
    const savedVouchers = await VoucherModel.getSavedVouchersByUser(userId);
    res.status(200).json(savedVouchers);
  } catch (error) {
    console.error('❌ [getSavedVouchers] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy voucher đã lưu' });
  }
};

// 📌 4️⃣ Sử dụng voucher
exports.useVoucher = async (req, res) => {
  const { id_nguoi_dung, ma_giam_gia, tong_gia_tri } = req.body;
  if (!id_nguoi_dung || !ma_giam_gia || !tong_gia_tri) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  }

  try {
    const voucher = await VoucherModel.getVoucherByCode(ma_giam_gia);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc hết hạn' });
    }

    if (tong_gia_tri < parseFloat(voucher.dieu_kien || 0)) {
      return res.status(400).json({ success: false, message: `Đơn hàng phải từ ${voucher.dieu_kien} VNĐ để áp dụng voucher này` });
    }

    const gia_tri_giam = voucher.loai === 'phan_tram'
      ? (tong_gia_tri * voucher.gia_tri) / 100
      : parseFloat(voucher.gia_tri);

    const tong_sau_giam = tong_gia_tri - gia_tri_giam;

    res.status(200).json({
      success: true,
      message: 'Áp dụng voucher thành công',
      gia_tri_giam,
      tong_sau_giam
    });
  } catch (error) {
    console.error('❌ [useVoucher] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi áp dụng voucher' });
  }
};
