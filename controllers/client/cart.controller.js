const cartModel = require('../../modal/client/cart.model');

// 📦 Lấy giỏ hàng của user
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel.getCartUserID(userId);

    if (!cart) {
      return res.status(200).json({ success: true, data: [], message: "Giỏ hàng trống" });
    }

    const items = await cartModel.getCartItem(cart.id_gio_hang);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('❌ [getUserCart] Error:', error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy giỏ hàng" });
  }
};

// ➕ Thêm sản phẩm vào giỏ
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_san_pham, so_luong } = req.body;

    if (!id_san_pham || !so_luong) {
      return res.status(400).json({ success: false, message: "Thiếu id_san_pham hoặc so_luong" });
    }

    let cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      cart = await cartModel.createCart(userId);
    }

    const result = await cartModel.addItemToCart(cart.id_gio_hang, id_san_pham, so_luong);

    let message;
    if (result.type === 'insert') {
      message = "Đã thêm sản phẩm vào giỏ";
    } else if (result.type === 'update') {
      message = "Đã cập nhật số lượng sản phẩm";
    } else if (result.type === 'restore') {
      message = "Đã khôi phục và thêm lại sản phẩm vào giỏ";
    }

    res.status(result.type === 'insert' ? 201 : 200).json({
      success: true,
      message,
      quantity: result.quantity
    });
  } catch (error) {
    console.error('❌ [addItemToCart] Error:', error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi thêm sản phẩm vào giỏ" });
  }
};

// 🔄 Cập nhật số lượng sản phẩm
exports.updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const id_san_pham = req.params.id_san_pham;
    const so_luong = req.body.so_luong;

    if (!id_san_pham || so_luong === undefined) {
      return res.status(400).json({ success: false, message: "Thiếu id_san_pham hoặc so_luong" });
    }

    const cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }

    const result = await cartModel.updateCartItemQuantity(cart.id_gio_hang, id_san_pham, so_luong);

    res.status(200).json({
      success: true,
      message: result.added
        ? "Đã thêm mới sản phẩm vào giỏ vì trước đó không tồn tại hoặc đã bị xoá"
        : "Cập nhật số lượng thành công"
    });
  } catch (error) {
    console.error('❌ [updateItemQuantity] Error:', error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật số lượng" });
  }
};

// ❌ Xoá 1 sản phẩm khỏi giỏ (soft-delete)
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const id_san_pham = req.params.id_san_pham;

    if (!id_san_pham) {
      return res.status(400).json({ success: false, message: "Thiếu id_san_pham" });
    }

    const cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }

    const result = await cartModel.deleteItem(cart.id_gio_hang, id_san_pham);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Đã xoá sản phẩm (soft-delete)" });
    } else {
      res.status(404).json({ success: false, message: "Sản phẩm không tồn tại trong giỏ" });
    }
  } catch (error) {
    console.error('❌ [deleteItem] Error:', error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi xoá sản phẩm" });
  }
};

// 🧹 Xoá toàn bộ giỏ hàng (soft-delete)
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel.getCartUserID(userId);

    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }

    const result = await cartModel.clearCart(cart.id_gio_hang);

    res.status(200).json({
      success: true,
      message: result.affectedRows > 0
        ? "Đã xoá toàn bộ giỏ hàng (soft-delete)"
        : "Giỏ hàng đã trống"
    });
  } catch (error) {
    console.error('❌ [clearCart] Error:', error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi xoá giỏ hàng" });
  }
};

// ♻️ Khôi phục 1 sản phẩm đã xoá
exports.restoreItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const id_san_pham = req.params.id_san_pham;
    const so_luong = req.body.so_luong || 1; // mặc định 1 nếu không truyền

    if (!id_san_pham) {
      return res.status(400).json({ success: false, message: "Thiếu id_san_pham" });
    }

    const cart = await cartModel.getCartUserID(userId);
    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }

    const result = await cartModel.restoreCartItem(cart.id_gio_hang, id_san_pham, so_luong);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Đã khôi phục sản phẩm vào giỏ" });
    } else {
      res.status(404).json({ success: false, message: "Sản phẩm không tồn tại để khôi phục" });
    }
  } catch (error) {
    console.error('❌ [restoreItem] Error:', error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi khôi phục sản phẩm" });
  }
};
