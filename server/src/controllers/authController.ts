import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
} from '../validators/schemas';

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const sendTokenResponse = (user: IUser, res: Response, statusCode: number = 200) => {
  const token = generateToken(user);

  // Set secure HttpOnly cookie
  res.cookie('lumora_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
    },
  });
};

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: validated.email.toLowerCase() });
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(validated.password, salt);

  // Never allow public registration to assign admin role
  const newUser = await User.create({
    name: validated.name,
    email: validated.email.toLowerCase(),
    passwordHash,
    role: 'customer',
    phone: validated.phone,
    addresses: [],
  });

  sendTokenResponse(newUser, res, 201);
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validated.email.toLowerCase() });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  if (user.status !== 'active') {
    res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
    return;
  }

  sendTokenResponse(user, res);
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.cookie('lumora_token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      addresses: req.user.addresses,
    },
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const validated = updateProfileSchema.parse(req.body);
  if (validated.name) req.user.name = validated.name;
  if (validated.phone) req.user.phone = validated.phone;

  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      addresses: req.user.addresses,
    },
  });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const validated = changePasswordSchema.parse(req.body);
  const isMatch = await bcrypt.compare(validated.currentPassword, req.user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Incorrect current password.' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  req.user.passwordHash = await bcrypt.hash(validated.newPassword, salt);
  await req.user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
};

export const addAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const validated = addressSchema.parse(req.body);

  if (validated.isDefault) {
    req.user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  } else if (req.user.addresses.length === 0) {
    validated.isDefault = true;
  }

  req.user.addresses.push(validated as any);
  await req.user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully.',
    addresses: req.user.addresses,
  });
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const addressId = req.params.addressId;
  req.user.addresses = req.user.addresses.filter(
    (addr) => addr._id && addr._id.toString() !== addressId
  );
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Address removed successfully.',
    addresses: req.user.addresses,
  });
};
