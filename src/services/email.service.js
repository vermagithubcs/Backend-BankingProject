require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"DevX" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "🎉 Welcome to DevX!";

  const text = `
Hello ${name},

Welcome to DevX!

Thank you for registering with us. We're excited to have you on board.
Start exploring and building amazing things with DevX.

Best regards,
DevX Team
`;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:30px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      
      <h2 style="color:#333; text-align:center;">Welcome to DevX 🚀</h2>

      <p style="font-size:16px; color:#555;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="font-size:16px; color:#555;">
        Thank you for registering with <strong>DevX</strong>. We're excited to have you join our community!
      </p>

      <p style="font-size:16px; color:#555;">
        You can now explore the platform and start building amazing things.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="https://yourwebsite.com"
          style="background:#4f46e5; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
          Visit DevX
        </a>
      </div>

      <p style="font-size:14px; color:#888;">
        If you have any questions, feel free to contact our support team.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

      <p style="font-size:12px; color:#999; text-align:center;">
        © ${new Date().getFullYear()} DevX. All rights reserved.
      </p>

    </div>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";
  const text = `Hello ${name}, \n\n Your transaction of ${amount} to account ${toAccount} was successfully.\n\n Best Regards,\n The DevX Team.`;
  const hmtl = `<p>Hello ${name}, </p><p>Your transaction of ${amount} to account ${toAccount} was successfully.</p>\n\n Best Regards,<br> The Backend`;

  await sendEmail(userEmail, name, amount, toAccount);
}
async function sendTransactionFailedEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed!";
  const text = `Hello ${name}, \n\n We are regrat to inform you ${amount} to account ${toAccount} your transaction failed.\n\n Best Regards,\n The DevX Team.`;
  const hmtl = `<p>Hello ${name}, </p><p>We are regrat to inform you  ${amount} to account ${toAccount} was failed transaction.</p>\n\n Best Regards,<br> The Backend`;

  await sendEmail(userEmail, name, amount, toAccount);
}
module.exports = { sendRegistrationEmail,sendTransactionEmail,sendTransactionFailedEmail };
