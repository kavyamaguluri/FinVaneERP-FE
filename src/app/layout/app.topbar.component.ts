import { Component } from '@angular/core';
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

      <div class="flex align-items-center gap-4">
        <!-- Entity / Company Switcher -->
        <div class="flex align-items-center gap-2 surface-ground px-3 py-1 border-round-2xl border-1 surface-border">
          <i class="pi pi-building text-primary"></i>
          <span class="text-xs text-500 font-medium">Entity:</span>
          <select class="surface-ground border-none text-sm font-semibold text-900 outline-none cursor-pointer"
                  [value]="activeTenant"
                  (change)="onTenantChange($event)">
            <option value="1">Company 1: Pune Manufacturing Ltd (GST 27AABCP1234F1Z5)</option>
            <option value="2">Company 2: FinVane Software & Services</option>
          </select>
        </div>

        <!-- Financial Year Badge -->
        <span class="text-xs font-semibold px-2 py-1 surface-100 text-700 border-round">
          <i class="pi pi-calendar mr-1"></i>FY 2026-27
        </span>

        <!-- User Profile & Logout -->
        <div class="flex align-items-center gap-2 pl-2 border-left-1 surface-border">
          <p-avatar label="AD" shape="circle" styleClass="bg-primary text-white"></p-avatar>
          <div class="hidden md:flex flex-column">
            <span class="font-semibold text-xs text-900 leading-tight">{{ currentUser?.fullName || 'Admin User' }}</span>
            <span class="text-500 text-xs">{{ currentUser?.role || 'Administrator' }}</span>
          </div>
          <button pButton type="button" 
                  icon="pi pi-sign-out" 
                  title="Logout" 
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
  `]
})
export class AppTopbarComponent {
  activeTenant: string = '1';
  currentUser: UserSession | null = null;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthenticationService
  ) {
    this.activeTenant = this.authService.getActiveTenant();
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  onTenantChange(event: any) {
    const newTenant = event.target.value;
    this.authService.setActiveTenant(newTenant);
    window.location.reload();
  }

  onLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
    }
  }
}
