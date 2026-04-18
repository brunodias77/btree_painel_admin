import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

function addBearer(req: import('@angular/common/http').HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

// Public auth endpoints that must NOT carry a Bearer token.
// /2fa/setup and /2fa/enable are intentionally excluded: they require JWT.
const PUBLIC_AUTH_PATTERNS = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/refresh',
  '/v1/auth/logout',
  '/v1/auth/verify-email',
  '/v1/auth/password/',
  '/v1/auth/social/',
  '/v1/auth/2fa/verify',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip token injection for public auth endpoints — avoids refresh loops
  if (PUBLIC_AUTH_PATTERNS.some(p => req.url.includes(p))) return next(req);

  const auth = inject(AuthService);

  // Proactive refresh: token is about to expire
  if (auth.isAccessTokenExpired()) {
    return from(auth.refreshTokens()).pipe(
      switchMap(newToken => next(addBearer(req, newToken))),
      catchError(err => {
        auth.logout();
        return throwError(() => err);
      }),
    );
  }

  const token = auth.getAccessToken();
  const outgoing = token ? addBearer(req, token) : req;

  // Reactive refresh: catch 401 from server and retry once
  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return from(auth.refreshTokens()).pipe(
          switchMap(newToken => next(addBearer(req, newToken))),
          catchError(refreshErr => {
            auth.logout();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
