import { prisma } from '../database/prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'renthub-development-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/// Hash a plain-text password using bcrypt
export const hashPassword = async (password) => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

/// Compare a plain-text password with a hashed password
export const comparePassword = async (
  plainPassword,
  hashedPassword
) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
};

/// Generate a JWT access token for a user ID
export const generateToken = (userId, role) => {
  const token = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  return token;
};

/// Validate registration data and create a new user
export const registerUser = async (
  data
) => {
  // Validate with Zod
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    // Let the controller turn this into a 400 with readable messages
    throw result.error;
  }

  const { fullName, email, password, phone, role } = result.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create the user (and Landlord profile if LANDLORD)
  const user = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      role,
      ...(role === 'LANDLORD' ? { landlord: { create: {} } } : {}),
    },
  });

  // Generate token
  const token = generateToken(user.id, user.role);

  return { user, token };
};

/// Validate login credentials and return user + token
export const loginUser = async (
  data
) => {
  // Validate with Zod
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    // Let the controller turn this into a 400 with readable messages
    throw result.error;
  }

  const { email, password } = result.data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user.id, user.role);

  // Return user without password hash
  const { password: _password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

/// Get current logged-in user (protected endpoint)
export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};