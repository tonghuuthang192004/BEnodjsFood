// Get /admin/dashborad
const dashboard=require('../../modal/admin/dashboard.model');
module.exports.countProduct = async (req, res) => {
    
    const data=await dashboard.countProduct();
    res.json(data);
}

module.exports.countUser = async (req, res) => {
    
    const data=await dashboard.countUser();
    res.json(data);
}

module.exports.countOrder = async (req, res) => {
    
    const data=await dashboard.countOrder();
    res.json(data);
}
module.exports.productEvaluation = async (req, res) => {
    
    const data=await dashboard.productEvaluation();
    res.json(data);
}
