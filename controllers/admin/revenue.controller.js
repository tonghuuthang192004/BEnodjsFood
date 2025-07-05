const RevenueModel =require('../../modal/admin/report.model')
module.exports.getRevenue = async (req, res) => {
  const { from, to, type } = req.query;

  if (!from || !to) {
    return res.status(400).json({ success: false, error: 'Vui lòng cung cấp khoảng thời gian từ - đến' });
  }

  try {
    const data = await RevenueModel.revenue(from, to, type);
    res.json({ success: true, data }); // ✅
  } catch (err) {
    console.error('Lỗi khi lấy doanh thu:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy dữ liệu doanh thu' });
  }
};



module.exports.getVAT = async (req, res) => {
  try {
    const { from, to, type = 'day' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Thiếu khoảng thời gian from/to' });
    }

    const data = await RevenueModel.VAT(from, to, type);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Lỗi khi lấy VAT:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy VAT' });
  }
};

module.exports.getDiscounts = async (req, res) => {
  try {
    const { from, to, type = 'day' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Thiếu khoảng thời gian from/to' });
    }

    const data = await RevenueModel.diCountMangerReport(from, to, type);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Lỗi khi lấy chiết khấu:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy chiết khấu' });
  }
};

module.exports.getPaymentMethods = async (req, res) => {
  try {
    const { from, to, type = 'day' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Thiếu khoảng thời gian from/to' });
    }

    const data = await RevenueModel.paymentMethod(from, to, type);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Lỗi khi lấy phương thức thanh toán:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy phương thức thanh toán' });
  }
};
