const db = require('../../config/database');


const getAllUser = async (filters = {}) => {
  let sql = `SELECT * FROM nguoi_dung Where deleted=0 `; // dễ xử lý điều kiện động
  const params = [];

  if (filters.deleted !== undefined) {
    sql += ' AND deleted = ?';
    params.push(filters.deleted);
  }

  if (filters.status !== undefined) {
    sql += ' AND trang_thai = ?';
    params.push(filters.status);
  }

  if (filters.search !== undefined) {
   const keyword = `%${filters.search.toLowerCase()}%`;
  sql += ' AND (LOWER(ten) LIKE ? OR so_dien_thoai LIKE  ?)';
  params.push(keyword, filters.search); // 1 cho ten, 1 cho sdt
  }

  sql += ' ORDER BY id_nguoi_dung ASC';
  if (filters.limit !== undefined && filters.offset !== undefined) {
    sql += ' LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset);
  }

  console.log('SQL:', sql);
  console.log('Params:', params);

  const [rows] = await db.query(sql, params);
  return rows;
};
// update 1 trạng thái
const updateUserStatus = async (id, newStatus) => {
  const sql = 'UPDATE nguoi_dung SET trang_thai = ? WHERE id_nguoi_dung = ?';
  const [result] = await db.query(sql, [newStatus, id]);
  return result;
};

// update Status nhìu sản phẩm
const updateUserStatusMulti = async (ids, newStatus) => {
  if (!ids || ids.length === 0) {
    throw new Error('Danh sách ids rỗng');
  }

  // Tạo chuỗi dấu hỏi ? cho số phần tử trong mảng ids
  const placeholders = ids.map(() => '?').join(','); // vd: "?,?,?"
  const sql = `UPDATE nguoi_dung SET trang_thai = ? WHERE id_nguoi_dung IN (${placeholders})`;

  // Tham số truyền cho query: newStatus + từng id
  const params = [newStatus, ...ids];

  const [result] = await db.query(sql, params);
  return result;
};

// xóa 1 sản phẩm
const deleteItem = async (id) => {
  const [reslut] = await db.query('UPDATE nguoi_dung SET deleted=1 where id_nguoi_dung=?', [id])
  return reslut

}

// xóa nhìu sản phẩm
const deleteAll = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Danh sách ID không hợp lệ');
  }

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE nguoi_dung SET deleted = 1  WHERE id_nguoi_dung  IN (${placeholders})`;

  const [result] = await db.execute(sql, ids);
  return result;
}


const createUser = async (user) => {
  try {
    const query = `INSERT INTO nguoi_dung(id_nguoi_dung,id_vai_tro,ten,email,mat_khau,so_dien_thoai,ngay_tao,avatar,deleted,trang_thai,ngay_cap_nhat) VALUES(?,?,?,?,?,?,?,?,?,?,?)`;
    const values = [
    user.id_nguoi_dung,
    user.id_vai_tro,
    user.ten,
    user.email,
    user.mat_khau,
    user.so_dien_thoai,
    user.ngay_tao,
    user.avatar,
    user.deleted,
    user.trang_thai,
        user.ngay_cap_nhat

    ];
    const res = await db.query(query, values);
    return res;
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err.message);
    throw err;
  }
};

const updateUser = async (user, id_nguoi_dung) => {
  const {
    id_vai_tro,
    ten,
    email,
    so_dien_thoai,
    trang_thai,
    avatar
  } = user;

const now = new Date();
const ngay_cap_nhat = now.toISOString().slice(0, 19).replace('T', ' ');

  const query = `
    UPDATE nguoi_dung 
    SET id_vai_tro = ?, ten = ?, email = ?, so_dien_thoai = ?, trang_thai = ?, avatar = ?, ngay_cap_nhat = ?
    WHERE id_nguoi_dung = ?
  `;

  // Đảm bảo thứ tự giá trị đúng với câu query SQL
  const values = [id_vai_tro, ten, email, so_dien_thoai, trang_thai, avatar, ngay_cap_nhat, id_nguoi_dung];

  const [res] = await db.query(query, values);
  return res;
};



const getAllUserId= async (id)=>{
      const query="SELECT * FROM nguoi_dung where id_nguoi_dung = ?";
      const [rel]=await db.query(query,[id])
      return rel[0];
      
  }



// thêm mới sản phẩm 


module.exports = {
  getAllUser,
  updateUserStatus,
  updateUserStatusMulti,
  deleteItem,
  deleteAll,


  
  createUser,
  updateUser,
  getAllUserId

  //   updateProduct,
  //   deleteProduct
};
