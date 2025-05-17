import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { generateOTP, isEmailOrPhone } from '../utils/userFunctions';
import { otpEmailTemplate } from '../emails/otpEmailTemplate';
import { Blacklist } from '../models/Blacklist';
import userMetaModel from '../models/userMeta.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// User Register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  // Basic validation
  const validation_error: { [key: string]: any } = {};
  if (!email || !password) {
    if(!email) {
      validation_error['email'] = "Email/Phone is required";
    }

    if(!password) validation_error['password'] = "Password is required";

    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
    return;
  }

  const registerNameType = isEmailOrPhone(email);
  if(registerNameType === 'invalid') {
    validation_error['email'] = "Please enter valid email/phone";
    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
     res.status(400).json({ message: 'User already exists' });
     return;
    }

    const otp = generateOTP(4);

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
    const otp_on = isEmailOrPhone(email);
    let registerEmail = '';
    let phone = '';
    if(otp_on == 'phone') {
      phone = email;
    } else {
      registerEmail = email;
    }

    const newUser = await User.create({ email: registerEmail, phone: phone, password: hashedPassword, otp: otp, otp_expired:otp_expiry });
    if(otp_on == 'email') {
      await otpEmailTemplate(otp, email);
    }
    res.status(201).json({ success: true, message: 'User created', userId: newUser._id});
    return;
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
};

// User Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }
    if(user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    if(!user.otp_status) {
      const otp = generateOTP(4);
      const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
      if(user.email) {
        await otpEmailTemplate(otp, email);
      }
      const updates = {otp: otp, otp_expired: otp_expiry};
      await User.findByIdAndUpdate(
        user._id,
        { $set: updates } // return updated doc and apply schema validation
      );
       res.status(201).json({ success: true, message: "The email/phone is not verified yet", otp_verified : false, id:user._id });
       return;
    }

    const userProfile = await userMetaModel.findOne({ userId:user._id });
    const fullProfile = {
        ...userProfile,
        email: user?.email,
        phone: user?.phone,
        email_verified: user?.email_verified,
        phone_verified: user?.phone_verified,
        };
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1000h' });

     res.json({ success: true, token, otp_verified : true, user:fullProfile });
     return;
    }
  } catch (err) {
     res.status(500).json({ error: 'Server error' });
     return;
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email_phone } = req.params;
  
  const validation_error: { [key: string]: any } = {};
  const registerNameType = isEmailOrPhone(email_phone);
  if (!email_phone || registerNameType === 'invalid') {
    if(!email_phone) validation_error['email_phone'] = "Email/Phone is required";
     
    if(registerNameType === 'invalid') validation_error['email_phone'] = "Please enter valid email/phone";

    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
    return;
  }

  try {

    const user = await User.findOne({ email:email_phone });

    if(user && user.email) {
      const otp = generateOTP(4);
      const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
      await otpEmailTemplate(otp, user.email);
      const updates = {otp: otp, otp_expired: otp_expiry};
      await User.findByIdAndUpdate(
        user._id,
        { $set: updates } // return updated doc and apply schema validation
      );

      res.status(201).json({ success: true, message: "The OTP sent your email address."});
      return;
    } else {
      res.status(401).json({ success: false, message: "Invalid email address or account does not exist."});
      return;
    }
    
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
    return;
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const {email_phone, otp} = req.body;

  const registerNameType = isEmailOrPhone(email_phone);

  if (!email_phone || !otp || registerNameType === 'invalid') {
    const validation_error: { [key: string]: any } = {};

    if(!email_phone) validation_error['email_phone'] = "Email/Phone is required";

    if(!otp) validation_error['otp'] = "OTP is required";

    if(registerNameType === 'invalid') validation_error['email_phone'] = "Please enter valid email/phone";
    
    res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
    return;
  }

  try {
    const user = await User.findOne({ email:email_phone });
    if(user) {

        if(user.otp == otp) {
          const otp_on = isEmailOrPhone(email_phone);
          const expireDate = new Date(user.otp_expired ? user.otp_expired : '');
          const todayDate = new Date();     
          if (expireDate >= todayDate) {
            if(!user.otp_status) {
              const updates = otp_on === 'phone' ? {otp_status: true, otp_expired: '', phone_verified: true} : {otp_status: true, otp_expired: '', email_verified: true} ;
              await User.findByIdAndUpdate(
                user._id,
                { $set: updates } // return updated doc and apply schema validation
              );
              const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10h' });
              res.status(201).json({ success: true, token: token, message: "OTP has been verified."});
              return;
            } else {
              const updates = otp_on === 'phone' ? {otp_expired: '', phone_verified: true} : {otp_expired: '', email_verified: true} ;
              await User.findByIdAndUpdate(
                user._id,
                { $set: updates } // return updated doc and apply schema validation
              );
              res.status(201).json({ success: true, message: "OTP has been verified."});
              return;
            }
          } else {
            res.status(401).json({ success: false, message: "OTP has been expired."});
            return;
          }
        }

        res.status(401).json({ success: false, message: "OTP is invalid."});
        return;
    }
    res.status(403).json({ success: false, message: "You are not correct person."});
    return;
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
    return;
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
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during logout.' });
    return;
  }
}

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email,
       newPassword 
      } = req.body;
    const validation_error: { [key: string]: any } = {};

    if (!newPassword || !email ){
        if(!email)  validation_error['email'] = "Email/Phone is required";
        if(!newPassword)  validation_error['password'] = "New Password is required";
        // Send the validation error response and exit the function
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }

    try {

        const user = await User.findOne({ email });
        if (!user){
            res.status(404).json({ success: false, message: 'User not found' }); 
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
        return;
    } catch (error) {
        // Handle the error
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
        return; // Explicitly return here
    }
};


