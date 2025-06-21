const db = require('../config/database');


const getAllProducts = async (filters = {}) => {
  let sql = `SELECT * FROM san_pham Where deleted=0 `; // dễ xử lý điều kiện động
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
    sql += ' AND LOWER(ten)  LIKE ?';
    params.push(`%${filters.search}%`);
  }

  sql += ' ORDER BY id_san_pham ASC';
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
const updateProductStatus = async (id, newStatus) => {
  const sql = 'UPDATE san_pham SET trang_thai = ? WHERE id_san_pham = ?';
  const [result] = await db.query(sql, [newStatus, id]);
  return result;
};

// update Status nhìu sản phẩm
const updateProductsStatusMulti = async (ids, newStatus) => {
  if (!ids || ids.length === 0) {
    throw new Error('Danh sách ids rỗng');
  }

  // Tạo chuỗi dấu hỏi ? cho số phần tử trong mảng ids
  const placeholders = ids.map(() => '?').join(','); // vd: "?,?,?"
  const sql = `UPDATE san_pham SET trang_thai = ? WHERE id_san_pham IN (${placeholders})`;

  // Tham số truyền cho query: newStatus + từng id
  const params = [newStatus, ...ids];

  const [result] = await db.query(sql, params);
  return result;
};

// xóa 1 sản phẩm
const deleteItem = async (id) => {
  const [reslut] = await db.query('UPDATE san_pham SET deleted=1 where id_san_pham=?', [id])
  return reslut

}

// xóa nhìu sản phẩm
const deleteAll = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Danh sách ID không hợp lệ');
  }

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE san_pham SET deleted = 1  WHERE id_san_pham IN (${placeholders})`;

  const [result] = await db.execute(sql, ids);
  return result;
}


const createProduct = async (product) => {
  try {
    const query = `INSERT INTO san_pham(id_san_pham,id_danh_muc,ten,gia,mo_ta,trang_thai,ngay_cap_nhat,ngay_tao,hinh_anh,deleted) VALUES(?,?,?,?,?,?,?,?,?,?)`;
    const values = [
      product.id_san_pham,
      product.id_danh_muc,
      product.ten,
      product.gia,
      product.mo_ta,
      product.trang_thai,
      product.ngay_cap_nhat,
      product.ngay_tao,
      product.hinh_anh,
      product.deleted
    ];
    const res = await db.query(query, values);
    return res;
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err.message);
    throw err;
  }
};


const updateProduct = async (product) => {
  const {
    ten_danh_muc, // tên danh mục từ client, bắt buộc phải có
    id_san_pham,
    ten,
    gia,
    mo_ta,
    trang_thai,
    hinh_anh
  } = product;

  if (!ten_danh_muc) throw new Error('Thiếu tên danh mục (ten_danh_muc)');

  const id_danh_muc = await getCategoryIdByName(ten_danh_muc); // lấy id danh mục từ tên
  const ngay_cap_nhat = new Date().toISOString().split('T')[0]; // định dạng yyyy-mm-dd

  const query = `
    UPDATE san_pham 
    SET id_danh_muc = ?, ten = ?, gia = ?, mo_ta = ?, trang_thai = ?, hinh_anh = ?, ngay_cap_nhat = ?
    WHERE id_san_pham = ?
  `;

  const values = [id_danh_muc, ten, gia, mo_ta, trang_thai, hinh_anh, ngay_cap_nhat, id_san_pham];
  const [res] = await db.query(query, values);
  return res;
};



// thêm mới sản phẩm 


module.exports = {
  getAllProducts,
  updateProductStatus,
  updateProductsStatusMulti,
  deleteItem,
  deleteAll,
  createProduct,
  updateProduct

  
  //   updateProduct,
  //   deleteProduct
};
