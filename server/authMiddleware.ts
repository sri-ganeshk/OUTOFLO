import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from './user';
import mongoose from 'mongoose';

// Extend Express Request to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: mongoose.Types.ObjectId;
    }
  }
}

// Authentication middleware
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Find user by ID
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user ID to request object
    req.userId = user._id as mongoose.Types.ObjectId;
    req.user = user;

    next();
    return; // Add this return statement
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error });
  }
};