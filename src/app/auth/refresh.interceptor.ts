import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  // ✅ shared across all requests handled by this interceptor instance
  private refreshing = false;
  private refreshDone$ = new BehaviorSubject<boolean>(false);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // ✅ never intercept refresh itself (avoid infinite loop)
    if (req.url.includes('/auth/token/refresh')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // only refresh on auth failures
        if (error.status !== 401 && error.status !== 403) {
          return throwError(() => error);
        }

        // start refresh if not already refreshing
        if (!this.refreshing) {
          this.refreshing = true;
          this.refreshDone$.next(false);

          return this.auth.refresh().pipe(
            switchMap((res: any) => {
              this.refreshing = false;
              this.refreshDone$.next(true);

              // ✅ IMPORTANT: prefer token stored in AuthService
              const latest =
                this.auth.getAccessToken() ?? res.jwt ?? res.accessToken;

              if (!latest) {
                this.auth.clearAccessToken();
                this.router.navigate(['/login']);
                return throwError(() => error);
              }

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${latest}` },
                withCredentials: true,
              });

              return next.handle(retryReq);
            }),
            catchError((refreshErr: HttpErrorResponse) => {
              this.refreshing = false;
              this.refreshDone$.next(false);

              this.auth.clearAccessToken();
              this.router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          ) as Observable<HttpEvent<any>>;
        }

        // otherwise wait for refresh to complete, then retry
        return this.refreshDone$.pipe(
          filter((done) => done),
          take(1),
          switchMap(() => {
            const latest = this.auth.getAccessToken();
            if (!latest) {
              this.auth.clearAccessToken();
              this.router.navigate(['/login']);
              return throwError(() => error);
            }

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${latest}` },
              withCredentials: true,
            });

            return next.handle(retryReq);
          })
        );
      })
    );
  }
}
