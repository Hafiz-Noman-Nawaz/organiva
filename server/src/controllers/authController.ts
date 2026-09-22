import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config/env';
import { AuthRequest } from '../middlewares/auth';

// 1. Check if Super Admin is already initialized
export const checkSetupStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const superAdminCount = await User.countDocuments({
      $or: [{ role: 'superadmin' }, { isSuperAdmin: true }],
    });

    res.json({
      success: true,
      needsSetup: superAdminCount === 0,
      message: superAdminCount === 0
        ? 'Initial Super Admin setup is required.'
        : 'Super Admin is configured. Registration is locked.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. ONE-TIME Super Admin Initialization
export const setupSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const superAdminExists = await User.findOne({
      $or: [{ role: 'superadmin' }, { isSuperAdmin: true }],
    });

    if (superAdminExists) {
      res.status(403).json({
        success: false,
        message: 'Security Alert: Super Admin account is already configured. Setup form is permanently locked.',
      });
      return;
    }

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, Email, and Master Password are required.',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Master password must be at least 8 characters long.',
      });
      return;
    }

    // Create Super Admin with all permissions
    const superAdmin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: 'superadmin',
      isSuperAdmin: true,
      permissions: ['*'],
      isActive: true,
    });

    await superAdmin.save();

    const token = jwt.sign(
      { id: superAdmin._id, email: superAdmin.email, role: superAdmin.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Super Admin master account configured successfully. Setup form is now permanently locked.',
      token,
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        isSuperAdmin: true,
        permissions: ['*'],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Setup error' });
  }
};

// 3. Admin & Staff Login
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const staffRoles = ['superadmin', 'admin', 'manager', 'support', 'inventory'];
    if (!staffRoles.includes(user.role) && !user.isSuperAdmin) {
      res.status(403).json({ success: false, message: 'Access denied: Admin credentials required' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your staff account has been deactivated by Super Admin.' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || user.role === 'superadmin',
        permissions: user.permissions || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server login error' });
  }
};

// 4. Get Current Profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isSuperAdmin: req.user.isSuperAdmin || req.user.role === 'superadmin',
      permissions: req.user.permissions || [],
    },
  });
};

// 5. Staff Management: Get All Staff (Super Admin Only)
export const getStaffUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await User.find({
      role: { $in: ['superadmin', 'admin', 'manager', 'support', 'inventory'] },
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: staff.length, staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Staff Management: Create Staff User (Super Admin Only)
export const createStaffUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, permissions } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Name, Email, Password, and Role are required.',
      });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    // Role safety: Only Super Admin can exist once
    if (role === 'superadmin') {
      res.status(400).json({
        success: false,
        message: 'Cannot create additional Super Admin accounts. Choose Manager, Support, or Inventory.',
      });
      return;
    }

    const newStaff = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isSuperAdmin: false,
      permissions: permissions || [],
      isActive: true,
      createdBy: req.user?._id,
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: `Staff member "${name}" created with role [${role}].`,
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        permissions: newStaff.permissions,
        isActive: newStaff.isActive,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 7. Staff Management: Update Permissions / Status (Super Admin Only)
export const updateStaffUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, permissions, isActive, password } = req.body;

    const staff = await User.findById(id);
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    // Prevent modifying the superadmin from this endpoint
    if (staff.role === 'superadmin' && req.user?._id.toString() !== staff._id.toString()) {
      res.status(403).json({ success: false, message: 'Cannot modify master Super Admin account.' });
      return;
    }

    if (name) staff.name = name.trim();
    if (role && role !== 'superadmin') staff.role = role;
    if (permissions) staff.permissions = permissions;
    if (typeof isActive === 'boolean') staff.isActive = isActive;
    if (password && password.trim().length >= 6) {
      staff.password = password; // pre-save hook will hash it
    }

    await staff.save();

    res.json({
      success: true,
      message: 'Staff account updated successfully.',
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        permissions: staff.permissions,
        isActive: staff.isActive,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 8. Staff Management: Deactivate / Delete Staff (Super Admin Only)
export const deleteStaffUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    if (staff.isSuperAdmin || staff.role === 'superadmin') {
      res.status(403).json({ success: false, message: 'Master Super Admin cannot be deactivated.' });
      return;
    }

    staff.isActive = false;
    await staff.save();

    res.json({ success: true, message: 'Staff member deactivated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
