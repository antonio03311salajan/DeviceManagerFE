import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5133/api/Auth';
  private tokenKey = 'token';

  register(payload: RegisterRequest): Observable<string> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/register`, payload)
      .pipe(map((response) => response.message));
  }

  login(payload: LoginRequest): Observable<string> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, payload)
      .pipe(map((response) => response.Token ?? response.token ?? ''));
  }

  setToken(token: string): void {
    const normalizedToken = token?.trim();

    if (!normalizedToken || normalizedToken === 'undefined' || normalizedToken === 'null') {
      this.clearToken();
      return;
    }

    localStorage.setItem(this.tokenKey, normalizedToken);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);

    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }

    return token;
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
