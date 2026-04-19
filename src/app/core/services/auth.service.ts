import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddAddressRequest,
  AddAddressResponse,
  ApiError,
  ConfirmPasswordResetRequest,
  CurrentUserResponse,
  ForgotPasswordRequest,
  GetProfileResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  SetupTwoFactorResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
  VerifyTwoFactorResponse,
} from '../models/auth.model';

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  user: 'user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _loading      = signal(false);
  private readonly _error        = signal<string | null>(null);
  private readonly _serverErrors = signal<string[]>([]);
  private readonly _user         = signal<User | null>(this.restoreUser());

  readonly loading      = this._loading.asReadonly();
  readonly error        = this._error.asReadonly();
  readonly serverErrors = this._serverErrors.asReadonly();
  readonly user         = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getAccessToken() && this._user() !== null);

  // Deduplicates concurrent refresh calls — all callers share the same in-flight promise
  private _refreshPromise: Promise<string> | null = null;

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this._loading.set(true);
    this._error.set(null);
    this._serverErrors.set([]);
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiBaseUrl}/v1/auth/login`, credentials),
      );
      if (!res.requiresTwoFactor) {
        this.persistSession(res.accessToken, res.refreshToken, res.accessTokenExpiresAt, {
          userId: res.userId,
          username: res.username,
          email: res.email,
        });
      }
      return res;
    } catch (err: unknown) {
      const { message } = extractApiError(err);
      this._error.set(message ?? 'Erro ao realizar login. Tente novamente.');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    this._loading.set(true);
    this._error.set(null);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/v1/auth/register`, data),
      );
    } catch (err: unknown) {
      const { message, errors } = extractApiError(err);
      this._error.set(message ?? 'Erro ao criar conta. Tente novamente.');
      this._serverErrors.set(errors);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async socialLogin(provider: string, token: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    this._serverErrors.set([]);
    try {
      const res = await firstValueFrom(
        this.http.post<SocialLoginResponse>(
          `${environment.apiBaseUrl}/v1/auth/social/${provider}`,
          { token } satisfies SocialLoginRequest,
        ),
      );
      this.persistSession(res.access_token, res.refresh_token, res.access_token_expires_at, {
        userId: res.user_id,
        username: res.username,
        email: res.email,
      });
    } catch (err: unknown) {
      const { message } = extractApiError(err);
      this._error.set(message ?? 'Erro ao entrar com provedor social. Tente novamente.');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async verifyTwoFactor(transactionId: string, code: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<VerifyTwoFactorResponse>(
          `${environment.apiBaseUrl}/v1/auth/2fa/verify`,
          { transactionId, code },
        ),
      );
      this.persistSession(res.accessToken, res.refreshToken, res.accessTokenExpiresAt, {
        userId: res.userId,
        username: res.username,
        email: res.email,
      });
    } catch (err: unknown) {
      this._error.set(extractTwoFactorError(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async setupTwoFactor(): Promise<SetupTwoFactorResponse> {
    this._loading.set(true);
    this._error.set(null);
    try {
      return await firstValueFrom(
        this.http.post<SetupTwoFactorResponse>(`${environment.apiBaseUrl}/v1/auth/2fa/setup`, {}),
      );
    } catch (err: unknown) {
      const { message } = extractApiError(err);
      this._error.set(message ?? 'Erro ao iniciar configuração. Tente novamente.');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async enableTwoFactor(setupTokenId: string, code: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(
        this.http.post<void>(`${environment.apiBaseUrl}/v1/auth/2fa/enable`, {
          setup_token_id: setupTokenId,
          code,
        }),
      );
    } catch (err: unknown) {
      this._error.set(extractTwoFactorError(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async getCurrentUser(): Promise<User> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<CurrentUserResponse>(`${environment.apiBaseUrl}/v1/users/me`),
      );
      const user = mapCurrentUser(res);
      this.persistUser(user);
      return user;
    } catch (err: unknown) {
      const { message } = extractApiError(err);
      this._error.set(message ?? 'Erro ao carregar perfil. Tente novamente.');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async getProfile(): Promise<GetProfileResponse> {
    this._loading.set(true);
    this._error.set(null);
    try {
      return await firstValueFrom(
        this.http.get<GetProfileResponse>(`${environment.apiBaseUrl}/v1/users`),
      );
    } catch (err: unknown) {
      const { message } = extractApiError(err);
      this._error.set(message ?? 'Erro ao carregar perfil. Tente novamente.');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    this._loading.set(true);
    this._error.set(null);
    this._serverErrors.set([]);
    try {
      const res = await firstValueFrom(
        this.http.put<UpdateProfileResponse>(`${environment.apiBaseUrl}/v1/users/me/profile`, data),
      );
      const current = this._user();
      if (current) {
        this.persistUser({
          ...current,
          profile: {
            first_name: res.first_name,
            last_name: res.last_name,
            display_name: res.display_name,
            avatar_url: res.avatar_url,
            preferred_language: res.preferred_language,
            preferred_currency: res.preferred_currency,
          },
        });
      }
      return res;
    } catch (err: unknown) {
      const { message, errors } = extractApiError(err);
      this._error.set(message ?? 'Erro ao atualizar perfil. Tente novamente.');
      this._serverErrors.set(errors);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async addAddress(data: AddAddressRequest): Promise<AddAddressResponse> {
    this._loading.set(true);
    this._error.set(null);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.post<AddAddressResponse>(`${environment.apiBaseUrl}/v1/users`, data),
      );
    } catch (err: unknown) {
      const { message, errors } = extractApiError(err);
      this._error.set(message ?? 'Erro ao cadastrar endereço. Tente novamente.');
      this._serverErrors.set(errors);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  verifyEmail(token: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/v1/auth/verify-email`, { token }),
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/v1/auth/password/forgot`, data),
    );
  }

  resetPassword(data: ConfirmPasswordResetRequest): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/v1/auth/password/reset`, data),
    );
  }

  /**
   * Troca o refresh token por um novo par de tokens.
   * Chamadas concorrentes recebem a mesma Promise — apenas um request vai ao servidor.
   */
  refreshTokens(): Promise<string> {
    this._refreshPromise ??= this.executeRefresh().finally(() => {
      this._refreshPromise = null;
    });
    return this._refreshPromise;
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    // Clear local state immediately — don't block on server response
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.accessTokenExpiresAt);
    localStorage.removeItem(STORAGE_KEYS.user);
    this._user.set(null);

    // Best-effort: revoke session server-side; ignore failures
    if (refreshToken) {
      firstValueFrom(
        this.http.post<void>(
          `${environment.apiBaseUrl}/v1/auth/logout`,
          { refreshToken } satisfies LogoutRequest,
        ),
      ).catch(() => undefined);
    }

    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  isAccessTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.accessTokenExpiresAt);
    if (!expiresAt) return false;
    // 30 s de buffer para compensar clock skew entre cliente e servidor
    return new Date(expiresAt).getTime() - 30_000 <= Date.now();
  }

  private async executeRefresh(): Promise<string> {
    const storedRefreshToken = this.getRefreshToken();
    if (!storedRefreshToken) {
      this.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    try {
      const res = await firstValueFrom(
        this.http.post<RefreshTokenResponse>(
          `${environment.apiBaseUrl}/v1/auth/refresh`,
          { refreshToken: storedRefreshToken },
        ),
      );
      this.persistSession(res.accessToken, res.refreshToken, res.accessTokenExpiresAt, {
        userId: res.userId,
        username: res.username,
        email: res.email,
      });
      return res.accessToken;
    } catch {
      this.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  private persistSession(
    accessToken: string,
    refreshToken: string,
    expiresAt: string,
    user: User,
  ): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    localStorage.setItem(STORAGE_KEYS.accessTokenExpiresAt, expiresAt);
    this.persistUser(user);
  }

  private persistUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    this._user.set(user);
  }

  private restoreUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}

function mapCurrentUser(res: CurrentUserResponse): User {
  return {
    userId: res.id,
    username: res.username,
    email: res.email,
    emailVerified: res.email_verified,
    roles: res.roles,
    profile: res.profile,
    createdAt: res.created_at,
  };
}

function extractTwoFactorError(err: unknown): string {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: number }).status;
    if (status === 401) return 'Código inválido, transação expirada ou conta bloqueada. Tente novamente.';
    if (status === 403) return 'Conta desativada. Entre em contato com o suporte.';
    if (status === 422) {
      const body = (err as { error?: { message?: string } }).error;
      if (body?.message) return body.message;
      return 'Token de configuração expirado ou inválido.';
    }
  }
  return 'Erro ao verificar código. Tente novamente.';
}

function extractApiError(err: unknown): { message: string | null; errors: string[] } {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error: unknown }).error;
    if (body && typeof body === 'object') {
      const apiError = body as Partial<ApiError>;
      const errors = Array.isArray(apiError.errors) ? apiError.errors : [];
      if ('status' in err) {
        const status = (err as { status: number }).status;
        if (status === 401) return { message: 'Credenciais inválidas.', errors };
        if (status === 423) return { message: 'Conta bloqueada. Tente novamente em 15 minutos.', errors };
        if (status === 403) return { message: 'Conta desativada. Entre em contato com o suporte.', errors };
      }
      return { message: apiError.message ?? null, errors };
    }
  }
  return { message: null, errors: [] };
}
