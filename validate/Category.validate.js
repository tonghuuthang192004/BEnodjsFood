const Category =require('../modal/admin/categoryMedal')
module.exports.createPost =(req,res,next)=>{
if (!req.body.ten || req.body.ten.trim() === '') {
    return res.status(400).json({ message: 'Tên không được để trống' });
  }
  next();
    
}

module.exports.editCategory =(req,res,next)=>{
if (!req.body.ten || req.body.ten.trim() === '') {
    return res.status(400).json({ message: 'Tên không được để trống' });
  }
  next();
    
}
