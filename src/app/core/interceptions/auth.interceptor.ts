import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

function addBearer(req: import('@angular/common/http').HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Never intercept auth endpoints — avoids refresh loops
  if (req.url.includes('/v1/auth/')) return next(req);

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
