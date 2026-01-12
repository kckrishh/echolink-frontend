import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private baseUrl: string = 'http://localhost:8080/auth';
  constructor(private http: HttpClient) {}

  registerStart(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/register-start`, {
      email,
      password,
    });
  }

  verifyEmail(email: string, code: string) {
    return this.http.post<any>(`${this.baseUrl}/verify-email`, { email, code });
  }

  completeProfile(
    email: string,
    username: string,
    bio: string,
    avatar: string
  ) {
    return this.http.post<void>(`${this.baseUrl}/complete-profile`, {
      email,
      username,
      bio,
      avatar,
    });
  }
}
