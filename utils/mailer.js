const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationCode = async (email, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"FastFood App 👨‍🍳" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác minh tài khoản",
      html: `<h2>Xin chào,</h2><p>Mã xác minh của bạn là: <b>${code}</b></p>`,
    });

    console.log(`✅ Gửi mã xác minh tới ${email} thành công`);
    console.log(`📨 Thông tin gửi mail:`, info.response);
  } catch (error) {
    console.error(`❌ Gửi mã xác minh thất bại:`, error);
  }
};
