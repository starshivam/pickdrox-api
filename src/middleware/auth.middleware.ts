import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Blacklist } from '../models/Blacklist';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    // Token is missing, return a 401 response
     res.status(401).json({ message: 'No token provided' });
  }

  try {
    if(token) {
    // Check if the token is blacklisted
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      // If token is blacklisted, send a 401 response
      res.status(401).json({ success: false, message: 'Token invalidated. Please login again.' });
    }

    // Decode and verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as unknown; // Assert as unknown first

    // Now assert it as the correct type after verifying
    const decodedToken = decoded as JwtPayload & { userId: string };

    // Attach the userId to the request object for further use
    (req as any).user = decodedToken.userId;

    // Proceed to the next middleware or route handler
    next();
    } else {
      res.status(401).json({ message: 'No token provided' });
    }
  } catch (error) {
    // If verification fails, return a 401 response
     res.status(401).json({ message: 'Invalid token' });
  }
};
