const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../../modal/client/user.model');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const userController = {
    // 📝 Đăng ký
    register: async (req, res) => {
        const { email, mat_khau, ten, so_dien_thoai } = req.body;
        console.log('📥 [register] Body:', req.body);

        try {
            const userExists = await User.findByEmail(email);
            if (userExists) {
                console.log('⚠️ Email đã tồn tại:', email);
                return res.status(400).json({ error: 'Email đã tồn tại' });
            }

            if (!strongPasswordRegex.test(mat_khau)) {
                console.log('⚠️ Mật khẩu yếu');
                return res.status(400).json({
                    error: 'Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt.'
                });
            }

            const hashedPassword = await bcrypt.hash(mat_khau, 10);
            const verificationCode = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
            console.log('📌 [register] Mã xác minh tạo ra:', verificationCode);

            await User.create({
                email,
                mat_khau: hashedPassword,
                ten,
                so_dien_thoai,
                ma_xac_minh: verificationCode,
                ngay_tao: new Date()
            });

            console.log('📧 Gửi email xác minh đến:', email);
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Xác minh tài khoản',
                html: `<h3>Xin chào ${ten || email}!</h3>
                       <p>Mã xác minh của bạn là: <b>${verificationCode}</b></p>`
            });

            res.status(201).json({
                message: 'Đăng ký thành công, vui lòng kiểm tra email để xác minh.'
            });
        } catch (err) {
            console.error('❌ Lỗi [register]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ✅ Xác minh email
    verifyEmail: async (req, res) => {
        const { email, ma_xac_minh } = req.body;
        console.log('📥 [verifyEmail] Body:', req.body);

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                console.log('❌ Email không tồn tại:', email);
                return res.status(404).json({ error: 'Email không tồn tại' });
            }

            if (user.ma_xac_minh !== ma_xac_minh) {
                console.log('❌ Mã xác minh sai');
                return res.status(400).json({ error: 'Mã xác minh không đúng' });
            }

            await User.update(user.id_nguoi_dung, {
                xac_thuc_email: 1,
                ma_xac_minh: null
            });

            console.log('✅ Email đã xác minh:', email);
            const token = jwt.sign({ id: user.id_nguoi_dung }, process.env.JWT_SECRET, {
                expiresIn: '7d'
            });

            res.status(200).json({
                message: 'Xác minh email thành công',
                token,
                user
            });
        } catch (err) {
            console.error('❌ Lỗi [verifyEmail]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // 🔓 Đăng nhập
    login: async (req, res) => {
        const { email, mat_khau } = req.body;
        console.log('📥 [login] Body:', req.body);

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                console.log('❌ Email không tồn tại:', email);
                return res.status(404).json({ error: 'Email không tồn tại' });
            }
            if (user.xac_thuc_email === 0) {
                console.log('⚠️ Tài khoản chưa xác minh email');
                return res.status(403).json({ error: 'Tài khoản chưa xác minh email' });
            }

            const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
            if (!isMatch) {
                console.log('❌ Sai mật khẩu');
                return res.status(400).json({ error: 'Sai mật khẩu' });
            }

            const token = jwt.sign({ id: user.id_nguoi_dung }, process.env.JWT_SECRET, {
                expiresIn: '7d'
            });
            console.log('✅ Đăng nhập thành công:', email);

            res.status(200).json({
                message: 'Đăng nhập thành công',
                token,
                user
            });
        } catch (err) {
            console.error('❌ Lỗi [login]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // 📝 Cập nhật thông tin
    updateProfile: async (req, res) => {
        const userId = req.user.id;
        const { ten, so_dien_thoai, avatar, gioi_tinh, ngay_sinh } = req.body;
        console.log('📥 [updateProfile] Body:', req.body);

        try {
            await User.update(userId, { ten, so_dien_thoai, avatar, gioi_tinh, ngay_sinh });
            console.log('✅ Cập nhật thành công cho user ID:', userId);
            res.json({ message: 'Cập nhật thông tin thành công' });
        } catch (err) {
            console.error('❌ Lỗi [updateProfile]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // 🔒 Đổi mật khẩu
    changePassword: async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        console.log('📥 [changePassword] Body:', req.body);

        try {
            const user = await User.findById(userId);
            const isMatch = await bcrypt.compare(oldPassword, user.mat_khau);
            if (!isMatch) {
                console.log('❌ Mật khẩu cũ không đúng');
                return res.status(400).json({ error: 'Mật khẩu cũ không đúng' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.update(userId, { mat_khau: hashedPassword });
            console.log('✅ Đổi mật khẩu thành công cho user ID:', userId);
            res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (err) {
            console.error('❌ Lỗi [changePassword]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // POST /quen-mat-khau
forgotPassword: async (req, res) => {
    const { email } = req.body;
    console.log('📥 [forgotPassword] Email:', email);

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('❌ Email không tồn tại:', email);
            return res.status(404).json({ error: 'Email không tồn tại' });
        }

        const otpCode = String(Math.floor(100000 + Math.random() * 900000)); // 6 chữ số
        const otpExpires = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

        await User.update(user.id_nguoi_dung, {
            ma_xac_minh: otpCode,
            otp_expires: otpExpires
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác minh đặt lại mật khẩu',
            html: `
                <h3>Xin chào ${user.ten || email},</h3>
                <p>Mã xác minh đặt lại mật khẩu của bạn là:</p>
                <h2>${otpCode}</h2>
                <p>Mã có hiệu lực trong 5 phút.</p>`
        });

        console.log('✅ Mã OTP gửi đến:', email);
        res.json({ message: 'Mã xác minh đã gửi đến email' });
    } catch (err) {
        console.error('❌ Lỗi [forgotPassword]:', err);
        res.status(500).json({ error: 'Lỗi server khi gửi email' });
    }
},
// POST /xac-minh-otp
verifyOtp: async (req, res) => {
    const { email, otpCode } = req.body;
    console.log('📥 [verifyOtp] Body:', req.body);

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('❌ Email không tồn tại:', email);
            return res.status(404).json({ error: 'Email không tồn tại' });
        }

        if (user.ma_xac_minh !== otpCode) {
            console.log('❌ Sai mã OTP');
            return res.status(400).json({ error: 'Mã xác minh không đúng' });
        }

        if (Date.now() > user.otp_expires) {
            console.log('⏰ Mã OTP đã hết hạn');
            return res.status(400).json({ error: 'Mã xác minh đã hết hạn' });
        }

        // Xóa mã sau khi xác minh
        await User.update(user.id_nguoi_dung, { ma_xac_minh: null, otp_expires: null });

        console.log('✅ Mã OTP xác minh thành công cho user:', email);
        res.json({ message: 'Xác minh thành công' });
    } catch (err) {
        console.error('❌ Lỗi [verifyOtp]:', err);
        res.status(500).json({ error: 'Lỗi server khi xác minh mã' });
    }
},

// POST /reset-mat-khau
resetPassword: async (req, res) => {
    const { email, newPassword } = req.body;
    console.log('📥 [resetPassword] Body:', req.body);

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('❌ Email không tồn tại:', email);
            return res.status(404).json({ error: 'Email không tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(user.id_nguoi_dung, { mat_khau: hashedPassword });

        console.log('✅ Đặt lại mật khẩu thành công cho user:', email);
        res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
        console.error('❌ Lỗi [resetPassword]:', err);
        res.status(500).json({ error: 'Lỗi server khi đặt lại mật khẩu' });
    }
},
    // 📄 Lấy thông tin user hiện tại
getCurrentUser: async (req, res) => {
    try {
        const userId = req.user.id; // 👈 Lấy từ middleware decode JWT
        console.log('📥 [getCurrentUser] User ID:', userId);

        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ Không tìm thấy user ID:', userId);
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        console.log('✅ Lấy thông tin user thành công:', user.email);
        res.json({ success: true, user });
    } catch (err) {
        console.error('❌ Lỗi [getCurrentUser]:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
},
uploadAvatar: async (req, res) => {
  try {
    const userId = req.user.id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await User.update(userId, { avatar: avatarPath });
    res.json({ success: true, avatarUrl: avatarPath, message: 'Avatar cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi upload avatar' });
  }
}

    
};

module.exports = userController;
