// lib/email.mjs
import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Your Converse Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 500px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; margin: auto;">
                    <h1 style="color: #4CAF50;">🔐 Email Verification</h1>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Use the OTP below to verify your email address for Converse:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #4CAF50; background: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
                    <p style="font-size: 14px; color: #666;">If you didn’t request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999;">Need help? Contact <a href="mailto:himanshu.singh.cloud@gmail.com" style="color: #4CAF50; text-decoration: none;">himanshu.singh.cloud@gmail.com</a></p>
                    <p style="font-size: 12px; color: #999;">&copy; 2025 Converse. All rights reserved.</p>
                </div>
            </div>
        `
    };
    

    await transporter.sendMail(mailOptions);
};
