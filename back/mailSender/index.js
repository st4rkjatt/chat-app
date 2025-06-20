const nodemailer = require("nodemailer");
const config = {
  userEmail: process.env.USER_EMAIL ,
  userPassword: process.env.USER_PASSWORD,
  secret: process.env.USER_SECRET,
};

module.exports.mailSender = async (sub, template, email) => {
  const mailOptions = {
    from: config.userEmail,
    to: email,
    subject: sub,
    html: template,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Change this to your email service provider
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: config.userEmail, // Change this to your email
      pass: config.userPassword, // Change this to your email password
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error, "errro");
      return error;
    }
    return info.response;
  });
};
