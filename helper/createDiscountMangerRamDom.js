
const db =require('../config/database')
const createDisCount =(length=8)=>{
    const char=`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;
    let res='';
    for (let i=0;i<length;i++)
    {
        res+=char.charAt(Math.floor(Math.random()*char.length));
    }
    return res;

}
const checkCodeExists = async (ma_giam_gia) => {
  const query = 'SELECT id_giam_gia FROM giam_gia WHERE ma_giam_gia = ? LIMIT 1';
  return db.query(query, [ma_giam_gia]);
};
module.exports ={
    createDisCount,
    checkCodeExists
}