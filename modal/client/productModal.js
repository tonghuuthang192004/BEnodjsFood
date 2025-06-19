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
    
    //   try{
    //   const trang_thai='active'
    //   const query = "SELECT * FROM san_pham where deleted=0 AND trang_thai=?";
    //   const [rel]= await db.query(query,[trang_thai]);
    //   return rel;

    //   }
    //    catch (error) {
    //   console.error('Lỗi lấy sản phẩm:', error);
    //   res.status(500).json({ error: 'Lỗi server khi lấy sản phẩm' });
    // }
    
  }
  const getAllProductsId= async (id)=>{
      const query="SELECT * FROM san_pham where id_san_pham = ?";
      const [rel]=await db.query(query,[id])
      return rel[0];
      
  }

  module.exports={
      getAllProducts,
      getAllProductsId
  }
    
