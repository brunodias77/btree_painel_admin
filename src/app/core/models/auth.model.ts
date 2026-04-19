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
  emailVerified?: boolean;
  roles?: string[];
  profile?: UserProfile | null;
  createdAt?: string;
}

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string | null;
  preferred_currency: string | null;
}

export interface CurrentUserResponse {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  roles: string[];
  profile: UserProfile | null;
  created_at: string;
}

export interface UpdateProfileRequest {
  first_name: string | null;
  last_name: string | null;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  preferred_language: string | null;
  preferred_currency: string | null;
  newsletter_subscribed: boolean;
}

export interface UpdateProfileResponse {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  gender: string | null;
  cpf: string | null;
  preferred_language: string | null;
  preferred_currency: string | null;
  newsletter_subscribed: boolean;
  updated_at: string;
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

export interface AddAddressRequest {
  label?: string | null;
  recipient_name?: string | null;
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string | null;
  is_billing_address: boolean;
}

export interface AddAddressResponse {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_billing_address: boolean;
  created_at: string;
}

export interface AddressItem {
  id: string;
  label: string | null;
  recipientName: string | null;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  isBillingAddress: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListAddressesResponse {
  items: AddressItem[];
}

export type UpdateAddressRequest = AddAddressRequest;

export interface UpdateAddressResponse {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_billing_address: boolean;
  created_at: string;
  updated_at: string;
}

export interface SetDefaultAddressResponse {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_billing_address: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetProfileResponse {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  gender: string | null;
  cpf: string | null;
  preferred_language: string | null;
  preferred_currency: string | null;
  newsletter_subscribed: boolean;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  created_at: string;
  updated_at: string;
}
