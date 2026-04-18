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

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  username: string;
  email: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
}

export interface SocialLoginRequest {
  token: string;
}

// Backend serializes this response with snake_case via @JsonProperty
export interface SocialLoginResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  user_id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  errors: string[] | null;
}

export interface VerifyTwoFactorResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  username: string;
  email: string;
}

export interface SetupTwoFactorResponse {
  setup_token_id: string;
  secret: string;
  qr_code_uri: string;
}
