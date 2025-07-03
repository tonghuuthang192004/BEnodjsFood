const auth = require('../../modal/admin/auth.Medal'); // <-- đường dẫn đúng tới model

module.exports.LoginPost = async (req, res) => {
  const { email, mat_khau } = req.body;

  try {
    // Giả sử hàm auth.login trả về đối tượng người dùng và một token
    const user = await auth.login(email, mat_khau);

    if (user) {
      const { mat_khau, ...userInfo } = user; // Ẩn mật khẩu khi trả về

      // Gửi thông tin người dùng, không bao gồm mật khẩu
      

      // Tạo cookie với token cho người dùng
  res.cookie('token', user.token,{
    httpOnly: true,
  secure: false,         // <-- để false vì đang chạy HTTP (localhost)
  sameSite: 'lax',       // hoặc 'none' nếu frontend và backend khác domain
  maxAge: 86400000  
  });

          return res.json(userInfo);  // Lưu ý là dùng return để dừng quá trình tiếp theo

    } else {
      // Nếu không có người dùng, trả về lỗi 401
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
