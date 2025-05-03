import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UserMeta from '../models/userMeta.model';
import User from '../models/user.model';
import communicationPreferencesModel from '../models/communicationPreferences.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { first_name, last_name, email, phone, dob, postal_code, locality, address, city, state, about_me } = req.body;
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
              about_me,
          };
  
          // Check if user profile already exists
          const existingUser = await UserMeta.findOne({ userId });
  
          if (existingUser) {
              // Update existing user profile
              await UserMeta.updateOne({ userId }, { $set: userData });
          } else {
              // Create a new user profile
              const newUser = new UserMeta(userData);
              await newUser.save();
              
          }

          const updateUser = {
            email,
            phone
          }
          await User.updateOne({ _id:userId }, { $set: updateUser });
          res.status(201).json({ success: true, message: 'Profile has been updated successfully.' });
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

        const user = await User.findOne({ _id:userId });
        if (!user) {
            // Send the error response and exit the function
            res.status(404).json({ success: false, message: 'Profile not found' });
            return; // Explicitly return here
        }

        const userProfile = await UserMeta.findOne({ userId });
        const fullProfile = {
            ...userProfile,
            email: user?.email,
            phone: user?.phone,
            email_verified: user?.email_verified,
            phone_verified: user?.phone_verified,
          };
          console.log(fullProfile,"fullProfile");
          
        res.status(200).json({ success: true, user: fullProfile });
        return; // Explicitly return here
    } catch (error) {
        // Handle the error
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
        return; // Explicitly return here
    }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        // Send the error response and exit the function
        res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        return; // Explicitly return here
    }
    
    const validation_error: { [key: string]: any } = {};

    if (!newPassword ){
         validation_error['password'] = "Password is required";
        // Send the validation error response and exit the function
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }

    try {

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
        const userId = decoded.userId;
        const user = await User.findById(userId);
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

export const updateCommunicationPreferences = async (req: Request, res: Response): Promise<void> => {
    const { push_notification, emails, text_messages } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};
    if (!push_notification && !emails && !text_messages) {
        res.status(400).json({ error: 'At least one of push_notification, emails, or text_messages is required.' });
    }

    try {
      if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as unknown;
          const decodedToken = decoded as JwtPayload & { userId: string };
          const userId = decodedToken.userId;
  
          // Check if user profile already exists
          const existingPreferences = await communicationPreferencesModel.findOne({ userId });
  
          if (existingPreferences) {

            if(push_notification){
                existingPreferences.push_notification = push_notification;
            }

            if(emails){
                existingPreferences.emails = emails;
            }

            if(text_messages){
                existingPreferences.text_messages = text_messages;
            }

            await existingPreferences.save();
          } else {

            const insertPreferences = {
                userId: userId,
                push_notification: {},
                emails: {},
                text_messages: {}
            }
            if(push_notification){
                insertPreferences.push_notification = push_notification;
            }

            if(emails){
                insertPreferences.emails = emails;
            }

            if(text_messages){
                insertPreferences.text_messages = text_messages;
            }
              // Create a new user profile
              const preferences = new communicationPreferencesModel(insertPreferences);
              await preferences.save();
              
          }

          res.status(201).json({ success: true, message: 'Preferences has been updated successfully.' });
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

export const getCommunicationPreferences = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Send the error response and exit the function
        res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        return; // Explicitly return here
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
        const userId = decoded.userId;

        const userCommunicationPrefereces = await communicationPreferencesModel.findOne({ userId });
       
        res.status(200).json({ success: true, push_notification: userCommunicationPrefereces?.push_notification });
        return; // Explicitly return here
    } catch (error) {
        // Handle the error
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
        return; // Explicitly return here
    }
};


