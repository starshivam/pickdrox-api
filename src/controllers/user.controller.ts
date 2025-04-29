import { Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.model';
import UserMeta from "../models/userMeta.model";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { first_name, last_name, email, phone, dob, postal_code, locality, address, city, state } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};
    if (!first_name || !email || !phone || !dob || !postal_code || !address || !city || !state) {
        
        if(!first_name) validation_error['first_name'] = "First name is required";
    
        if(!email) validation_error['email'] = "Email is required";
    
        if(!phone) validation_error['phone'] = "Phone is required";

        if(!dob) validation_error['dob'] = "Date of birth is required";

        if(!postal_code) validation_error['postal_code'] = "Postal code is required";

        if(!address) validation_error['address'] = "Address is required";

        if(!city) validation_error['city'] = "City is required";

        if(!state) validation_error['state'] = "State is required";
    
        res.status(400).json({success: false,message: "Validation failed",errors: validation_error});
      }

      try {
        
        if (token) {
            // Decode and verify the token
            const decoded = jwt.verify(token, JWT_SECRET) as unknown; // Assert as unknown first
            const decodedToken = decoded as JwtPayload & { userId: string };
            const userId = decodedToken.userId;
            const userData = {
                userId : userId,
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone,
                dob: new Date(dob), // 🔑 Make sure to convert to Date
                postal_code: postal_code,
                locality: locality,
                address: address,
                city: city,
                state: state,
              };

            const newUser = new UserMeta(userData);
            await newUser.save();
            res.status(201).json({ success: true, message: 'User created', userId: newUser._id});
        }
        
      } catch(err) {
        res.status(500).json({ error: err });
      }
}

