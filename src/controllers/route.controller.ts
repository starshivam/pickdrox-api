import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Route from '../models/route.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const addRoute = async (req: Request, res: Response): Promise<void> => {
    const { leavingFrom, leavingCity, leavingLat, leavingLong, goingTo, goingCity, goingLat, goingLong, pickNearby, pickRedius, selectedRoute, carringWeight, itemDescription, packaging_type, other_packaging_type, package_category, package_other_category, routeType, travelingType, travelDays, leavingTime, returnTime, leavingDateTime, returnDateTime, totalDistance, adjustPrice, routeStatus } = req.body;

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
              const RouteData = {
              userId: userId,
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
              leavingTime, 
              returnTime, 
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
            res.status(404).json({ success: false, message: 'Profile not found' });
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

        const singleRoute = await Route.find({ userId, _id:routeId });
        if (!singleRoute) {
            // Send the error response and exit the function
            res.status(404).json({ success: false, message: 'Profile not found' });
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