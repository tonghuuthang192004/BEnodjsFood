  const db=require('../../config/database')

  const getAllProducts = async(fliters={})=>{
    let sql=`SELECT *FROM san_pham Where deleted=0`;
    const params=[];
    if(fliters.status !== undefined)
    {
      
      sql += ` AND trang_thai = ?`;
      params.push(fliters.trang_thai);
    }


    if(fliters.search !== undefined)
    {
      sql +=` AND LOWER(ten) LIKE ?`;
      params.push(`%${fliters.search}%`)
    }
    const [reslut]= await db.query(sql,params);
    return reslut;

  }
  const getAllProductsId= async (id)=>{
      const query="SELECT * FROM san_pham where id_san_pham = ?";
      const [rel]=await db.query(query,[id])
      return rel[0];
      
  }
  const getAllPorductHot= async()=>{
       const trang_thai = 'active';
    const [rows] = await db.query(
      `SELECT * FROM san_pham WHERE deleted = 0 AND trang_thai = ? AND noi_bat = 1`,
      [trang_thai]
    );
    return rows;
  }
  

  module.exports={
      getAllProducts,
      getAllProductsId,
      getAllPorductHot
  }
    
