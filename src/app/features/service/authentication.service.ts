import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSession {
  username: string;
  role: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly TENANT_KEY = 'finvane_active_tenant';
  private readonly TOKEN_KEY = 'finvane_auth_token';

  private activeTenantSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.TENANT_KEY) || environment.defaultTenantId
  );
  public activeTenant$ = this.activeTenantSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserSession | null>({
    username: 'admin',
    role: 'ADMIN'
  });
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

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

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }
}
