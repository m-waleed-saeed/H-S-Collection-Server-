const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"H & S Collection" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    });
};

module.exports = sendEmail;
