// =============================================================================
// Auth Service — Business Logic
// =============================================================================

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../config/database.js";
import { ConflictError, UnauthorizedError } from "../../utils/errors.js";
import type {
  SignupBody,
  LoginBody,
  UserRow,
  SafeUser,
  JwtPayload,
  TokenPair,
} from "./auth.types.js";

// ─── Config ─────────────────────────────────────────────────────────
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ─── Strip sensitive fields from user row ───────────────────────────
export const toSafeUser = (row: UserRow): SafeUser => ({
  id: row.id,
  first_name: row.first_name,
  last_name: row.last_name,
  email: row.email,
  phone_number: row.phone_number,
  profile_photo_url: row.profile_photo_url,
  city: row.city,
  country: row.country,
  language_preference: row.language_preference,
  is_admin: row.is_admin,
  created_at: row.created_at,
});

// ─── Generate JWT token pair ────────────────────────────────────────
export const generateTokens = (payload: JwtPayload): TokenPair => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES as any,
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES as any,
  });
  return { accessToken, refreshToken };
};

// ─── Verify access token ───────────────────────────────────────────
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

// ─── Verify refresh token ──────────────────────────────────────────
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};

// ─── Signup ─────────────────────────────────────────────────────────
export const signup = async (body: SignupBody): Promise<{ user: SafeUser; tokens: TokenPair }> => {
  // 1. Check if email already exists
  const existing = await query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL",
    [body.email]
  );

  if ((existing.rowCount ?? 0) > 0) {
    throw new ConflictError("An account with this email already exists");
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

  // 3. Insert user
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone_number)
     VALUES ($1, $2, LOWER($3), $4, $5)
     RETURNING *`,
    [body.first_name, body.last_name, body.email, passwordHash, body.phone_number || null]
  );

  const user = result.rows[0] as UserRow;
  const safeUser = toSafeUser(user);

  // 4. Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    isAdmin: user.is_admin,
  });

  return { user: safeUser, tokens };
};

// ─── Login ──────────────────────────────────────────────────────────
export const login = async (body: LoginBody): Promise<{ user: SafeUser; tokens: TokenPair }> => {
  // 1. Find user by email
  const result = await query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL AND is_active = TRUE",
    [body.email]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const user = result.rows[0] as UserRow;

  // 2. Verify password
  const isValid = await bcrypt.compare(body.password, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // 3. Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    isAdmin: user.is_admin,
  });

  return { user: toSafeUser(user), tokens };
};

// ─── Get user by ID ─────────────────────────────────────────────────
export const getUserById = async (userId: string): Promise<SafeUser | null> => {
  const result = await query(
    "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE",
    [userId]
  );

  if ((result.rowCount ?? 0) === 0) return null;

  return toSafeUser(result.rows[0] as UserRow);
};
