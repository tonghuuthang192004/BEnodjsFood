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
    // Đăng ký
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

            res.json({ message: 'Đăng ký thành công, vui lòng kiểm tra email để xác minh.' });
        } catch (err) {
            console.error('❌ Lỗi [register]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Xác minh email
    verifyEmail: async (req, res) => {
        const { email, ma_xac_minh } = req.query;
        console.log('📥 [verifyEmail] Query:', req.query);

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
            res.json({ message: 'Xác minh email thành công' });
        } catch (err) {
            console.error('❌ Lỗi [verifyEmail]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Đăng nhập
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

            const token = jwt.sign({ id: user.id_nguoi_dung }, process.env.JWT_SECRET, { expiresIn: '7d' });
            console.log('✅ Đăng nhập thành công:', email);
            res.json({ message: 'Đăng nhập thành công', token });
        } catch (err) {
            console.error('❌ Lỗi [login]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Cập nhật thông tin
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

    // Đổi mật khẩu
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

    // Quên mật khẩu
    forgotPassword: async (req, res) => {
        const { email } = req.body;
        console.log('📥 [forgotPassword] Email:', email);

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                console.log('❌ Email không tồn tại:', email);
                return res.status(404).json({ error: 'Email không tồn tại' });
            }

            const token = jwt.sign({ id: user.id_nguoi_dung }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const resetLink = `http://localhost:3000/reset-password?token=${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Đặt lại mật khẩu',
                html: `<p>Nhấn vào link để đặt lại mật khẩu: <a href="${resetLink}">${resetLink}</a></p>`
            });

            console.log('✅ Email đặt lại mật khẩu đã gửi đến:', email);
            res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
        } catch (err) {
            console.error('❌ Lỗi [forgotPassword]:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Đặt lại mật khẩu
    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;
        console.log('📥 [resetPassword] Body:', req.body);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.update(decoded.id, { mat_khau: hashedPassword });

            console.log('✅ Đặt lại mật khẩu thành công cho user ID:', decoded.id);
            res.json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (err) {
            console.error('❌ Lỗi [resetPassword]:', err);
            res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
        }
    }
};

module.exports = userController;
