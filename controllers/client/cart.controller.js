// controllers/client/cart.controller.js
const cartModel = require('../../modal/client/cart.model');

module.exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;  // Lấy userId từ request (đã xác thực từ token)
    console.log("User ID: ", userId);  // Log userId để chắc chắn rằng bạn có giá trị đúng

    const cart = await cartModel.getCartUserID(userId);
    console.log(cart)
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error });
  }
};

module.exports.createCart = async (req, res) => {
  try {
    const userId = req.user.id;  // Lấy userId từ request (đã xác thực từ token)
    console.log(userId)
    const result = await cartModel.createCart(userId);
    res.json({ message: 'Tạo giỏ hàng thành công', result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo giỏ hàng', error });
  }
};

module.exports.getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;  // Lấy userId từ request (đã xác thực từ token)
    console.log(userId)
    const cart = await cartModel.getCartUserID(userId);
    if (!cart || cart.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const cartId = cart.id_gio_hang;
    const items = await cartModel.getCartItem(cartId);
    res.json(items);
  } catch (error) {
    console.error('Lỗi getCartItems:', error);
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm giỏ hàng', error });
  }
};

module.exports.updateItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || quantity == null) {
      return res.status(400).json({ message: 'Thiếu itemId hoặc quantity' });
    }

    const userId = req.user.id;  // Lấy userId từ request (đã xác thực từ token)

    await cartModel.updateCartItemQuantity(itemId, quantity, userId);

    res.json({ message: 'Cập nhật số lượng sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng sản phẩm', error: error.message || error });
  }
};

module.exports.deleteItem = async (req, res) => {
  try {
    const { productId } = req.body;

    const userId = req.user.id;  // Lấy userId từ request (đã xác thực từ token)
    
    const cart = await cartModel.getCartUserID(userId);
    const cartId = cart.id_gio_hang;

    await cartModel.deleteItem(cartId, productId);
    res.json({ message: 'Xóa sản phẩm khỏi giỏ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
  }
};
