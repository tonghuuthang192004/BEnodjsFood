const Product = require('../../modal/client/productModal');


//  console.log(Product);


module.exports.index = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || undefined,
    };

   // console.log('Filters received:', filters);

    const data = await Product.getAllProducts(filters);

//console.log('Data fetched:', data.length || 0);

    res.json(data);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.productId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required.' });
        }

        const data = await Product.getAllProductsId(id);

        if (!data) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports.productHot = async (req,res)=>{
  const data= await Product.getAllPorductHot();
  res.json(data);
}