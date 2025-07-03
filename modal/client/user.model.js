const db = require('../../config/database');

const findByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM nguoi_dung WHERE email = ?', [email]);
    console.log('📦 [findByEmail] Kết quả DB:', rows);
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM nguoi_dung WHERE id_nguoi_dung = ?', [id]);
    console.log('📦 [findById] Kết quả DB:', rows);
    return rows[0];
};


const create = async (data) => {
    const sql = `
        INSERT INTO nguoi_dung (email, mat_khau, ten, so_dien_thoai, ma_xac_minh, ngay_tao)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    console.log('📝 [create] SQL:', sql);
    console.log('📥 [create] Values:', [
        data.email,
        data.mat_khau,
        data.ten,
        data.so_dien_thoai,
        data.ma_xac_minh,
        data.ngay_tao
    ]);

    const [result] = await db.query(sql, [
        data.email,
        data.mat_khau,
        data.ten,
        data.so_dien_thoai,
        data.ma_xac_minh,
        data.ngay_tao
    ]);

    console.log('✅ [create] Kết quả insert:', result);
    return result;
};

const update = async (id, data) => {
    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = Object.values(data);
    const sql = `UPDATE nguoi_dung SET ${fields} WHERE id_nguoi_dung = ?`;

    console.log('📝 [update] SQL:', sql);
    console.log('📥 [update] Values:', [...values, id]);

    await db.query(sql, [...values, id]);
};

module.exports = {
    findByEmail,
    findById,
    create,
    update
};
