export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  username: string;
  email: string;
  requiresTwoFactor?: boolean;
  transactionId?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  errors: string[] | null;
}
