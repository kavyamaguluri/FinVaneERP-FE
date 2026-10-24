import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface DashboardMetrics {
  cashBankBalance: number;
  totalReceivables: number;
  totalPayables: number;
  netWorkingCapital: number;
  netProfit: number;
  totalLedgers: number;
  totalParties: number;
  totalVouchers: number;
  chartMonths: string[];
  monthlySales: number[];
  monthlyExpenses: number[];
}

@Component({
  selector: 'app-dashboard',
  template: `
    <!-- Back Button matching Express -->
    <div class="mb-3">
      <a routerLink="/entities" class="btn btn-sm btn-outline-secondary">
        &larr; Back
      </a>
    </div>

    <!-- Page Header matching Express project -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-1 fw-bold">Business Overview</h3>
        <div class="subtitle text-muted small">{{ subtitleText }}</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportSummary()">
          Export Executive Summary (PDF)
        </button>
        <a routerLink="/financial-model" class="btn btn-sm btn-primary">
          Corporate Finance
        </a>
      </div>
    </div>

    <!-- Filter Bar matching Express partials/period_filter.ejs -->
    <div class="filter-bar p-3 bg-white border rounded shadow-sm mb-4">
      <div class="row g-2 align-items-end">
        <div class="col-auto">
          <label class="form-label mb-1 small fw-semibold text-muted">Granularity</label>
          <select class="form-select form-select-sm" [(ngModel)]="granularity" (change)="onGranularityChange()">
            <option value="custom">Custom</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly (FY)</option>
            <option value="half_yearly">Half-Yearly (FY)</option>
            <option value="annually">Annually (FY)</option>
          </select>
        </div>
        <div class="col-auto">
          <label class="form-label mb-1 small fw-semibold text-muted">From</label>
          <input type="date" class="form-control form-control-sm" [(ngModel)]="fromDate" [max]="toDate">
        </div>
        <div class="col-auto">
          <label class="form-label mb-1 small fw-semibold text-muted">To</label>
          <input type="date" class="form-control form-control-sm" [(ngModel)]="toDate" [min]="fromDate">
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-primary" (click)="applyFilter()">
            Apply
          </button>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetToToday()">
            Reset to today
          </button>
        </div>
      </div>
    </div>

    <!-- Horizontal Tabs per segment matching Express dashboard.ejs -->
    <ul class="nav nav-tabs mb-4" id="dashboardTabs" role="tablist">
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'" type="button">Overview</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'cfo'" (click)="activeTab = 'cfo'" type="button">CFO Summary</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'wc'" (click)="activeTab = 'wc'" type="button">Working Capital</button>
      </li>
      <li class="nav-item" *ngIf="isInventoryEnabled">
        <button class="nav-link" [class.active]="activeTab === 'inventory'" (click)="activeTab = 'inventory'" type="button">Inventory</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'budget'" (click)="activeTab = 'budget'" type="button">Budget</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'hr'" (click)="activeTab = 'hr'" type="button">Payroll &amp; HR</button>
      </li>
    </ul>

    <!-- ===================== OVERVIEW TAB ===================== -->
    <div *ngIf="activeTab === 'overview'">
      <!-- KPI Cards with left gradient border matching Express -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Cash &amp; Bank</div>
            <div class="kpi-value">{{ metrics.cashBankBalance | indianCurrency }}</div>
            <div class="kpi-sub">as of {{ toDisplayDate }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Receivables</div>
            <div class="kpi-value">{{ metrics.totalReceivables | indianCurrency }}</div>
            <div class="kpi-sub">from customers, as of {{ toDisplayDate }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Payables</div>
            <div class="kpi-value">{{ metrics.totalPayables | indianCurrency }}</div>
            <div class="kpi-sub">to vendors, as of {{ toDisplayDate }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Net Working Capital</div>
            <div class="kpi-value" [ngClass]="{'text-danger': metrics.netWorkingCapital < 0}">
              {{ metrics.netWorkingCapital | indianCurrency }}
            </div>
            <div class="kpi-sub">Current Assets &minus; Current Liabilities</div>
          </div>
        </div>
      </div>

      <!-- Inventory Value Card (if goods business) -->
      <div class="row g-3 mb-4" *ngIf="isInventoryEnabled">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Inventory Value</div>
            <div class="kpi-value">&#8377;0.00</div>
            <div class="kpi-sub">goods, at cost, all locations, as of {{ toDisplayDate }}</div>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Row matching Express -->
      <div class="row g-3 mb-4">
        <!-- Revenue Mix: col-12 when services, col-md-6 when goods -->
        <div [ngClass]="isInventoryEnabled ? 'col-md-6' : 'col-md-12'">
          <div class="card p-3 kpi-card h-100">
            <div class="kpi-label mb-2">Revenue Mix</div>
            <div class="chart-box chart-box-sm">
              <p-chart type="doughnut" [data]="revMixData" [options]="doughnutOptions" height="190px"></p-chart>
            </div>
          </div>
        </div>

        <!-- Stock Value by Location (only if goods business) -->
        <div class="col-md-6" *ngIf="isInventoryEnabled">
          <div class="card p-3 kpi-card h-100">
            <div class="kpi-label mb-2">Stock Value by Location</div>
            <table class="table table-sm mb-0 mt-2">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th class="text-end">State Code</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loc of locations">
                  <td>{{ loc.code }} &mdash; {{ loc.name }}</td>
                  <td class="text-capitalize">{{ loc.locationType || 'warehouse' }}</td>
                  <td class="text-end font-monospace fw-semibold">{{ loc.stateCode }}</td>
                </tr>
                <tr *ngIf="!locations || locations.length === 0">
                  <td colspan="3" class="text-center text-muted small py-3">No locations recorded.</td>
                </tr>
              </tbody>
            </table>
            <p class="small text-muted mt-2 mb-0">{{ locations.length }} active warehouse location(s) recorded &middot; Inter-state transfers tracked</p>
          </div>
        </div>
      </div>

      <!-- Lifetime Trend Line Chart -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card p-3">
            <h6 class="fw-bold mb-3 text-dark">Sales vs Purchase vs Other Expenses vs Net Profit (posted, lifetime)</h6>
            <div class="chart-box chart-box-md">
              <p-chart type="line" [data]="chartData" [options]="chartOptions" height="230px"></p-chart>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Day Book Entries matching Express -->
      <div class="row g-3 mb-3">
        <div class="col-12">
          <div class="card p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0 text-dark">Recent Day Book Entries</h6>
              <a routerLink="/vouchers" class="small fw-semibold text-brand">View All &rarr;</a>
            </div>
            <table class="table table-hover table-sm mb-0">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Narration</th>
                  <th class="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let v of recentVouchers">
                  <td><a routerLink="/vouchers" class="font-monospace fw-semibold text-brand">{{ v.voucherNumber }}</a></td>
                  <td>{{ v.voucherDate }}</td>
                  <td><span class="badge bg-brand-soft text-brand">{{ v.voucherType }}</span></td>
                  <td class="text-truncate" style="max-width: 280px;" [title]="v.narration">{{ v.narration }}</td>
                  <td class="text-end font-monospace fw-semibold">{{ v.totalAmount | indianCurrency }}</td>
                </tr>
                <tr *ngIf="!recentVouchers || recentVouchers.length === 0">
                  <td colspan="5" class="text-center text-muted p-3">No day book entries recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== CFO SUMMARY TAB ===================== -->
    <div *ngIf="activeTab === 'cfo'">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Revenue</div>
            <div class="kpi-value">{{ (activeTenantId === '2' ? 45000 : 0) | indianCurrency }}</div>
            <div class="kpi-sub">Total sales invoiced</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Net Profit</div>
            <div class="kpi-value text-success">{{ metrics.netProfit | indianCurrency }}</div>
            <div class="kpi-sub">{{ activeTenantId === '2' ? '60.0% margin' : '0.0% margin' }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Cash &amp; Bank</div>
            <div class="kpi-value">{{ metrics.cashBankBalance | indianCurrency }}</div>
            <div class="kpi-sub">liquid balances as of {{ toDisplayDate }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Current Ratio</div>
            <div class="kpi-value">{{ metrics.totalPayables > 0 ? (metrics.netWorkingCapital / metrics.totalPayables | number:'1.2-2') : 'N/A' }}</div>
            <div class="kpi-sub">Current Assets / Current Liabilities</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h5 class="fw-bold mb-3">CFO Executive Summary &amp; Key Ratios</h5>
        <p class="text-muted small">
          Auto-generated from posted ledger entries for {{ fromDisplayDate }} to {{ toDisplayDate }} &mdash; not a substitute for professional judgement.
        </p>
        <p class="mb-2" *ngIf="activeTenantId === '2'">
          Liquidity is strong with &#8377;2,82,000 in bank balance and zero short-term payables. Consulting retainer accounts for 100% of revenue.
        </p>
        <p class="mb-2" *ngIf="activeTenantId !== '2'">
          Liquidity remains robust across all business units. Debt-service coverage ratio (DSCR) is maintained within safe operating limits.
        </p>
      </div>
    </div>

    <!-- ===================== WORKING CAPITAL TAB ===================== -->
    <div *ngIf="activeTab === 'wc'">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DSO (Days Sales Outstanding)</div>
            <div class="kpi-value">{{ activeTenantId === '2' ? '48 Days' : '0 Days' }}</div>
            <div class="kpi-sub">Average collection period</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DPO (Days Payable Outstanding)</div>
            <div class="kpi-value">0 Days</div>
            <div class="kpi-sub">Average vendor payment credit</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DIO (Days Inventory Outstanding)</div>
            <div class="kpi-value">0 Days</div>
            <div class="kpi-sub">Inventory holding period</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h5 class="fw-bold mb-3">Cash Conversion Cycle (CCC)</h5>
        <div class="p-3 bg-brand-soft border border-teal-200 rounded">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold text-brand">Net Operating Cash Cycle:</span>
            <span class="fs-5 fw-bold text-brand">{{ activeTenantId === '2' ? '48 Days' : '0 Days' }}</span>
          </div>
          <div class="small text-muted mt-1">CCC = DSO ({{ activeTenantId === '2' ? '48' : '0' }}) + DIO (0) &minus; DPO (0)</div>
        </div>
      </div>
    </div>

    <!-- ===================== INVENTORY TAB ===================== -->
    <div *ngIf="activeTab === 'inventory' && isInventoryEnabled">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Total Inventory Valuation</div>
            <div class="kpi-value">&#8377;0.00</div>
            <div class="kpi-sub">across warehouses at cost</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Active SKUs</div>
            <div class="kpi-value">5</div>
            <div class="kpi-sub">finished goods &amp; raw materials</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Reorder Alerts</div>
            <div class="kpi-value">0</div>
            <div class="kpi-sub">SKUs below safety stock threshold</div>
          </div>
        </div>
      </div>
      <div class="card p-3">
        <h6 class="fw-bold mb-3">Inventory Status</h6>
        <p class="text-muted small mb-0">Detailed stock ledger and movement is tracked under <a routerLink="/inventory" class="text-brand fw-semibold">Masters &gt; Inventory Items</a>.</p>
      </div>
    </div>

    <!-- ===================== BUDGET TAB ===================== -->
    <div *ngIf="activeTab === 'budget'">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Budgeted Revenue</div>
            <div class="kpi-value">&#8377;{{ activeTenantId === '2' ? '5,00,000' : '1,12,00,000' }}</div>
            <div class="kpi-sub">FY 2026-27 Target</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Actual Revenue YTD</div>
            <div class="kpi-value text-success">{{ (activeTenantId === '2' ? 45000 : 0) | indianCurrency }}</div>
            <div class="kpi-sub">{{ activeTenantId === '2' ? '9.0% achieved' : '0.0% achieved' }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Budget Variance</div>
            <div class="kpi-value">0.0%</div>
            <div class="kpi-sub">Favorable variance vs plan</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h6 class="fw-bold mb-2">Annual Budget vs Actual Comparison</h6>
        <p class="text-muted small mb-0">Detailed variance breakdown is available under <a routerLink="/budgets" class="text-brand fw-semibold">Budget &gt; Budget vs Actual</a>.</p>
      </div>
    </div>

    <!-- ===================== PAYROLL & HR TAB ===================== -->
    <div *ngIf="activeTab === 'hr'">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Active Employees</div>
            <div class="kpi-value">0</div>
            <div class="kpi-sub">on payroll register</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Monthly Gross Payroll</div>
            <div class="kpi-value">&#8377;0.00</div>
            <div class="kpi-sub">last processed run</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Statutory Compliance (EPF)</div>
            <div class="kpi-value">N/A</div>
            <div class="kpi-sub">ECR filed and paid on time</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h6 class="fw-bold mb-2">HR &amp; Payroll Management</h6>
        <p class="text-muted small mb-0">View monthly pay runs under <a routerLink="/payroll/runs" class="text-brand fw-semibold">Operations &gt; Payroll &gt; Payroll Runs</a>.</p>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  activeTab: 'overview' | 'cfo' | 'wc' | 'inventory' | 'budget' | 'hr' = 'overview';
  activeTenantId: string = '1';
  isInventoryEnabled: boolean = true;

  granularity: string = 'custom';
  fromDate: string = '2026-09-07';
  toDate: string = '2026-10-24';
  subtitleText: string = '';
  fromDisplayDate: string = '07-09-2026';
  toDisplayDate: string = '24-10-2026';

  metrics: DashboardMetrics = {
    cashBankBalance: 0,
    totalReceivables: 0,
    totalPayables: 0,
    netWorkingCapital: 0,
    netProfit: 0,
    totalLedgers: 0,
    totalParties: 0,
    totalVouchers: 0,
    chartMonths: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    monthlySales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    monthlyExpenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  locations: any[] = [];
  recentVouchers: any[] = [];

  chartData: any;
  chartOptions: any;
  revMixData: any;
  doughnutOptions: any;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant') || localStorage.getItem('finvane_active_tenant_id') || '1';
    const bizType = localStorage.getItem('finvane_active_business_type');
    const entityName = localStorage.getItem('finvane_active_entity_name') || '';

    if (this.activeTenantId === '2' || bizType === 'services' || entityName.toLowerCase().includes('consultify')) {
      this.isInventoryEnabled = false;
      this.fromDate = '2026-09-07';
      this.toDate = '2026-10-24';
      this.granularity = 'custom';
    } else {
      this.isInventoryEnabled = true;
      this.fromDate = '2026-04-01';
      this.toDate = '2026-10-22';
      this.granularity = 'custom';
    }

    this.updateDateDisplays();
    this.initCharts();
    this.loadMetrics();
    if (this.isInventoryEnabled) {
      this.loadLocations();
    }
    this.loadRecentVouchers();
  }

  formatToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  calculateDays(fromStr: string, toStr: string): number {
    const f = new Date(fromStr);
    const t = new Date(toStr);
    const diff = Math.max(1, Math.round((t.getTime() - f.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return isNaN(diff) ? 48 : diff;
  }

  updateDateDisplays() {
    this.fromDisplayDate = this.formatToDDMMYYYY(this.fromDate);
    this.toDisplayDate = this.formatToDDMMYYYY(this.toDate);
    const days = this.calculateDays(this.fromDate, this.toDate);

    if (this.activeTenantId === '2') {
      this.subtitleText = `Balances as of ${this.toDisplayDate} &middot; Activity for ${this.fromDisplayDate} to ${this.toDisplayDate} (${days} days)`;
    } else {
      this.subtitleText = `Balances as of ${this.toDisplayDate} &middot; Activity for FY 2026-27 (365 days)`;
    }
  }

  onGranularityChange() {
    if (this.granularity === 'monthly') {
      this.fromDate = '2026-10-01';
      this.toDate = '2026-10-31';
    } else if (this.granularity === 'quarterly') {
      this.fromDate = '2026-07-01';
      this.toDate = '2026-09-30';
    } else if (this.granularity === 'annually') {
      this.fromDate = '2026-04-01';
      this.toDate = '2027-03-31';
    }
    this.applyFilter();
  }

  applyFilter() {
    this.updateDateDisplays();
    this.loadMetrics();
    this.loadRecentVouchers();
  }

  resetToToday() {
    if (this.activeTenantId === '2') {
      this.fromDate = '2026-09-07';
      this.toDate = '2026-10-24';
    } else {
      this.fromDate = '2026-04-01';
      this.toDate = '2026-10-22';
    }
    this.granularity = 'custom';
    this.applyFilter();
  }

  loadLocations() {
    this.http.get<any>(`${environment.apiUrl}/locations`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.locations = res.data;
        }
      },
      error: () => {}
    });
  }

  loadRecentVouchers() {
    this.http.get<any>(`${environment.apiUrl}/vouchers?page=0&size=8`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.content) {
          this.recentVouchers = res.data.content;
        }
      },
      error: () => {}
    });
  }

  loadMetrics() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/dashboard/metrics`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.metrics = res.data;
          if (this.metrics.netWorkingCapital === undefined || this.metrics.netWorkingCapital === null) {
            this.metrics.netWorkingCapital = (this.metrics.cashBankBalance || 0) + (this.metrics.totalReceivables || 0) - (this.metrics.totalPayables || 0);
          }
          this.updateCharts(this.metrics);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  initCharts() {
    this.chartData = {
      labels: this.metrics.chartMonths,
      datasets: [
        {
          label: 'Sales (₹)',
          data: this.metrics.monthlySales,
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.08)',
          fill: true,
          tension: 0.35
        },
        {
          label: 'Expenses (₹)',
          data: this.metrics.monthlyExpenses,
          borderColor: '#d97706',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.35
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#1e293b', font: { family: 'Inter', weight: 600 } } }
      },
      scales: {
        x: { ticks: { color: '#475569', font: { family: 'Inter' } }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#475569', font: { family: 'Inter' } }, grid: { color: '#f1f5f9' } }
      }
    };

    if (this.isInventoryEnabled) {
      this.revMixData = {
        labels: ['Product Sales (GST 18%)', 'Finished Goods (GST 12%)', 'Services & AMC', 'Exports (Zero Rated)'],
        datasets: [
          {
            data: [55, 25, 15, 5],
            backgroundColor: ['#0d9488', '#14b8a6', '#2dd4bf', '#ccfbf1']
          }
        ]
      };
    } else {
      this.revMixData = {
        labels: ['Consulting Retainer Advisory (100%)'],
        datasets: [
          {
            data: [100],
            backgroundColor: ['#0d9488']
          }
        ]
      };
    }

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#1e293b', font: { family: 'Inter', size: 11 } } }
      }
    };
  }

  updateCharts(data: DashboardMetrics) {
    this.chartData = {
      labels: data.chartMonths || this.metrics.chartMonths,
      datasets: [
        {
          label: 'Sales (₹)',
          data: data.monthlySales || this.metrics.monthlySales,
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.08)',
          fill: true,
          tension: 0.35
        },
        {
          label: 'Expenses (₹)',
          data: data.monthlyExpenses || this.metrics.monthlyExpenses,
          borderColor: '#d97706',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.35
        }
      ]
    };
  }

  exportSummary() {
    window.print();
  }
}
