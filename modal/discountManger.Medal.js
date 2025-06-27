const db=require('../config/database');
 
const GetAllDisCountManger= async (filters ={})=>{
    const sql=`SELECT *FROM giam_gia `;
    const params =[];
    if(filters.deleted !==undefined)
    {
        sql+= `  AND deleted = ? `
    }
    if(filters.trang_thai !==undefined)
    {
        sql += ` AND trang_thai = ?`;
        params.push(filters.trang_thai);
    } 
    if(filters.search !==undefined){
        sql += `AND LOWER(ten) LIKE `;
        params.push(`%${filters.trang_thai}%`);

    }
    sql +=` ORDER BY id_giam_gia ASC `;

 
}
const GetDisCountMangerId=async (id_giam_gia)=>{
    const sql=`Select *from giam_gia WHERE id_giam_gia= ?`
    const [rel]=await db.query(sql,id_giam_gia);
    return rel;
}
const updateStatus = async (statusNew,id_giam_gia)=>{
    const sql =`UPDATE giam_gia set trang_thai = ? where id_giam_gia = ?`;
    const result =await db.query(sql,[statusNew,id_giam_gia]);
    return result;
}


const deleteItem = async(id)=>{
    const [reslut] = await db.query(`UPDATE giam_gia SET deleted=1 WHERE id_giam_gia=? `,[id]);
    return reslut;
}

const deleteAll = async(ids)=>{
    if(!Array.isArray(ids)|| ids.length===0){
        throw new Error ('Danh sách id ko hợp lệ');

    }
    const placeholders = ids.map(()=>'?').join(', ');
    const sql =`UPDATE giam_gia set deleted = 1 WHERE id_giam_gia IN (${placeholders})`;
    const [rel]= await db.query(sql,ids);
    return rel;
}
const createDiscountManger= async(disCountManger)=>{
    try{
        const query =`INSERT INTO giam_gia(id_giam_gia,ma_giam_gia,ten,loai,gia_tri,dieu_kien,ngay_bat_dau,ngay_ket_thuc,trang_thai,so_luong,so_luong_con_lai,deleted) 
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?);`
         const values=[
            disCountManger.id_giam_gia,
            disCountManger.ma_giam_gia,
            disCountManger.ten,
            disCountManger.loai,
            disCountManger.gia_tri,
            disCountManger.dieu_kien,
            disCountManger.ngay_bat_dau,
            disCountManger.ngay_ket_thuc,
            disCountManger.trang_thai,
            disCountManger.so_luong,
            disCountManger.so_luong_con_lai,
            disCountManger.deleted

         ];
         const res= await db.query(query,values);
         return res;
    }
    catch (error){
        console.error("lỗi khi thêm sản phẩm:",error.message);
        throw error;
    }
}


// const updateDiscountManger = async(disCountManger,id_giam_gia)=>{
//     const {
//       id_giam_gia,
//          ma_giam_gia,
//          ten,
//          loai,
//          gia_tri,
//          dieu_kien,
//          ngay_bat_dau,
//          ngay_ket_thuc,
//          trang_thai,
//          so_luong,
//          so_luong_con_lai,
//          deleted
//     }=disCountManger;
//     const query =`UPDATE giam_gia `
    
// }
module.exports={
    GetAllDisCountManger,
    GetDisCountMangerId,
    updateStatus,
    deleteItem,
    deleteAll,
    createDiscountManger
}