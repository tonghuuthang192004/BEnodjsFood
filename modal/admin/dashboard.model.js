const db=require('../../config/database')

const countOrder= async ()=>{
    const sql=`SELECT COUNT(*) as total FROM don_hang`
    const [rel]= await db.query(sql);
    return rel[0].total;
}
const countUser = async()=>{
    const sql=`SELECT COUNT(*)as  total FROM nguoi_dung`
    const [rel]= await db.query(sql);
    return rel[0].total;
}
const countProduct = async()=>{
    const sql=` SELECT COUNT(*) as total  FROM san_pham`
    const [rel]= await db.query(sql);
    return rel[0].total;
}
const productEvaluation =async()=>{
    const sql=`SELECT COUNT(*) as total  FROM danh_gia_san_pham`
    const [rel]= await db.query(sql);
    return rel[0].total;
}
module.exports={
    countOrder,countUser,countProduct,productEvaluation
}
