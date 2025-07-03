const db = require('../../config/database');

const GetAllDisCountManger = async (filters = {}) => {
    let sql = `SELECT * FROM giam_gia WHERE 1=1 `;
    const params = [];

    if (filters.deleted !== undefined) {
        sql += ` AND deleted = ? `;
        params.push(filters.deleted);
    }

    if (filters.trang_thai !== undefined) {
        sql += ` AND trang_thai = ? `;
        params.push(filters.trang_thai);
    }

    if (filters.search !== undefined) {
        sql += ` AND LOWER(ma_giam_gia) LIKE ? `;
        params.push(`%${filters.search.toLowerCase()}%`);
    }

    sql += ` ORDER BY giam_gia.id_giam_gia ASC `;

    if (filters.limit !== undefined && filters.offset !== undefined) {
        sql += ` LIMIT ? OFFSET ? `;
        params.push(filters.limit, filters.offset);
    }

    const [rows] = await db.query(sql, params);
    return rows;
};

const GetDisCountMangerId = async (id_giam_gia) => {
    const sql = `SELECT * FROM giam_gia WHERE id_giam_gia = ?`;
    const [result] = await db.query(sql, [id_giam_gia]);
    return result;
};

const updateStatus = async (statusNew, id_giam_gia) => {
    const sql = `UPDATE giam_gia SET trang_thai = ? WHERE id_giam_gia = ?`;
    const [result] = await db.query(sql, [statusNew, id_giam_gia]);
    return result;
};

const deleteItem = async (id) => {
    const [result] = await db.query(`UPDATE giam_gia SET deleted = 1 WHERE id_giam_gia = ?`, [id]);
    return result;
};

const deleteAll = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách id không hợp lệ');
    }

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE giam_gia SET deleted = 1 WHERE id_giam_gia IN (${placeholders})`;
    const [result] = await db.query(sql, ids);
    return result;
};

const updateProductsStatusMulti = async (ids, newStatus) => {
  if (!ids || ids.length === 0) {
    throw new Error('Danh sách ids rỗng');
  }

  // Tạo chuỗi dấu hỏi ? cho số phần tử trong mảng ids
  const placeholders = ids.map(() => '?').join(','); // vd: "?,?,?"
  const sql = `UPDATE giam_gia SET trang_thai = ? WHERE id_giam_gia IN (${placeholders})`;

  // Tham số truyền cho query: newStatus + từng id
  const params = [newStatus, ...ids];

  const [result] = await db.query(sql, params);
  return result;
};
const createDiscountManger = async (discountManger) => {
    try {
        const query = `
            INSERT INTO giam_gia (
                ma_giam_gia, ten, loai, gia_tri,
                dieu_kien, ngay_bat_dau, ngay_ket_thuc,
                trang_thai, so_luong, so_luong_con_lai, deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            discountManger.ma_giam_gia,
            discountManger.ten,
            discountManger.loai,
            discountManger.gia_tri,
            discountManger.dieu_kien,
            discountManger.ngay_bat_dau,
            discountManger.ngay_ket_thuc,
            discountManger.trang_thai,
            discountManger.so_luong,
            discountManger.so_luong_con_lai,
            discountManger.deleted
        ];

        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        console.error("Lỗi khi thêm mã giảm giá:", error.message);
        throw error;
    }
};

const EditDiscountManger = async (discountManger, id_giam_gia) => {
    const {
        ma_giam_gia,
        ten,
        loai,
        gia_tri,
        dieu_kien,
        ngay_bat_dau,
        ngay_ket_thuc,
        trang_thai,
        so_luong,
        so_luong_con_lai,
        deleted
    } = discountManger;

    const query = `
        UPDATE giam_gia SET
            ma_giam_gia = ?, ten = ?, loai = ?, gia_tri = ?, dieu_kien = ?,
            ngay_bat_dau = ?, ngay_ket_thuc = ?, trang_thai = ?, so_luong = ?,
            so_luong_con_lai = ?, deleted = ?
        WHERE id_giam_gia = ?`;

    const values = [
        ma_giam_gia, ten, loai, gia_tri, dieu_kien,
        ngay_bat_dau, ngay_ket_thuc, trang_thai,
        so_luong, so_luong_con_lai, deleted, id_giam_gia
    ];

    const [result] = await db.query(query, values);
    return result;
};

module.exports = {
    GetAllDisCountManger,
    GetDisCountMangerId,
    updateStatus,
    deleteItem,
    deleteAll,
    createDiscountManger,
    EditDiscountManger,
    updateProductsStatusMulti
};
