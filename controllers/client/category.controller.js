const category = require('../../modal/client/category.model');
console.log(category)
module.exports.index = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Category ID is required.' });
        }

        const data = await category.getCategoryId(id);

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No product found for this category.' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
