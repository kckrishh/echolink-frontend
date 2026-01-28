import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://api.echolink.live/auth';

  private accessToken: string | null = null;
  private loggedIn = new BehaviorSubject<any>(undefined);
  loggedIn$ = this.loggedIn.asObservable();

  private me = new BehaviorSubject<any>(undefined);
  me$ = this.me.asObservable();

  constructor(private http: HttpClient) {}

  login(obj: any): any {
    let username = obj.username;
    let password = obj.password;
    return this.http.post<any>(
      `${this.baseUrl}/login`,
      { username, password },
      { withCredentials: true },
    );
  }

  refresh(): any {
    return this.http
      .get<any>(`${this.baseUrl}/token/refresh`, { withCredentials: true })
      .pipe(tap((res) => this.setAccessToken(res.jwt)));
  }

  initSession(): Observable<void> {
    return this.http
      .get<any>(`${this.baseUrl}/token/refresh`, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.setAccessToken(res.jwt);
        }),
        map(() => void 0),
        catchError(() => {
          this.clearAccessToken();
          return of(void 0);
        }),
      );
  }

  logout(): any {
    return this.http
      .post<void>(`${this.baseUrl}/token/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearAccessToken()));
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    this.loggedIn.next(token);
  }

  getAccessToken() {
    return this.accessToken;
  }

  clearAccessToken() {
    this.loggedIn.next(null);
    this.accessToken = null;
  }

  getMe() {
    return this.http
      .get<any>(`${this.baseUrl}/me`)
      .pipe(tap((res) => this.me.next(res)));
  }

  changeProfile(newUrl: string) {
    return this.http.post<any>(`${this.baseUrl}/changeAvatar`, newUrl);
  }
}
