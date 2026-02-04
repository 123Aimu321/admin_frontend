export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  school_id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface User {
  user_id: number;
  school_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'principal' | 'teacher' | 'student';
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}