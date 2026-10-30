export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
}
