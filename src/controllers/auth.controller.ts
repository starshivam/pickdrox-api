import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { generateOTP } from '../utils/otp';
import { otpEmailTemplate } from '../emails/otpEmailTemplate';
import { Blacklist } from '../models/Blacklist';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// User Register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, register_via } = req.body;
  // Basic validation
  const registrationVia = ['email', 'phone'];
  if (!email || !password || !registrationVia.includes(register_via)) {
    const validation_error: { [key: string]: any } = {};

    if(!registrationVia.includes(register_via)) validation_error['register_via'] = "This is accept only email or phone";

    if(!email) {
      validation_error['user_name'] = "Email/Phone is required";
    }

    if(!password) validation_error['password'] = "Password is required";

    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)  res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP(4);

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
    let registerEmail = '';
    let phone = '';
    if(register_via == 'phone') {
      phone = email;
    } else {
      registerEmail = email;
    }

    const newUser = await User.create({ login_name:email, register_via:register_via, email: registerEmail, phone: phone, password: hashedPassword, otp: otp, otp_expired:otp_expiry });
    if(register_via == 'email') {
      await otpEmailTemplate(otp, email);
    }
    res.status(201).json({ success: true, message: 'User created', userId: newUser._id});
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
       res.status(400).json({ message: 'Invalid credentials' });
    }
    if(user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       res.status(400).json({ message: 'Invalid credentials' });
    }

    if(!user.otp_status) {
      const otp = generateOTP(4);
      const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
      await otpEmailTemplate(otp, email);
      const updates = {otp: otp, otp_expired: otp_expiry};
      await User.findByIdAndUpdate(
        user._id,
        { $set: updates } // return updated doc and apply schema validation
      );
       res.status(302).json({ success: true, message: "The email/phone is not verified yet", otp_verified : false, id:user._id });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1000h' });

     res.json({ success: true, token, otp_verified : true });
    }
  } catch (err) {
     res.status(500).json({ error: 'Server error' });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email_phone } = req.params;
  
  const validation_error: { [key: string]: any } = {};
  if (!email_phone) {
     validation_error['email_phone'] = "Email/Phone is required";

    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
  }

  try {

    const user = await User.findOne({ login_name:email_phone });

    if(user && user.register_via == 'email' && user.email) {
      const otp = generateOTP(4);
      const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
      await otpEmailTemplate(otp, user.email);
      const updates = {otp: otp, otp_expired: otp_expiry};
      await User.findByIdAndUpdate(
        user._id,
        { $set: updates } // return updated doc and apply schema validation
      );
    }
    res.status(201).json({ success: true, message: "The OTP sent your email address."});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const {email_phone, otp} = req.body;

  if (!email_phone || !otp ) {
    const validation_error: { [key: string]: any } = {};

    if(!email_phone) validation_error['email_phone'] = "Email/Phone is required";

    if(!otp) validation_error['otp'] = "OTP is required";

    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
  }

  try {
    const user = await User.findOne({ login_name:email_phone });
    if(user) {

        if(user.otp == otp) {
          const expireDate = new Date(user.otp_expired ? user.otp_expired : '');
          const todayDate = new Date();     
          if (expireDate >= todayDate) {
            const updates = {otp_status: true, otp_expired: ''};
            await User.findByIdAndUpdate(
              user._id,
              { $set: updates } // return updated doc and apply schema validation
            );
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10h' });
            res.status(201).json({ success: true, token: token, message: "OTP has been verified."});
          } else {
            res.status(401).json({ success: false, message: "OTP has been expired."});
          }
        }

        res.status(401).json({ success: false, message: "OTP is invalid."});
    }
    res.status(403).json({ success: false, message: "You are not correct person."});
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }

}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (token) {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      
      await Blacklist.create({
        token,
        expiredAt: new Date(payload.exp * 1000) // token expiry time
      });
    }

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
}


