const db = require('../../config/database');

// 🟢 Lấy tất cả danh mục
const getAllCategories = async () => {
    try {
        const sql = `
            SELECT id_danh_muc, ten, tieu_de, hinh_anh
            FROM danh_muc
            WHERE trang_thai = 1
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        console.error('❌ Lỗi khi lấy tất cả danh mục:', error);
        throw error;
    }
};

// 🟢 Lấy sản phẩm theo ID danh mục
const getProductsByCategoryId = async (id_danh_muc) => {
    try {
        const sql = `
            SELECT id_san_pham, ten, gia, mo_ta, hinh_anh, noi_bat
            FROM san_pham
            WHERE id_danh_muc = ? AND trang_thai = 1
        `;
        const [rows] = await db.query(sql, [id_danh_muc]);
        return rows;
    } catch (error) {
        console.error('❌ Lỗi khi lấy sản phẩm theo danh mục:', error);
        throw error;
    }
};

module.exports = {
    getAllCategories,
    getProductsByCategoryId
};
