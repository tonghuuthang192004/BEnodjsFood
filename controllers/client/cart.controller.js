const cartModel = require('../../modal/client/cart.model');
// console.log(cartModel)

const userId=1;
module.exports.getUserCart= async (req,res)=>{
     try {
        const cart = await cartModel.getCartUserID(userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error });
    }
}
module.exports.createCart= async (req,res)=>{
try {
        const result = await cartModel.createCart(userId);
        res.json({ message: 'Tạo giỏ hàng thành công', result });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo giỏ hàng', error });
    }
}

module.exports.getCartItems= async (req,res)=>{
 try {
        const userId = 1; // Gán cứng userId ở đây

        const cart = await cartModel.getCartUserID(userId);
        if (!cart || cart.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }
        const cartId = cart.id_gio_hang;
        console.log(cartId);
        const items = await cartModel.getCartItem(cartId);

    
        res.json(items);
    } catch (error) {
            console.error('Lỗi getCartItems:', error);  // <-- in lỗi ra console

        res.status(500).json({ message: 'Lỗi khi lấy sản phẩm giỏ hàng', error });
    }
}
module.exports.updateItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body; // Lấy itemId và quantity từ client

    if (!itemId || quantity == null) {
      return res.status(400).json({ message: 'Thiếu itemId hoặc quantity' });
    }

    await cartModel.updateCartItemQuantity(itemId, quantity);

    res.json({ message: 'Cập nhật số lượng sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng sản phẩm', error: error.message || error });
  }
}

module.exports.deleteItem= async (req,res)=>{
 try {
        const { productId } = req.body;
        const cart = await cartModel.getCartUserID(userId);
        const cartId = cart.id_gio_hang;
        await cartModel.deleteItem(cartId, productId);
        res.json({ message: 'Xóa sản phẩm khỏi giỏ thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
    }
}