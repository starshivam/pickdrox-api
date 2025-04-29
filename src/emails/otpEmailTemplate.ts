import { sendEmail } from '../utils/mailService';

export const otpEmailTemplate = async (otp: string, email: string): Promise<void> => {
    console.log(email, "email");
    
    const otpMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #333;">Hi,</h2>
        <p style="font-size: 16px; color: #555;">Your One-Time Signup (OTP) is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #000; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #888;">
          This OTP is valid for the next 10 minutes. Please do not share it with anyone.
        </p>
        <hr />
        <p style="font-size: 12px; color: #aaa;">If you did not request this, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} PickDrox. All rights reserved.</p>
      </div>
    `;
  
    await sendEmail(email, 'PickDrox Signup OTP', otpMessage);
  };