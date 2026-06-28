import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = tokenService.get();

  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const isLoginRequest = request.url.endsWith('/login');
  const isRefreshRequest = request.url.endsWith('/refresh');

  if (!token || !isApiRequest || isLoginRequest) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      const canRefresh =
        error.status === 401 &&
        !isRefreshRequest &&
        Boolean(tokenService.get());

      if (!canRefresh) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(() => {
          const refreshedToken = tokenService.get();

          if (!refreshedToken) {
            return throwError(() => error);
          }

          return next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`,
              },
            }),
          );
        }),
        catchError((refreshError: unknown) => {
          authService.clearSession();

          const returnUrl = router.url;
          void router.navigate(['/login'], {
            queryParams:
              returnUrl !== '/login' ? { returnUrl } : undefined,
          });

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
