export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'TENANT' | 'LANDLORD';
  createdAt: string;
  updatedAt: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'TENANT' | 'LANDLORD';
}