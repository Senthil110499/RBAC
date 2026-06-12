import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAccountCreatedMail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"RBAC" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Account Has Been Created",
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.log("Failed to send Email:", error);
    throw error;
  }
};


