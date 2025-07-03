const db = require('../../config/database');


const getAllProducts = async (filters = {}) => {
  let sql = `SELECT 
    san_pham.id_san_pham,
    san_pham.ten,
    san_pham.hinh_anh,
    san_pham.gia,
    san_pham.trang_thai,
    danh_muc.ten AS ten_danh_muc
  FROM san_pham
  INNER JOIN danh_muc ON san_pham.id_danh_muc = danh_muc.id_danh_muc
  WHERE san_pham.deleted = 0`; // bỏ dấu ;

  const params = [];

  // Nếu muốn lấy theo deleted khác 0, bạn có thể sửa điều kiện ở trên hoặc thêm filter này
  if (filters.deleted !== undefined) {
    sql += ' AND san_pham.deleted = ?';
    params.push(filters.deleted);
  }

  if (filters.status !== undefined) {
    sql += ' AND san_pham.trang_thai = ?';
    params.push(filters.status);
  }

  if (filters.search !== undefined) {
    sql += ' AND LOWER(san_pham.ten) LIKE ?';
    params.push(`%${filters.search.toLowerCase()}%`);
  }

  sql += ' ORDER BY san_pham.id_san_pham ASC';

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

const updateProduct = async (product, id_san_pham) => {
  const {
    id_danh_muc,
    ten,
    gia,
    mo_ta,
    trang_thai,
    hinh_anh
  } = product;


  const ngay_cap_nhat = new Date().toISOString().split('T')[0];

  const query = `
    UPDATE san_pham 
    SET id_danh_muc = ?, ten = ?, gia = ?, mo_ta = ?, trang_thai = ?, hinh_anh = ?, ngay_cap_nhat = ?
    WHERE id_san_pham = ?
  `;

  const values = [id_danh_muc, ten, gia, mo_ta, trang_thai, hinh_anh, ngay_cap_nhat, id_san_pham];
  const [res] = await db.query(query, values);
  return res;
};


const getAllProductsId= async (id)=>{
      const query="SELECT * FROM san_pham where id_san_pham = ?";
      const [rel]=await db.query(query,[id])
      return rel[0];
      
  }



// thêm mới sản phẩm 


module.exports = {
  getAllProducts,
  updateProductStatus,
  updateProductsStatusMulti,
  deleteItem,
  deleteAll,
  createProduct,
  updateProduct,
  getAllProductsId

  //   updateProduct,
  //   deleteProduct
};
