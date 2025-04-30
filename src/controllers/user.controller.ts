import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UserMeta from '../models/userMeta.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { first_name, last_name, email, phone, dob, postal_code, locality, address, city, state } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};

    if (!first_name || !email || !phone || !dob || !postal_code || !address || !city || !state) {
        if (!first_name) validation_error['first_name'] = "First name is required";
        if (!email) validation_error['email'] = "Email is required";
        if (!phone) validation_error['phone'] = "Phone is required";
        if (!dob) validation_error['dob'] = "Date of birth is required";
        if (!postal_code) validation_error['postal_code'] = "Postal code is required";
        if (!address) validation_error['address'] = "Address is required";
        if (!city) validation_error['city'] = "City is required";
        if (!state) validation_error['state'] = "State is required";

        // Send the validation error response and exit the function
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }

    try {
      if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as unknown;
          const decodedToken = decoded as JwtPayload & { userId: string };
          const userId = decodedToken.userId;
  
          const userData = {
              userId: userId,
              first_name,
              last_name,
              email,
              phone,
              dob: new Date(dob),
              postal_code,
              locality,
              address,
              city,
              state,
          };
  
          // Check if user profile already exists
          const existingUser = await UserMeta.findOne({ userId });
  
          if (existingUser) {
              // Update existing user profile
              await UserMeta.updateOne({ userId }, { $set: userData });
              res.status(200).json({ success: true, message: 'User updated', userId });
          } else {
              // Create a new user profile
              const newUser = new UserMeta(userData);
              await newUser.save();
              res.status(201).json({ success: true, message: 'User created', userId: newUser._id });
          }
          return;
      } else {
          res.status(400).json({ success: false, message: 'Token not provided' });
          return;
      }
  } catch (err) {
      console.error('Error in user profile handling:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
  }
  
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Send the error response and exit the function
        res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        return; // Explicitly return here
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
        const userId = decoded.userId;

        const userProfile = await UserMeta.findOne({ userId });

        if (!userProfile) {
            // Send the error response and exit the function
            res.status(404).json({ success: false, message: 'Profile not found' });
            return; // Explicitly return here
        }

        // Send the success response and explicitly return
        res.status(200).json({ success: true, data: userProfile });
        return; // Explicitly return here
    } catch (error) {
        // Handle the error
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
        return; // Explicitly return here
    }
};
