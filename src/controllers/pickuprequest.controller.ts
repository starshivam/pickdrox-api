import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pickRequestModel from '../models/pickRequest.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const addPickupRequest = async (req: Request, res: Response): Promise<void> => {
    const { pickupLocation, pickupCity, pickupLat, pickupLong, dropLocation, dropingCity, dropingLat, dropingLong, carringWeight, itemDescription, packaging_type, other_packaging_type, package_category, package_other_category,  pickupDateTime, totalDistance, adjustPrice, pickupStatus } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};
    if (!pickupLocation || !dropLocation || !carringWeight || !pickupStatus) {
        if (!pickupLocation) validation_error['pickupLocation'] = "Pickup location is required";
        if (!dropLocation) validation_error['dropLocation'] = "Drop location is required";
        if (!carringWeight) validation_error['carringWeight'] = "Wieght is required";
        if (!pickupStatus) validation_error['pickupStatus'] = "Pickup status is required";

        // Send the validation error response and exit the function
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }
    const status = ['draft', 'active', 'inactive','archived'];
    if (!status.includes(pickupStatus)) {
        validation_error['routeStatus'] = "The route status does not match the predefined status"
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }

    try {
          if (token) {
              const decoded = jwt.verify(token, JWT_SECRET) as unknown;
              const decodedToken = decoded as JwtPayload & { userId: string };
              const userId = decodedToken.userId;
              const PickupRequestData = {
              userId: userId,
              pickupLocation,
              pickupCity,
              pickupLat,
              pickupLong,
              dropLocation,
              dropingCity,
              dropingLat,
              dropingLong,
              carringWeight, 
              itemDescription, 
              packaging_type, 
              other_packaging_type, 
              package_category, 
              package_other_category, 
              pickupDateTime, 
              totalDistance, 
              adjustPrice,
              pickupStatus:"active"
            };

            const newPickRequest = new pickRequestModel(PickupRequestData);
            await newPickRequest.save();
            res.status(201).json({ success: true, message: 'Pickup request has been updated successfully.' });
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

}
