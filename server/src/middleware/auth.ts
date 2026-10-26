import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  guestSessionId?: string;
}

interface JwtPayload {
  userId: string;
  role: 'customer' | 'admin';
}

export const extractToken = (req: Request): string | null => {
  if (req.cookies && req.cookies.lumora_token) {
    return req.cookies.lumora_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);
  const guestHeader = req.headers['x-guest-session-id'] as string;
  if (guestHeader) {
    req.guestSessionId = guestHeader;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // In optionalAuth, invalid or expired token is ignored for guest fallback
  }

  next();
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found.' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: 'Account has been suspended.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

export const requireRole = (role: 'admin' | 'customer') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: `Forbidden. You must have ${role} privileges to access this resource.`,
      });
      return;
    }

    next();
  };
};
