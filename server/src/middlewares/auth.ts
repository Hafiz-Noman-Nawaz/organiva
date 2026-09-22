import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; email: string; role: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or session expired.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account is suspended or deactivated.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const staffRoles = ['superadmin', 'admin', 'manager', 'support', 'inventory'];
  if (!staffRoles.includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Forbidden. Admin portal access required.' });
    return;
  }
  next();
};

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || (!req.user.isSuperAdmin && req.user.role !== 'superadmin')) {
    res.status(403).json({ success: false, message: 'Access Denied: Super Admin privilege required.' });
    return;
  }
  next();
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // Super Admin has unrestricted access to everything
    if (req.user.isSuperAdmin || req.user.role === 'superadmin') {
      return next();
    }

    const userPerms = req.user.permissions || [];
    if (userPerms.includes('*') || userPerms.includes(permission)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Access Denied: Missing required permission [${permission}].`,
    });
  };
};
