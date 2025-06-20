const db = require('../../config/database');



const getCartUserID= async (userId)=>{
const [rel]= await db.query (`SELECT * FROM gio_hang 
    WHERE id_nguoi_dung=? ORDER BY ngay_tao DESC LIMIT 1`,[userId]);
  return rel.length > 0 ? rel[0] : null;
}




const getCartItem = async (cartId)=>{
    const sql=`SELECT 
  gio_hang_chi_tiet.id, 
  gio_hang_chi_tiet.so_luong, 
  san_pham.ten, 
  san_pham.gia, 
  san_pham.hinh_anh
FROM gio_hang_chi_tiet
JOIN san_pham ON gio_hang_chi_tiet.id_san_pham = san_pham.id_san_pham
WHERE gio_hang_chi_tiet.id_gio_hang = ?`
    const [resulut]= await db.query(sql,[cartId])
    return resulut
}

const createCart =async (userId) =>{
    const result=db.query(`INSERT INTO gio_hang(id_nguoi_dung,ngay_tao) VALUES(?,Now())`,[userId])
    return result;
}


const updateCartItemQuantity= async(itemId,quantity)=>{
    const sql=`UPDATE gio_hang_chi_tiet SET so_luong=? where id=?`;
    const [rel]= await db.query(sql,[quantity,itemId])
    return rel;
}

const deleteItem=(cartId,productId)=>{
    const sql=`DELETE FROM gio_hang_chi_tiet WHERE id_gio_hang=? AND id_san_pham=?`;
    const [rel]=db.query(sql,[cartId,productId]);
    return rel;
}

module.exports={
    createCart,
    getCartUserID,
    getCartItem,
    updateCartItemQuantity,
    deleteItem

}

