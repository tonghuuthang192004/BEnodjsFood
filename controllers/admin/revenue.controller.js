const RevenueModel =require('../../modal/admin/report.model')
exports.getRevenue = async (req, res) => {
  const { from, to, type } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Vui lòng cung cấp khoảng thời gian từ - đến' });
  }

  try {
    const data = await RevenueModel.revenue(from, to, type);
    res.json(data);
  } catch (err) {
    console.error('Lỗi khi lấy doanh thu:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu doanh thu' });
  }
};