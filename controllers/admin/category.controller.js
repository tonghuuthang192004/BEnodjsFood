const categoryController = require('../../controllers/admin/category.controller');
const category =require('../../modal/categoryMedal')
module.exports.index = async(req, res) =>{
 try {
   const data= await category.categoryAll();
    res.json(data);
  } catch (err) {
    console.error('Lỗi khi đổi trạng thái:', err);
    res.status(500).json({ error: 'Đổi trạng thái thất bại' });
  }
}