import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────
export interface User {
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

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextValue extends AuthState {
  signup: (data: SignupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  signout: () => Promise<void>;
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

// ── API Base URL ───────────────────────────────────────────────────
const API_BASE = typeof window !== "undefined"
  ? (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000"
  : "http://localhost:3000";

// ── Context ────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: false,
    isInitialized: false,
  });

  // Try to restore session on mount (from refresh token cookie)
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const json: ApiResponse<{ access_token: string }> = await res.json();
          if (json.success && json.data) {
            // Fetch user profile with the new token
            const meRes = await fetch(`${API_BASE}/api/auth/me`, {
              headers: { Authorization: `Bearer ${json.data.access_token}` },
              credentials: "include",
            });
            if (meRes.ok) {
              const meJson: ApiResponse<{ user: User }> = await meRes.json();
              if (meJson.success && meJson.data) {
                setState({
                  user: meJson.data.user,
                  accessToken: json.data.access_token,
                  isLoading: false,
                  isInitialized: true,
                });
                return;
              }
            }
          }
        }
      } catch {
        // No valid session
      }
      setState((s) => ({ ...s, isInitialized: true }));
    };
    tryRefresh();
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json: ApiResponse<{ user: User; access_token: string }> =
        await res.json();

      if (!res.ok || !json.success) {
        const msg = json.errors
          ? Object.values(json.errors).join(". ")
          : json.message || "Signup failed";
        throw new Error(msg);
      }

      setState({
        user: json.data!.user,
        accessToken: json.data!.access_token,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json: ApiResponse<{ user: User; access_token: string }> =
        await res.json();

      if (!res.ok || !json.success) {
        const msg = json.errors
          ? Object.values(json.errors).join(". ")
          : json.message || "Login failed";
        throw new Error(msg);
      }

      setState({
        user: json.data!.user,
        accessToken: json.data!.access_token,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const signout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/signout`, {
        method: "POST",
        headers: state.accessToken
          ? { Authorization: `Bearer ${state.accessToken}` }
          : {},
        credentials: "include",
      });
    } catch {
      // Sign out locally even if the API call fails
    }
    setState({ user: null, accessToken: null, isLoading: false, isInitialized: true });
  }, [state.accessToken]);

  return (
    <AuthContext.Provider value={{ ...state, signup, login, signout }}>
      {children}
    </AuthContext.Provider>
  );
}
