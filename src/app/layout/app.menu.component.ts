import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../features/service/authentication.service';

@Component({
  selector: 'app-menu',
  template: `
    <div class="layout-menu-container p-3">
      <!-- Role Context Banner -->
      <div class="mb-3 px-3 py-2 border-round surface-50 border-1 surface-border flex align-items-center justify-content-between">
        <div>
          <span class="text-xs text-500 block">User Access Level</span>
          <span class="font-bold text-xs" [ngClass]="getRoleTextColor()">
            <i class="pi mr-1" [ngClass]="getRoleIcon()"></i>{{ getRoleTitle() }}
          </span>
        </div>
        <span class="p-badge text-xxs font-bold" [ngClass]="getRoleBadgeClass()">
          {{ currentRole }}
        </span>
      </div>

      <ul class="layout-menu list-none p-0 m-0">
        <li *ngFor="let item of model" class="mb-3">
          <div class="text-xs uppercase font-bold text-500 mb-2 px-3 tracking-wider">{{ item.label }}</div>
          <ul class="list-none p-0 m-0">
            <li *ngFor="let sub of item.items" class="mb-1">
              <a [routerLink]="sub.routerLink"
                 routerLinkActive="active-menuitem"
                 [routerLinkActiveOptions]="{exact: sub.routerLink === '/'}"
                 class="flex align-items-center gap-3 px-3 py-2 text-700 hover:surface-100 border-round text-sm font-medium transition-colors no-underline cursor-pointer">
                <i [class]="sub.icon" class="text-base"></i>
                <span>{{ sub.label }}</span>
                <span *ngIf="sub.badge" class="p-badge p-badge-danger ml-auto text-xs">{{ sub.badge }}</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .active-menuitem {
      background-color: #eff6ff !important;
      color: #2563eb !important;
      font-weight: 600 !important;
    }
    .active-menuitem i {
      color: #2563eb !important;
    }
    .text-xxs {
      font-size: 0.65rem;
      padding: 0.15rem 0.35rem;
    }
  `]
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];
  currentRole: string = 'CLIENT_USER';

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    this.updateUserRole();
    this.authService.currentUser$.subscribe(() => {
      this.updateUserRole();
      this.buildMenu();
    });
    this.buildMenu();
  }

  updateUserRole() {
    const user = this.authService.getCurrentUser();
    this.currentRole = user?.role || 'CLIENT_USER';
  }

  getRoleTitle(): string {
    if (this.currentRole === 'ADMIN') return 'SYSTEM ADMIN';
    if (this.currentRole === 'CLIENT_ADMIN') return 'CLIENT ADMIN';
    return 'CLIENT USER';
  }

  getRoleTextColor(): string {
    if (this.currentRole === 'ADMIN') return 'text-red-600';
    if (this.currentRole === 'CLIENT_ADMIN') return 'text-blue-600';
    return 'text-green-600';
  }

  getRoleIcon(): string {
    if (this.currentRole === 'ADMIN') return 'pi-shield';
    if (this.currentRole === 'CLIENT_ADMIN') return 'pi-briefcase';
    return 'pi-user';
  }

  getRoleBadgeClass(): string {
    if (this.currentRole === 'ADMIN') return 'p-badge-danger';
    if (this.currentRole === 'CLIENT_ADMIN') return 'p-badge-info';
    return 'p-badge-success';
  }

  buildMenu() {
    const baseMenu: any[] = [
      {
        label: 'Home',
        items: [
          { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/' }
        ]
      },
      {
        label: 'Masters',
        items: [
          { label: 'Chart of Accounts', icon: 'pi pi-sitemap', routerLink: '/masters/accounts' },
          { label: 'Customers & Vendors', icon: 'pi pi-users', routerLink: '/masters/parties' },
          { label: 'Items & Services', icon: 'pi pi-box', routerLink: '/masters/items' },
          { label: 'Locations & Warehouses', icon: 'pi pi-map-marker', routerLink: '/masters/locations' }
        ]
      },
      {
        label: 'Operations (GST)',
        items: [
          { label: 'Sales Invoices', icon: 'pi pi-file-edit', routerLink: '/operations/sales-invoices' },
          { label: 'Sales Quotations', icon: 'pi pi-percentage', routerLink: '/operations/quotations' },
          { label: 'Purchase Bills', icon: 'pi pi-shopping-bag', routerLink: '/operations/purchase-bills' },
          { label: 'Settlements', icon: 'pi pi-check-circle', routerLink: '/operations/settlements' }
        ]
      },
      {
        label: 'Accounting & Ledger',
        items: [
          { label: 'Voucher Entry', icon: 'pi pi-pencil', routerLink: '/vouchers/entry' },
          { label: 'Voucher Register', icon: 'pi pi-list', routerLink: '/vouchers' },
          { label: 'General Ledger', icon: 'pi pi-book', routerLink: '/statutory/general-ledger' },
          { label: 'Trial Balance', icon: 'pi pi-sliders-h', routerLink: '/statutory/trial-balance' }
        ]
      },
      {
        label: 'Statutory & Compliance',
        items: [
          { label: 'Financial Statements (Schedule III)', icon: 'pi pi-chart-bar', routerLink: '/statutory/financials' },
          { label: 'GSTR-1 & 3B Returns', icon: 'pi pi-id-card', routerLink: '/statutory/gst-returns' },
          { label: 'Fixed Assets Register', icon: 'pi pi-database', routerLink: '/assets/register' }
        ]
      }
    ];

    // If Admin (or any user viewing access management), include the Administration section
    if (this.currentRole === 'ADMIN') {
      baseMenu.push({
        label: 'Administration & Security',
        items: [
          { label: 'User Access & Roles', icon: 'pi pi-users', routerLink: '/admin/users', badge: 'ADMIN' }
        ]
      });
    }

    this.model = baseMenu;
  }
}
