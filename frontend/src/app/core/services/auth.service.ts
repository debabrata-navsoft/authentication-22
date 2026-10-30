import { computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginPayload,
  MessageResponse,
  ResetPasswordPayload,
  SignupPayload,
  User,
} from '../../models/user.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(this.read(TOKEN_KEY));
  private readonly _user = signal<User | null>(JSON.parse(this.read(USER_KEY) ?? 'null'));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signup`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    this.http.post<MessageResponse>(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  getMe(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap(({ user }) => {
        this._user.set(user);
        this.write(USER_KEY, JSON.stringify(user));
      }),
    );
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, payload: ResetPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password/${token}`, payload);
  }

  clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    this.remove(TOKEN_KEY);
    this.remove(USER_KEY);
    this.router.navigateByUrl('/login');
  }

  private setSession({ token, user }: AuthResponse): void {
    this._token.set(token);
    this._user.set(user);
    this.write(TOKEN_KEY, token);
    this.write(USER_KEY, JSON.stringify(user));
  }

  private read(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private write(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }

  private remove(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }
}
