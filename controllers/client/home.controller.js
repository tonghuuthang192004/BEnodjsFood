module.exports.index = (req, res) => {
  res.render('client/pages/home/index.pug',{
    pageTitle:"Trang Chủ"
  })
}




// const pool = require('../db');

// async function getCartByUserId(userId) {
//   const [rows] = await pool.query(
//     'SELECT * FROM gio_hang WHERE id_nguoi_dung = ? ORDER BY ngay_tao DESC LIMIT 1',
//     [userId]
//   );
//   return rows[0] || null;
// }

// async function getCartItems(cartId) {
//   const [rows] = await pool.query(
//     `SELECT ghct.id, ghct.so_luong, sp.id_san_pham, sp.ten, sp.gia, sp.hinh_anh
//      FROM gio_hang_chi_tiet ghct
//      JOIN san_pham sp ON ghct.id_san_pham = sp.id_san_pham
//      WHERE ghct.id_gio_hang = ?`,
//     [cartId]
//   );
//   return rows;
// }

// async function createCart(userId) {
//   const [result] = await pool.query(
//     'INSERT INTO gio_hang (id_nguoi_dung, ngay_tao) VALUES (?, NOW())',
//     [userId]
//   );
//   return result.insertId;
// }

// async function getCartItem(cartId, productId) {
//   const [rows] = await pool.query(
//     'SELECT * FROM gio_hang_chi_tiet WHERE id_gio_hang = ? AND id_san_pham = ?',
//     [cartId, productId]
//   );
//   return rows[0] || null;
// }

// async function addCartItem(cartId, productId, quantity) {
//   await pool.query(
//     'INSERT INTO gio_hang_chi_tiet (id_gio_hang, id_san_pham, so_luong) VALUES (?, ?, ?)',
//     [cartId, productId, quantity]
//   );
// }

// async function updateCartItemQuantity(itemId, quantity) {
//   await pool.query(
//     'UPDATE gio_hang_chi_tiet SET so_luong = ? WHERE id = ?',
//     [quantity, itemId]
//   );
// }

// async function deleteCartItem(cartId, productId) {
//   await pool.query(
//     'DELETE FROM gio_hang_chi_tiet WHERE id_gio_hang = ? AND id_san_pham = ?',
//     [cartId, productId]
//   );
// }

// module.exports = {
//   getCartByUserId,
//   getCartItems,
//   createCart,
//   getCartItem,
//   addCartItem,
//   updateCartItemQuantity,
//   deleteCartItem,
// };



// const cartModel = require('../models/cartModel');

// const getUserId = (req) => {
//   const id = req.headers['x-user-id'];
//   return id ? parseInt(id) : null;
// };

// async function getCart(req, res) {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(400).json({ error: 'Thiếu user id trong header x-user-id' });

//     const cart = await cartModel.getCartByUserId(userId);

//     if (!cart) return res.json({ message: 'Giỏ hàng trống', cart: [] });

//     const items = await cartModel.getCartItems(cart.id_gio_hang);

//     res.json({
//       id_gio_hang: cart.id_gio_hang,
//       ngay_tao: cart.ngay_tao,
//       items,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// }

// async function addToCart(req, res) {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(400).json({ error: 'Thiếu user id trong header x-user-id' });

//     const { id_san_pham, so_luong } = req.body;

//     if (!id_san_pham || !so_luong || so_luong <= 0) {
//       return res.status(400).json({ error: 'Thông tin sản phẩm không hợp lệ' });
//     }

//     let cart = await cartModel.getCartByUserId(userId);

//     if (!cart) {
//       const newCartId = await cartModel.createCart(userId);
//       cart = { id_gio_hang: newCartId };
//     }

//     const item = await cartModel.getCartItem(cart.id_gio_hang, id_san_pham);

//     if (item) {
//       const newQty = item.so_luong + so_luong;
//       await cartModel.updateCartItemQuantity(item.id, newQty);
//     } else {
//       await cartModel.addCartItem(cart.id_gio_hang, id_san_pham, so_luong);
//     }

//     res.json({ message: 'Thêm sản phẩm vào giỏ hàng thành công' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// }

// async function updateCart(req, res) {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(400).json({ error: 'Thiếu user id trong header x-user-id' });

//     const { id_san_pham, so_luong } = req.body;

//     if (!id_san_pham || so_luong === undefined || so_luong < 0) {
//       return res.status(400).json({ error: 'Thông tin không hợp lệ' });
//     }

//     const cart = await cartModel.getCartByUserId(userId);
//     if (!cart) return res.status(400).json({ error: 'Giỏ hàng không tồn tại' });

//     if (so_luong === 0) {
//       await cartModel.deleteCartItem(cart.id_gio_hang, id_san_pham);
//     } else {
//       const item = await cartModel.getCartItem(cart.id_gio_hang, id_san_pham);
//       if (!item) return res.status(400).json({ error: 'Sản phẩm không tồn tại trong giỏ hàng' });

//       await cartModel.updateCartItemQuantity(item.id, so_luong);
//     }

//     res.json({ message: 'Cập nhật giỏ hàng thành công' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// }

// async function removeFromCart(req, res) {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(400).json({ error: 'Thiếu user id trong header x-user-id' });

//     const { id_san_pham } = req.body;

//     if (!id_san_pham) {
//       return res.status(400).json({ error: 'Thiếu id sản phẩm' });
//     }

//     const cart = await cartModel.getCartByUserId(userId);
//     if (!cart) return res.status(400).json({ error: 'Giỏ hàng không tồn tại' });

//     await cartModel.deleteCartItem(cart.id_gio_hang, id_san_pham);

//     res.json({ message: 'Xoá sản phẩm khỏi giỏ hàng thành công' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// }

// module.exports = {
//   getCart,
//   addToCart,
//   updateCart,
//   removeFromCart,
// };
