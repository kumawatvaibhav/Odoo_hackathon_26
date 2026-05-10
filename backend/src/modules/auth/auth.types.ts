// =============================================================================
// Auth Type Definitions
// =============================================================================

export interface SignupBody {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number: string | null;
  profile_photo_url: string | null;
  city: string | null;
  country: string | null;
  language_preference: string;
  is_admin: boolean;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafeUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  profile_photo_url: string | null;
  city: string | null;
  country: string | null;
  language_preference: string;
  is_admin: boolean;
  created_at: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
