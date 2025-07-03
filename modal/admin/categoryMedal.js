// them database 
const db = require('../../config/database');

const categoryAll = async ()=>{
        const sql =`Select *From danh_muc`;
        const [res]= await db.query(sql)
    return res;

}
const categoryAlls = async (filters) => {
   let sql = `SELECT * FROM danh_muc WHERE deleted=0`;
   const params = [];

   if (filters.deleted !== undefined && filters.deleted !== null) {
     sql += ` AND deleted = ?`;
     params.push(parseInt(filters.deleted));
   }

   if (filters.search && filters.search.trim() !== '') {
     sql += ` AND LOWER(ten) LIKE ?`;
     params.push(`%${filters.search.toLowerCase()}%`);
   }

 
   if (filters.limit && filters.limit > 0) {
     sql += ` ORDER BY id_danh_muc ASC LIMIT ?`;
     params.push(parseInt(filters.limit));
     if (filters.offset && filters.offset >= 0) {
       sql += ` OFFSET ?`;
       params.push(parseInt(filters.offset));
     }
   }

   const [rows] = await db.query(sql, params);
   return rows;
 };

const updateCategoryStatus = async (id, newStatus) => {
  const sql = 'UPDATE danh_muc SET trang_thai = ? WHERE id_danh_muc = ?';
  const [result] = await db.query(sql, [newStatus, id]);
  return result;
};
const updateCategoryStatusMulti = async (ids, newStatus) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Danh sách IDs không hợp lệ');
  }
  if (!['active', 'inactive'].includes(newStatus)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  // console.log('Updating IDs:', ids);
  // console.log('New Status:', newStatus);

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE danh_muc SET trang_thai = ? WHERE id_danh_muc IN (${placeholders})`;

  // Thêm newStatus vào đầu mảng params và ids vào sau
  const params = [newStatus, ...ids];
  console.log('SQL Query:', sql);
  console.log('SQL Params:', params);

  try {
    // Thực hiện truy vấn
    const [result] = await db.query(sql, params);
    return result;
  } catch (err) {
    console.error('Error executing query:', err);
    throw new Error('Lỗi khi cập nhật trạng thái');
  }
};


// xóa 1 sản phẩm
const deleteItem = async (id) => {
  const [reslut] = await db.query('UPDATE danh_muc SET deleted=1 where id_danh_muc=?', [id])
  return reslut

}

// xóa nhìu sản phẩm
const deleteAll = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Danh sách ID không hợp lệ');
  }

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE danh_muc SET deleted = 1  WHERE id_danh_muc IN (${placeholders})`;

  const [result] = await db.execute(sql, ids);
  return result;
}


const createCategory= async (category) => {
  try {
    const query = `INSERT INTO danh_muc(id_danh_muc,ten,tieu_de,trang_thai,ngay_tao,hinh_anh,deleted,ngay_cap_nhat) VALUES(?,?,?,?,?,?,?,?)`;
    const values = [
      
      category.id_danh_muc,
      category.ten,
      category.tieu_de,
      category.trang_thai,
      category.ngay_tao,
      category.hinh_anh,
      category.deleted,
    
      category.ngay_cap_nhat
    ];
    const res = await db.query(query, values);
    return res;
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err.message);
    throw err;
  }
};

const updateCategory = async (category, id_danh_muc) => {
  const {

    ten,
    tieu_de,
    trang_thai,
    ngay_tao,
    hinh_anh,
    deleted,
  } = category;


  const ngay_cap_nhat = new Date().toISOString().split('T')[0];

  const query = `
    UPDATE danh_muc 
    SET id_danh_muc = ?, ten = ?, tieu_de = ?, trang_thai = ?, ngay_tao = ?, hinh_anh = ?, deleted = ? ,ngay_cap_nhat=?
    WHERE id_danh_muc = ?
  `;

  const values = [id_danh_muc, ten, tieu_de, trang_thai, ngay_tao, hinh_anh, deleted,ngay_cap_nhat];
  const [res] = await db.query(query, values);
  return res;
};


const getAllCategoryId= async (id)=>{
      const query="SELECT * FROM danh_muc where danh_muc = ?";
      const [rel]=await db.query(query,[id])
      return rel[0];
      
  }


module.exports={
    categoryAll,
    categoryAlls,
    updateCategoryStatus,
    updateCategoryStatusMulti,
    deleteItem,
    deleteAll,
    createCategory,
    getAllCategoryId,
    updateCategory
}