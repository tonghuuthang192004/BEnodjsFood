// them database 
const db=require('../config/database');

const categoryAll = async ()=>{
        const sql =`Select *From danh_muc`;
        const [res]= await db.query(sql)
    return res;

}
module.exports={
    categoryAll
}