import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, filter, map, of, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  return authService.loggedIn$.pipe(
    filter((state) => state !== undefined),
    take(1),
    map((state) => {
      if (!state) {
        router.navigate(['/auth']);
        return false;
      }
      return true;
    })
  );
};
