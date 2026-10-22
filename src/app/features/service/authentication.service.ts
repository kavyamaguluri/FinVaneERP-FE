import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface UserSession {
  id?: number;
  username: string;
  email?: string;
  fullName: string;
  role: 'ADMIN' | 'USER' | string;
  token?: string;
  tenantId?: string;
  entityName?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'CLIENT_ADMIN' | 'CLIENT_USER' | string;
  tenantId?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
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
  public currentUser$: Observable<UserSession | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const savedUser = localStorage.getItem(this.USER_KEY);
    const initialUser: UserSession | null = savedUser ? JSON.parse(savedUser) : null;
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
    return this.currentUserSubject.value !== null && !!this.getToken();
  }

  public getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  public register(payload: RegisterPayload): Observable<any> {
    const url = `${environment.apiUrl}/auth/register`;
    return this.http.post<any>(url, payload).pipe(
      tap((res) => {
        if (res && res.data) {
          this.saveSession(res.data);
        }
      })
    );
  }

  public login(credentials: LoginPayload): Observable<any> {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<any>(url, credentials).pipe(
      tap((res) => {
        if (res && res.data) {
          this.saveSession(res.data);
        }
      })
    );
  }

  public saveSession(data: any): void {
    const session: UserSession = {
      id: data.id,
      username: data.username,
      email: data.email,
      fullName: data.fullName || data.username || 'User',
      role: data.role || 'USER',
      token: data.token,
      tenantId: data.tenantId || '1',
      entityName: data.entityName || localStorage.getItem('finvane_active_entity_name') || undefined
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(session));
    if (session.token) {
      localStorage.setItem(this.TOKEN_KEY, session.token);
    }
    if (session.tenantId) {
      this.setActiveTenant(session.tenantId);
    }
    this.currentUserSubject.next(session);
  }

  public logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}

