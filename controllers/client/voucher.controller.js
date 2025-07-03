const VoucherModel = require('../../modal/client/voucher.model');

// 📌 Lấy danh sách voucher đang hoạt động
exports.getActiveVouchers = async (req, res) => {
  try {
    const vouchers = await VoucherModel.getAllActiveVouchers();
    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    console.error('❌ [getActiveVouchers] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách voucher' });
  }
};

// 📌 Người dùng lưu voucher
exports.saveVoucher = async (req, res) => {
  const { id_nguoi_dung, id_giam_gia } = req.body;
  if (!id_nguoi_dung || !id_giam_gia) {
    return res.status(400).json({ success: false, message: 'Thiếu id_nguoi_dung hoặc id_giam_gia' });
  }

  try {
    const voucher = await VoucherModel.getVoucherById(id_giam_gia);
    if (!voucher.length) {
      return res.status(404).json({ success: false, message: 'Voucher không tồn tại hoặc hết hạn' });
    }

    const existed = await VoucherModel.isVoucherSavedByUser(id_nguoi_dung, id_giam_gia);
    if (existed) {
      return res.status(409).json({ success: false, message: 'Bạn đã lưu voucher này rồi' });
    }

    await VoucherModel.saveVoucherForUser(id_nguoi_dung, id_giam_gia);
    res.status(200).json({ success: true, message: 'Đã lưu voucher thành công' });
  } catch (error) {
    console.error('❌ [saveVoucher] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lưu voucher' });
  }
};

// 📌 Lấy danh sách voucher đã lưu của user
exports.getSavedVouchers = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Thiếu userId' });
  }

  try {
    const savedVouchers = await VoucherModel.getSavedVouchersByUser(userId);
    res.status(200).json({ success: true, data: savedVouchers });
  } catch (error) {
    console.error('❌ [getSavedVouchers] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy voucher đã lưu' });
  }
};

// 📌 Sử dụng voucher khi thanh toán
exports.useVoucher = async (req, res) => {
  const { id_nguoi_dung, ma_giam_gia, tong_gia_tri } = req.body;
  if (!id_nguoi_dung || !ma_giam_gia || !tong_gia_tri) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  }

  try {
    const voucher = await VoucherModel.getVoucherByCode(ma_giam_gia);
    if (!voucher.length) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc hết hạn' });
    }

    const v = voucher[0];
    if (tong_gia_tri < parseFloat(v.dieu_kien)) {
      return res.status(400).json({ success: false, message: `Đơn hàng phải từ ${v.dieu_kien} VNĐ để áp dụng voucher này` });
    }

    let gia_tri_giam = v.loai === 'phan_tram'
      ? (tong_gia_tri * v.gia_tri) / 100
      : parseFloat(v.gia_tri);
    const tong_sau_giam = tong_gia_tri - gia_tri_giam;

    await VoucherModel.decrementVoucherQuantity(v.id_giam_gia);

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
