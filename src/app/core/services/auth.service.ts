import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiError,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../models/auth.model';

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  user: 'user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
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

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this._loading.set(true);
    this._error.set(null);
    this._serverErrors.set([]);
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiBaseUrl}/v1/auth/login`, credentials),
      );
      if (!res.requiresTwoFactor) {
        localStorage.setItem(STORAGE_KEYS.accessToken, res.accessToken);
        localStorage.setItem(STORAGE_KEYS.refreshToken, res.refreshToken);
        localStorage.setItem(STORAGE_KEYS.accessTokenExpiresAt, res.accessTokenExpiresAt);
        const user: User = { userId: res.userId, username: res.username, email: res.email };
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        this._user.set(user);
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

  verifyEmail(token: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/v1/auth/verify-email`, { token }),
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.accessTokenExpiresAt);
    localStorage.removeItem(STORAGE_KEYS.user);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
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

function extractApiError(err: unknown): { message: string | null; errors: string[] } {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error: unknown }).error;
    if (body && typeof body === 'object') {
      const apiError = body as Partial<ApiError>;
      const errors = Array.isArray(apiError.errors) ? apiError.errors : [];
      // HTTP 401/423/403 — mapeamento de login
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
