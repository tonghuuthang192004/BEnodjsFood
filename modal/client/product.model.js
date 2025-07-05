const db = require('../../config/database');

// 🟢 Lấy tất cả sản phẩm
const getAllProducts = async () => {
    const sql = `
        SELECT id_san_pham, id_danh_muc, ten, gia, mo_ta, hinh_anh, noi_bat
        FROM san_pham
        WHERE deleted = 0 AND trang_thai = 1
    `;
    const [rows] = await db.query(sql);
    return rows;
};

// 🔥 Lấy sản phẩm HOT
const getHotProducts = async () => {
    const sql = `
        SELECT 
            sp.id_san_pham, sp.id_danh_muc, sp.ten, sp.gia, sp.mo_ta, sp.hinh_anh,
            IFNULL(AVG(dg.diem_so), 0) AS diem_so
        FROM san_pham sp
        LEFT JOIN danh_gia_san_pham dg 
          ON sp.id_san_pham = dg.id_san_pham 
          AND dg.deleted = 0 AND dg.trang_thai = 1
        WHERE sp.deleted = 0 AND sp.trang_thai = 1 AND sp.noi_bat = 1
        GROUP BY sp.id_san_pham
    `;
    const [rows] = await db.query(sql);
    return rows;
};


// 📦 Lấy chi tiết sản phẩm theo ID
const getProductById = async (id) => {
  const sql = `
    SELECT 
      sp.id_san_pham, sp.ten, sp.gia, sp.mo_ta, sp.hinh_anh, sp.noi_bat,
      IFNULL(AVG(dg.diem_so), 0) AS diem_so
    FROM san_pham sp
    LEFT JOIN danh_gia_san_pham dg 
      ON sp.id_san_pham = dg.id_san_pham 
      AND dg.deleted = 0 AND dg.trang_thai = 1
    WHERE sp.id_san_pham = ? AND sp.deleted = 0 AND sp.trang_thai = 1
    GROUP BY sp.id_san_pham
  `;
  const [rows] = await db.query(sql, [id]);
  return rows[0]; // trả về 1 sản phẩm duy nhất
};


// 🛍️ Lấy sản phẩm theo danh mục
const getProductsByCategoryId = async (id_danh_muc) => {
    const sql = `
        SELECT id_san_pham, ten, gia, mo_ta, hinh_anh, noi_bat
        FROM san_pham
        WHERE id_danh_muc = ? AND deleted = 0 AND trang_thai = 1
    `;
    const [rows] = await db.query(sql, [id_danh_muc]);
    return rows;
};

// ✅ Lấy sản phẩm liên quan (cùng danh mục, khác sản phẩm hiện tại)
const getRelatedProducts = async (categoryId, productId) => {
    const sql = `
        SELECT id_san_pham, ten, gia, mo_ta, hinh_anh, noi_bat
        FROM san_pham
        WHERE id_danh_muc = ? AND id_san_pham != ? AND deleted = 0 AND trang_thai = 1
        LIMIT 10
    `;
    const [rows] = await db.query(sql, [categoryId, productId]);
    return rows;
};

module.exports = {
    getAllProducts,
    getHotProducts,
    getProductById,
    getProductsByCategoryId,
    getRelatedProducts
};
