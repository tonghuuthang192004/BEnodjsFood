const db = require('../../config/database');

const getCategoryId = async (id_danh_muc) => {
    try {
        const sql = `
            SELECT san_pham.ten, san_pham.hinh_anh, san_pham.mo_ta, san_pham.gia
            FROM danh_muc
            INNER JOIN san_pham ON danh_muc.id_danh_muc = san_pham.id_danh_muc
            WHERE danh_muc.id_danh_muc = ?
        `;
        const [rel] = await db.query(sql, [id_danh_muc]);
        return rel;
    } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        throw error; // ❗ KHÔNG dùng res ở đây vì model không có res
    }
};

const getAllCategory = async () => {
    try {
        const sql = `
           SELECT *FROM danh_muc
        `;
        const [rel] = await db.query(sql);
        return rel;
    } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        throw error; // ❗ KHÔNG dùng res ở đây vì model không có res
    }
};



module.exports = {
    getCategoryId,
    getAllCategory
};
