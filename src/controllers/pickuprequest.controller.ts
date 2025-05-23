import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pickRequestModel from '../models/pickRequest.model';
import userMetaModel from '../models/userMeta.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const addPickupRequest = async (req: Request, res: Response): Promise<void> => {
    const { pickupLocation, pickupCity, pickupLat, pickupLong, dropLocation, dropingCity, dropingLat, dropingLong, carringWeight, itemDescription, packaging_type, other_packaging_type, package_category, package_other_category,  pickupDateTime, totalDistance, adjustPrice, pickupStatus, itemName } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};
    if (!pickupLocation || !dropLocation || !carringWeight || !pickupStatus || !itemName) {
        if (!pickupLocation) validation_error['pickupLocation'] = "Pickup location is required";
        if (!dropLocation) validation_error['dropLocation'] = "Drop location is required";
        if (!itemName) validation_error['itemName'] = "Item name is required";
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
              const userMeta = await userMetaModel.findOne({ userId });
              if(userMeta) {
                const PickupRequestData = {
                  userMetaId: userMeta?._id,
                  pickupLocation,
                  pickupCity,
                  pickupLat,
                  pickupLong,
                  dropLocation,
                  dropingCity,
                  dropingLat,
                  dropingLong,
                  carringWeight,
                  itemName, 
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
              res.status(400).json({ success: false, message: 'Please complete your profile first.' });
              return; 
            }

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

export const findAllRequestUsers = async (req: Request, res:Response): Promise<void> => {
  const { pickupLocation, dropLocation, pickupDate, weight } = req.query;
  const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};
    if (!pickupLocation || !dropLocation) {
        if (!pickupLocation) validation_error['pickupLocation'] = "Pickup location is required";
        if (!dropLocation) validation_error['dropLocation'] = "Drop location is required";
        // Send the validation error response and exit the function
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }

    // PAGINATION HANDLING
    const page = parseInt(req.query.page as string) || 1;     // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10;  // Default to 10 results per page
    const skip = (page - 1) * limit;
    try {
          if (token) {
            // Build dynamic query
            const query: any = {};

            if (pickupLocation) {
              query.pickupLocation = { $regex: new RegExp(pickupLocation as string, 'i') };
            }

            if (dropLocation) {
              query.dropLocation = { $regex: new RegExp(dropLocation as string, 'i') };
            }

            query.pickupStatus = "active";
            if (pickupDate) {
              const date = new Date(pickupDate as string);
              const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
              const dayEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
              console.log("Date filter range:", dayStart, dayEnd);
              query.pickupDateTime = {
                $gte: dayStart,
                $lt: dayEnd
              };
            }
            
            if (weight) {
              // Assuming carringWeight is stored as a string, we must convert it
              // either while storing or here. Best: store it as a Number.
              query.carringWeight <= { $lte: weight };
            }
            const total = await pickRequestModel.countDocuments(query);
            const results = await pickRequestModel
              .find(query)
              .sort({ pickupDateTime: 1 })
              .skip(skip)
              .limit(limit)
              .populate({
                path: 'userMetaId',
                select: 'first_name last_name' // Only return selected fields
              });

            res.status(200).json({success: true, currentPage: page, totalPages: Math.ceil(total /limit), totalResults: total, data: results});
            return;
          } else {
            res.status(400).json({ success: false, message: 'Token not provided' });
            return;
          }
    } catch(error: any) {
      res.status(500).json({ success: false, error: error });
      return;
    }

}
