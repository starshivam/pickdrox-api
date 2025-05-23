import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Route from '../models/route.model';
import userMetaModel from '../models/userMeta.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const addRoute = async (req: Request, res: Response): Promise<void> => {
    const { leavingFrom, leavingCity, leavingLat, leavingLong, goingTo, goingCity, goingLat, goingLong, pickNearby, pickRedius, selectedRoute, carringWeight, itemDescription, packaging_type, other_packaging_type, package_category, package_other_category, routeType, travelingType, travelDays, leavingDateTime, returnDateTime, totalDistance, adjustPrice, routeStatus } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    const validation_error: { [key: string]: any } = {};
    if (!leavingFrom || !goingTo || !selectedRoute || !carringWeight || !routeStatus) {
        if (!leavingFrom) validation_error['leavingFrom'] = "Leaving from is required";
        if (!goingTo) validation_error['goingTo'] = "Going to is required";
        if (!selectedRoute) validation_error['selectedRoute'] = "Route is required";
        if (!carringWeight) validation_error['carringWeight'] = "Wieght is required";
        if (!routeStatus) validation_error['routeStatus'] = "Route status is required";

        // Send the validation error response and exit the function
        res.status(400).json({ success: false, message: "Validation failed", errors: validation_error });
        return; // Explicitly return to prevent further execution
    }
    const status = ['draft', 'active', 'inactive','archived'];
    if (!status.includes(routeStatus)) {
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
                const RouteData = {
                    userMetaId: userMeta?._id,
                    leavingFrom,
                    leavingCity,
                    leavingLat,
                    leavingLong,
                    goingTo,
                    goingCity,
                    goingLat,
                    goingLong,
                    pickNearby,
                    pickRedius,
                    selectedRoute,
                    carringWeight, 
                    itemDescription, 
                    packaging_type, 
                    other_packaging_type, 
                    package_category, 
                    package_other_category, 
                    routeType, 
                    travelingType, 
                    travelDays,  
                    leavingDateTime, 
                    returnDateTime, 
                    totalDistance, 
                    adjustPrice,
                    routeStatus
                };

                const newRoute = new Route(RouteData);
                await newRoute.save();
                res.status(201).json({ success: true, message: 'Route has been updated successfully.' });
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

export const getMyRoutes = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Send the error response and exit the function
        res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        return; // Explicitly return here
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
        const userId = decoded.userId;

        const allRoutes = await Route.find({ userId });
        if (!allRoutes) {
            // Send the error response and exit the function
            res.status(404).json({ success: false, message: 'Data not found' });
            return; // Explicitly return here
        }

        res.status(200).json({ success: true, data: allRoutes });
        return; // Explicitly return here
    } catch (error) {
        // Handle the error
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
        return; // Explicitly return here
    }
};

export const getSingleRoute = async (req: Request, res: Response): Promise<void> => {
    const { routeId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Send the error response and exit the function
        res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        return; // Explicitly return here
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
        const userId = decoded.userId;
        const singleRoute = await Route.findOne({ _id:routeId}).populate({
            path: 'userMetaId',
            select: 'first_name last_name' // Only return selected fields
            });
        if (!singleRoute) {
            // Send the error response and exit the function
            res.status(404).json({ success: false, message: 'Route not found' });
            return; // Explicitly return here
        }

        res.status(200).json({ success: true, data: singleRoute });
        return; // Explicitly return here
    } catch (error) {
        // Handle the error
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
        return; // Explicitly return here
    }
};

export const findAllTravellerUsers = async(req:Request, res:Response): Promise<void> => {
    const { pickupLocation, dropLocation, leavingDate, weight } = req.query;
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
        const orConditions: any[] = [];
        if (pickupLocation) {
            query.leavingFrom = { $regex: new RegExp(pickupLocation as string, 'i') };
        }

        if (dropLocation) {
            query.goingTo = { $regex: new RegExp(dropLocation as string, 'i') };
        }

        if (leavingDate) {
            const date = new Date(leavingDate as string);
            const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            const dayEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
            //console.log("Date filter range:", dayStart, dayEnd);
            orConditions.push({ leavingDateTime: {
            $gte: dayStart,
            $lt: dayEnd
            } });

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

            orConditions.push({ travelDays: { $in: [dayName] } });
        }

        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        
        if (weight) {
            // Assuming carringWeight is stored as a string, we must convert it
            // either while storing or here. Best: store it as a Number.
            query.carringWeight <= { $lte: weight };
        }
        query.routeStatus = "active";
        const total = await Route.countDocuments(query);
        const results = await Route
            .find(query)
            .sort({ leavingDateTime: 1 })
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