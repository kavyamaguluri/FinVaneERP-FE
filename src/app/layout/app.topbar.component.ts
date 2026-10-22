import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, UserSession } from '../features/service/authentication.service';

@Component({
  selector: 'app-topbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3 sticky-top">
      <a class="navbar-brand fw-bold" routerLink="/dashboard" (click)="closeAllMenus()">Fin Vane ERP</a>
      <button class="navbar-toggler" type="button" (click)="toggleMobileNav($event)">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" [class.show]="mobileNavOpen" id="nav">
        <ul class="navbar-nav me-auto">
          <!-- Dashboard -->
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" (click)="closeAllMenus()">Dashboard</a>
          </li>

          <!-- Masters -->
          <li class="nav-item dropdown" [class.show]="openDropdown === 'masters'">
            <a class="nav-link dropdown-toggle" href="javascript:void(0)" (click)="toggleDropdown('masters', $event)">Masters</a>
            <ul class="dropdown-menu" [class.show]="openDropdown === 'masters'">
              <li><a class="dropdown-item" routerLink="/accounts" (click)="closeAllMenus()"><i class="bi bi-journal-text me-2"></i>Chart of Accounts</a></li>
              <li><a class="dropdown-item" routerLink="/accounts/coa-mapping" (click)="closeAllMenus()"><i class="bi bi-diagram-3 me-2"></i>COA Mapping (Schedule III)</a></li>
              <li><a class="dropdown-item" routerLink="/accounts/sector-mapping" (click)="closeAllMenus()"><i class="bi bi-signpost-split me-2"></i>Sector Mapping</a></li>
              <li><a class="dropdown-item" routerLink="/parties" (click)="closeAllMenus()"><i class="bi bi-people me-2"></i>Customers &amp; Vendors</a></li>
              <li><a class="dropdown-item" routerLink="/inventory" (click)="closeAllMenus()"><i class="bi bi-box-seam me-2"></i>Items &amp; Stock</a></li>
              <li><a class="dropdown-item" routerLink="/payroll/employees" (click)="closeAllMenus()"><i class="bi bi-person-badge me-2"></i>Employees</a></li>
            </ul>
          </li>

          <!-- Operations -->
          <li class="nav-item dropdown" [class.show]="openDropdown === 'operations'">
            <a class="nav-link dropdown-toggle" href="javascript:void(0)" (click)="toggleDropdown('operations', $event)">Operations</a>
            <ul class="dropdown-menu" [class.show]="openDropdown === 'operations'">
              <!-- Sales / Purchase Submenu -->
              <li class="dropdown-submenu" [class.show-submenu]="openSubmenu === 'sales_purchase'">
                <a class="dropdown-item dropdown-submenu-toggle" href="javascript:void(0)" (click)="toggleSubmenu('sales_purchase', $event)">
                  <span><i class="bi bi-cart3 me-2"></i>Sales / Purchase</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/invoices" [queryParams]="{type: 'sales'}" (click)="closeAllMenus()"><i class="bi bi-receipt me-2"></i>Sales Invoices</a></li>
                  <li><a class="dropdown-item" routerLink="/invoices" [queryParams]="{type: 'purchase'}" (click)="closeAllMenus()"><i class="bi bi-receipt-cutoff me-2"></i>Purchase Invoices</a></li>
                  <li><a class="dropdown-item" routerLink="/quotations" (click)="closeAllMenus()"><i class="bi bi-file-earmark-text me-2"></i>Sales Quotations</a></li>
                  <li><a class="dropdown-item" routerLink="/orders" [queryParams]="{type: 'sales'}" (click)="closeAllMenus()"><i class="bi bi-cart-check me-2"></i>Sales Orders</a></li>
                  <li><a class="dropdown-item" routerLink="/orders" [queryParams]="{type: 'purchase'}" (click)="closeAllMenus()"><i class="bi bi-cart-plus me-2"></i>Purchase Orders</a></li>
                  <li><a class="dropdown-item" routerLink="/notes" [queryParams]="{type: 'credit'}" (click)="closeAllMenus()"><i class="bi bi-arrow-return-left me-2"></i>Credit Notes</a></li>
                  <li><a class="dropdown-item" routerLink="/notes" [queryParams]="{type: 'debit'}" (click)="closeAllMenus()"><i class="bi bi-arrow-return-right me-2"></i>Debit Notes</a></li>
                </ul>
              </li>

              <!-- Vouchers Submenu -->
              <li class="dropdown-submenu" [class.show-submenu]="openSubmenu === 'vouchers'">
                <a class="dropdown-item dropdown-submenu-toggle" href="javascript:void(0)" (click)="toggleSubmenu('vouchers', $event)">
                  <span><i class="bi bi-journal-text me-2"></i>Vouchers</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/vouchers/new" [queryParams]="{type: 'receipt'}" (click)="closeAllMenus()"><i class="bi bi-download me-2"></i>New Receipt</a></li>
                  <li><a class="dropdown-item" routerLink="/vouchers/new" [queryParams]="{type: 'payment'}" (click)="closeAllMenus()"><i class="bi bi-upload me-2"></i>New Payment</a></li>
                  <li><a class="dropdown-item" routerLink="/vouchers/new" [queryParams]="{type: 'contra'}" (click)="closeAllMenus()"><i class="bi bi-arrow-left-right me-2"></i>New Contra</a></li>
                  <li><a class="dropdown-item" routerLink="/vouchers/new" [queryParams]="{type: 'journal'}" (click)="closeAllMenus()"><i class="bi bi-journal-plus me-2"></i>New Journal</a></li>
                  <li><a class="dropdown-item" routerLink="/vouchers" (click)="closeAllMenus()"><i class="bi bi-journal-text me-2"></i>Day Book (All Vouchers)</a></li>
                </ul>
              </li>

              <!-- Inventory Submenu -->
              <li class="dropdown-submenu" [class.show-submenu]="openSubmenu === 'inventory'">
                <a class="dropdown-item dropdown-submenu-toggle" href="javascript:void(0)" (click)="toggleSubmenu('inventory', $event)">
                  <span><i class="bi bi-box-seam me-2"></i>Inventory</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/transfers" (click)="closeAllMenus()"><i class="bi bi-arrow-left-right me-2"></i>Stock Transfers</a></li>
                  <li><a class="dropdown-item" routerLink="/locations" (click)="closeAllMenus()"><i class="bi bi-geo-alt me-2"></i>Locations</a></li>
                </ul>
              </li>

              <!-- Production Submenu -->
              <li class="dropdown-submenu" [class.show-submenu]="openSubmenu === 'production'">
                <a class="dropdown-item dropdown-submenu-toggle" href="javascript:void(0)" (click)="toggleSubmenu('production', $event)">
                  <span><i class="bi bi-gear-wide-connected me-2"></i>Production</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/production" (click)="closeAllMenus()"><i class="bi bi-clipboard-check me-2"></i>Production Orders</a></li>
                  <li><a class="dropdown-item" routerLink="/production/boms" (click)="closeAllMenus()"><i class="bi bi-diagram-3 me-2"></i>Bills of Material</a></li>
                  <li><a class="dropdown-item" routerLink="/production/raw-materials" (click)="closeAllMenus()"><i class="bi bi-basket me-2"></i>Raw Materials</a></li>
                  <li><a class="dropdown-item" routerLink="/production/profitability" (click)="closeAllMenus()"><i class="bi bi-graph-up-arrow me-2"></i>Product Profitability</a></li>
                </ul>
              </li>

              <li><a class="dropdown-item" routerLink="/inventory/direct-stock" (click)="closeAllMenus()"><i class="bi bi-box-seam me-2"></i>Direct Stock</a></li>

              <!-- Payroll Submenu -->
              <li class="dropdown-submenu" [class.show-submenu]="openSubmenu === 'payroll'">
                <a class="dropdown-item dropdown-submenu-toggle" href="javascript:void(0)" (click)="toggleSubmenu('payroll', $event)">
                  <span><i class="bi bi-people me-2"></i>Payroll</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/payroll/runs" (click)="closeAllMenus()"><i class="bi bi-cash-coin me-2"></i>Payroll Runs</a></li>
                  <li><a class="dropdown-item" routerLink="/payroll/report" (click)="closeAllMenus()"><i class="bi bi-file-earmark-text me-2"></i>Payroll Report</a></li>
                </ul>
              </li>

              <li><a class="dropdown-item" routerLink="/banking" (click)="closeAllMenus()"><i class="bi bi-bank me-2"></i>Banking</a></li>
              <li><a class="dropdown-item" routerLink="/assets/dashboard" (click)="closeAllMenus()"><i class="bi bi-building me-2"></i>Fixed Assets</a></li>
            </ul>
          </li>

          <!-- Reports -->
          <li class="nav-item dropdown" [class.show]="openDropdown === 'reports'">
            <a class="nav-link dropdown-toggle" href="javascript:void(0)" (click)="toggleDropdown('reports', $event)">Reports</a>
            <ul class="dropdown-menu" [class.show]="openDropdown === 'reports'">
              <li><a class="dropdown-item" routerLink="/vouchers" (click)="closeAllMenus()">Day Book</a></li>
              <li><a class="dropdown-item" routerLink="/reports/trial-balance" (click)="closeAllMenus()">Trial Balance</a></li>
              <li><a class="dropdown-item" routerLink="/reports/balance-sheet" (click)="closeAllMenus()">Balance Sheet</a></li>
              <li><a class="dropdown-item" routerLink="/reports/profit-loss" (click)="closeAllMenus()">Profit &amp; Loss</a></li>
              <li><a class="dropdown-item" routerLink="/reports/cash-flow" (click)="closeAllMenus()">Cash Flow</a></li>
            </ul>
          </li>

          <!-- Statutory -->
          <li class="nav-item dropdown" [class.show]="openDropdown === 'statutory'">
            <a class="nav-link dropdown-toggle" href="javascript:void(0)" (click)="toggleDropdown('statutory', $event)">Statutory</a>
            <ul class="dropdown-menu" [class.show]="openDropdown === 'statutory'">
              <li><a class="dropdown-item" routerLink="/reports/financials" (click)="closeAllMenus()">Financials</a></li>
              <li><hr class="dropdown-divider"></li>
              <!-- GST Submenu -->
              <li class="dropdown-submenu" [class.show-submenu]="openSubmenu === 'gst'">
                <a class="dropdown-item dropdown-submenu-toggle" href="javascript:void(0)" (click)="toggleSubmenu('gst', $event)">
                  <span>GST</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/reports/gstr1" (click)="closeAllMenus()">GSTR-1</a></li>
                  <li><a class="dropdown-item" routerLink="/compliance/gstr2-reconciliation" (click)="closeAllMenus()">GSTR-2A/2B Reconciliation</a></li>
                  <li><a class="dropdown-item" routerLink="/reports/gstr3b" (click)="closeAllMenus()">GSTR-3B</a></li>
                </ul>
              </li>
              <li><a class="dropdown-item" routerLink="/reports/epf" (click)="closeAllMenus()">EPF / PF Report</a></li>
            </ul>
          </li>

          <!-- Budget -->
          <li class="nav-item dropdown" [class.show]="openDropdown === 'budget'">
            <a class="nav-link dropdown-toggle" href="javascript:void(0)" (click)="toggleDropdown('budget', $event)">Budget</a>
            <ul class="dropdown-menu" [class.show]="openDropdown === 'budget'">
              <li><a class="dropdown-item" routerLink="/budgets/plan" (click)="closeAllMenus()">Plan Budget</a></li>
              <li><a class="dropdown-item" routerLink="/budgets" (click)="closeAllMenus()">Budget vs Actual</a></li>
            </ul>
          </li>

          <!-- Corporate Finance -->
          <li class="nav-item">
            <a class="nav-link" routerLink="/financial-model" routerLinkActive="active" (click)="closeAllMenus()">Corporate Finance</a>
          </li>
        </ul>

        <!-- Right Side: Entity Switcher, User Details, Sign Out -->
        <a routerLink="/entities" class="btn btn-outline-light btn-sm me-3" title="Switch business" (click)="closeAllMenus()">
          {{ activeEntityName }} &#x25BE;
        </a>
        <span class="navbar-text text-light me-3 small">
          {{ displayName }}
        </span>
        <button type="button" class="btn btn-outline-light btn-sm" (click)="onLogout()">
          Sign out
        </button>
      </div>
    </nav>
  `
})
export class AppTopbarComponent implements OnInit {
  currentUser: UserSession | null = null;
  activeEntityName: string = 'FinVane Enterprise';
  openDropdown: string | null = null;
  openSubmenu: string | null = null;
  mobileNavOpen: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  get displayName(): string {
    const raw = this.currentUser?.fullName || this.currentUser?.username || '';
    const clean = raw.replace(/\s*\([^)]*admin[^)]*\)/gi, '').trim();
    return clean || raw || 'User';
  }

  toggleDropdown(name: string, event: Event) {
    event.stopPropagation();
    if (this.openDropdown === name) {
      this.openDropdown = null;
      this.openSubmenu = null;
    } else {
      this.openDropdown = name;
      this.openSubmenu = null;
    }
  }

  toggleSubmenu(name: string, event: Event) {
    event.stopPropagation();
    this.openSubmenu = this.openSubmenu === name ? null : name;
  }

  toggleMobileNav(event: Event) {
    event.stopPropagation();
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeAllMenus() {
    this.openDropdown = null;
    this.openSubmenu = null;
    this.mobileNavOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  onLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.closeAllMenus();
      this.router.navigate(['/login']);
    }
  }
}
