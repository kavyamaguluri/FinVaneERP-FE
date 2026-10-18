import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthenticationService, UserSession } from '../features/service/authentication.service';

@Component({
  selector: 'app-topbar',
  template: `
    <div class="layout-topbar flex align-items-center justify-content-between px-4 py-2 border-bottom-1 surface-border surface-card sticky top-0 z-5">
      <div class="flex align-items-center gap-3">
        <button pButton type="button" icon="pi pi-bars" class="p-button-text p-button-rounded p-button-plain" (click)="layoutService.onMenuToggle()"></button>
        <div class="flex align-items-center gap-2 cursor-pointer" routerLink="/">
          <span class="text-2xl font-bold text-primary flex align-items-center gap-2">
            <i class="pi pi-chart-line text-2xl"></i>
            FinVane <span class="text-900 font-semibold text-lg">ERP</span>
          </span>
          <span class="p-badge p-badge-info font-medium ml-2 text-xs">v27.20</span>
        </div>
      </div>

      <div class="flex align-items-center gap-3">
        <!-- Financial Year Badge -->
        <span class="text-xs font-semibold px-2 py-1 surface-100 text-700 border-round hidden sm:inline-flex align-items-center">
          <i class="pi pi-calendar mr-1"></i>FY 2026-27
        </span>

        <!-- User Profile & Dynamic Role Badge -->
        <div class="flex align-items-center gap-2 pl-2 border-left-1 surface-border">
          <p-avatar [label]="getInitials()" shape="circle" [styleClass]="getAvatarClass()"></p-avatar>
          <div class="hidden md:flex flex-column">
            <span class="font-semibold text-xs text-900 leading-tight">{{ currentUser?.fullName || currentUser?.username || 'User' }}</span>
            <div class="flex align-items-center gap-1 mt-1">
              <span class="p-badge text-xxs font-bold" [ngClass]="getRoleBadgeClass()">
                {{ getRoleDisplay() }}
              </span>
              <span class="text-500 text-xxs font-mono">&#64;{{ currentUser?.username }}</span>
            </div>
          </div>

          <button pButton type="button" 
                  icon="pi pi-sign-out" 
                  title="Sign Out" 
                  class="p-button-text p-button-rounded p-button-danger p-button-sm ml-1" 
                  (click)="onLogout()">
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-topbar {
      height: 4rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .text-xxs {
      font-size: 0.65rem;
      padding: 0.15rem 0.4rem;
    }
  `]
})
export class AppTopbarComponent implements OnInit {
  activeTenant: string = '1';
  currentUser: UserSession | null = null;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.activeTenant = this.authService.getActiveTenant();
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  getRoleDisplay(): string {
    const role = this.currentUser?.role;
    if (role === 'ADMIN') return 'ADMIN';
    if (role === 'CLIENT_ADMIN') return 'CLIENT ADMIN';
    return 'CLIENT USER';
  }

  getRoleBadgeClass(): string {
    const role = this.currentUser?.role;
    if (role === 'ADMIN') return 'p-badge-danger';
    if (role === 'CLIENT_ADMIN') return 'p-badge-info';
    return 'p-badge-success';
  }

  getAvatarClass(): string {
    const role = this.currentUser?.role;
    if (role === 'ADMIN') return 'bg-red-600 text-white font-bold';
    if (role === 'CLIENT_ADMIN') return 'bg-blue-600 text-white font-bold';
    return 'bg-teal-600 text-white font-bold';
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    const name = (this.currentUser.fullName || this.currentUser.username || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  }

  onLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
    }
  }
}
