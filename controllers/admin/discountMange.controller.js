const disCountMangeModel = require('../../modal/admin/discountManger.Medal');
const DisCount=require('../../helper/createDiscountMangerRamDom')
module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {
        trang_thai: req.query.status || undefined,
        search: req.query.search || undefined,
        deleted: 0,
        limit,
        offset,
    };

    try {
        const disCounts = await disCountMangeModel.GetAllDisCountManger(filters);
        res.json(disCounts);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách mã giảm giá' });
    }
};


module.exports.changeStatus = async (req, res) => {
    const { status, id } = req.params;
    const newStatus = status === 'active' ? 'inactive' : 'active';

    try {
        const result = await disCountMangeModel.updateStatus(newStatus, id);

        if (result.affectedRows === 0) {
            // Không tìm thấy id để cập nhật
            return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để cập nhật' });
        }

        res.json({ success: true, status: newStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái' });
    }
};


module.exports.changeMulti = async (req, res) => {
    const {ids,status } = req.body;

    try {
        await disCountMangeModel.updateProductsStatusMulti(ids, status); // Đảm bảo hàm này tồn tại trong model
        res.json({ success: true, message: "Thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái nhiều mã giảm giá" });
    }
};

module.exports.deletedId = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await disCountMangeModel.deleteItem(id);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Đã xoá sản phẩm thành công' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xoá' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi xoá sản phẩm' });
    }
};

module.exports.deleteMultiple = async (req, res) => {
    const { ids } = req.body;

    try {
        const result = await disCountMangeModel.deleteAll(ids);
        res.json({ success: true, affectedRows: result.affectedRows });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Lỗi server khi xóa sản phẩm' });
    }
};
module.exports.createDisCountManger = async (req, res) => {
      console.log('API createDiscountManger được gọi');

  try {
    const disCountManger = req.body;

   if (!disCountManger.ma_giam_gia || disCountManger.ma_giam_gia.trim() === '') {
  disCountManger.ma_giam_gia = DisCount.createDisCount(10);
}

    disCountManger.deleted = disCountManger.deleted ?? 0;
    disCountManger.so_luong_con_lai = disCountManger.so_luong_con_lai ?? disCountManger.so_luong;

    // Kiểm tra trùng mã
    const [rows] = await DisCount.checkCodeExists(disCountManger.ma_giam_gia);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã tồn tại' });
    }
console.log('Dữ liệu nhận được:', disCountManger);

    const result = await disCountMangeModel.createDiscountManger(disCountManger);
    return res.status(201).json({
      success: true,
      message: 'Tạo mã giảm giá thành công',
      insertId: result.insertId,
      ma_giam_gia: disCountManger.ma_giam_gia
    });
    
  } catch (error) {
    console.error('Lỗi khi tạo mã:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo mã' });
  }
};
module.exports.getEditDisCountMangerID = async (req,res)=>{
    const {id_giam_gia}=req.params;
    const data=await disCountMangeModel.GetDisCountMangerId(id_giam_gia);
    console.log(data);
    res.json(data);
}
module.exports.EditDisCountManger = async (req, res) => {
  try {
    const { id_giam_gia } = req.params;

    const {
      ten,
      loai,
      gia_tri,
      dieu_kien,
      ngay_bat_dau,
      ngay_ket_thuc,
      so_luong,
      trang_thai
    } = req.body;
    const [oldData] = await disCountMangeModel.GetDisCountMangerId(id_giam_gia);

    console.log(oldData);
    // Tạo object dữ liệu cần cập nhật
    const DisCountMangerUpdate = {
        ma_giam_gia:oldData.ma_giam_gia,
        so_luong_con_lai:oldData.so_luong_con_lai,
        deleted:oldData.deleted,
      ten,
      loai,
      gia_tri,
      dieu_kien,
      ngay_bat_dau,
      ngay_ket_thuc,
      so_luong,
      trang_thai
    };

    const result = await disCountMangeModel.EditDiscountManger(DisCountMangerUpdate, id_giam_gia);

    res.status(200).json({
      message: 'Sửa mã giảm giá thành công',
      data: result
    });

  } catch (error) {
    console.error('Lỗi khi sửa mã giảm giá:', error);
    res.status(500).json({
      message: 'Lỗi server khi sửa mã giảm giá',
      error: error.message
    });
  }
};
