// controllers/client/cart.controller.js
const cartModel = require('../../modal/client/cart.model');

const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ request
    console.log("User ID: ", userId);

    const cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    res.json(cart);
  } catch (error) {
    console.error('Lỗi getUserCart:', error);
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: error.message });
  }
};

const createCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID tạo giỏ:", userId);

    const result = await cartModel.createCart(userId);
    res.json({ message: 'Tạo giỏ hàng thành công', cart: result });
  } catch (error) {
    console.error('Lỗi createCart:', error);
    res.status(500).json({ message: 'Lỗi khi tạo giỏ hàng', error: error.message });
  }
};

const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID lấy items:", userId);

    const cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const cartId = cart.id_gio_hang;
    const items = await cartModel.getCartItem(cartId);
    res.json(items);
  } catch (error) {
    console.error('Lỗi getCartItems:', error);
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm giỏ hàng', error: error.message });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: 'itemId hoặc quantity không hợp lệ' });
    }

    const userId = req.user.id;
    await cartModel.updateCartItemQuantity(itemId, quantity, userId);

    res.json({ message: 'Cập nhật số lượng sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi updateItemQuantity:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng sản phẩm', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Thiếu productId' });
    }

    const userId = req.user.id;
    const cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const cartId = cart.id_gio_hang;
    await cartModel.deleteItem(cartId, productId);

    res.json({ message: 'Xóa sản phẩm khỏi giỏ thành công' });
  } catch (error) {
    console.error('Lỗi deleteItem:', error);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
  }
};

module.exports = {
  getUserCart,
  createCart,
  getCartItems,
  updateItemQuantity,
  deleteItem,
};
