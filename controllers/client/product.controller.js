const Product = require('../../modal/client/productModal');


 console.log(Product);


module.exports.index = async(req, res) =>{


const fliters ={
    search:req.query.search || undefined
}
const data= await Product.getAllProducts(fliters);
res.json(data);


}

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
