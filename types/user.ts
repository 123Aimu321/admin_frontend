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

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'admin' | 'principal' | 'teacher' | 'student';
}