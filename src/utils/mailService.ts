import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pickdrox@gmail.com', // your email
      pass: 'qbme jcwb nrks plcn', // your app password (not your real password)
    },
  });
  
  // transporter.verify((error, success) => {
  //   if (error) {
  //     console.error('❌ SMTP Authentication failed:', error.message);
  //   } else {
  //     console.log('✅ SMTP Authentication successful. Server is ready to send emails.');
  //   }
  // });

  const mailOptions = {
    from: '"PickDrox" <pickdrox@gmail.com>',
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};