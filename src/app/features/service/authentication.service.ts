import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface UserSession {
  username: string;
  fullName: string;
  role: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly TENANT_KEY = 'finvane_active_tenant';
  private readonly TOKEN_KEY = 'finvane_auth_token';
  private readonly USER_KEY = 'finvane_user_session';

  private activeTenantSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.TENANT_KEY) || environment.defaultTenantId
  );
  public activeTenant$ = this.activeTenantSubject.asObservable();

  private currentUserSubject: BehaviorSubject<UserSession | null>;
  public currentUser$;

  constructor(private router: Router) {
    const savedUser = localStorage.getItem(this.USER_KEY);
    const initialUser: UserSession | null = savedUser ? JSON.parse(savedUser) : {
      username: 'admin',
      fullName: 'Admin User',
      role: 'ADMIN'
    };
    this.currentUserSubject = new BehaviorSubject<UserSession | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public getActiveTenant(): string {
    return this.activeTenantSubject.value;
  }

  public setActiveTenant(tenantId: string): void {
    localStorage.setItem(this.TENANT_KEY, tenantId);
    this.activeTenantSubject.next(tenantId);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  public getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  public login(username: string, password: string):boolean {
    if (username && password) {
      const session: UserSession = {
        username: username,
        fullName: username === 'admin' ? 'Admin User' : username,
        role: 'ADMIN',
        token: 'dev_mock_jwt_token_' + Date.now()
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(session));
      localStorage.setItem(this.TOKEN_KEY, session.token!);
      this.currentUserSubject.next(session);
      return true;
    }
    return false;
  }

  public logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
