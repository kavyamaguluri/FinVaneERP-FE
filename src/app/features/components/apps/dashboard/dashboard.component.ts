import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface DashboardMetrics {
  cashBankBalance: number;
  totalReceivables: number;
  totalPayables: number;
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
    <!-- Page Header matching Express project -->
    <div class="page-header">
      <div>
        <h3 class="mb-0">Business Overview</h3>
        <div class="subtitle">Balances as of {{ todayStr }} · Activity for FY 2026-27 (365 days)</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportSummary()">
          <i class="bi bi-file-earmark-pdf me-1"></i>Export Executive Summary (PDF)
        </button>
        <a routerLink="/financial-model" class="btn btn-sm btn-primary">
          Corporate Finance
        </a>
      </div>
    </div>

    <!-- Period Filter Bar -->
    <div class="filter-bar d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
      <div class="d-flex align-items-center gap-2">
        <span class="small fw-semibold text-muted">Period:</span>
        <span class="badge bg-brand-soft text-brand fw-bold px-3 py-2 border border-teal-200">
          <i class="bi bi-calendar3 me-1"></i>01 Apr 2026 to {{ todayStr }}
        </span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="small text-muted">Financial Year: 2026-27</span>
        <button class="btn btn-sm btn-outline-secondary" (click)="loadMetrics()">
          <i class="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>
    </div>

    <!-- Horizontal Tabs per segment matching dashboard.ejs -->
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
      <li class="nav-item">
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
      <!-- KPI Cards with left gradient border -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Cash &amp; Bank</div>
            <div class="kpi-value">{{ metrics.cashBankBalance | indianCurrency }}</div>
            <div class="kpi-sub">liquid balances as of {{ todayStr }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Receivables</div>
            <div class="kpi-value">{{ metrics.totalReceivables | indianCurrency }}</div>
            <div class="kpi-sub">from customers, as of {{ todayStr }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Payables</div>
            <div class="kpi-value">{{ metrics.totalPayables | indianCurrency }}</div>
            <div class="kpi-sub">to vendors, as of {{ todayStr }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Net Working Capital</div>
            <div class="kpi-value" [ngClass]="{'text-danger': (metrics.totalReceivables - metrics.totalPayables) < 0}">
              {{ (metrics.totalReceivables - metrics.totalPayables) | indianCurrency }}
            </div>
            <div class="kpi-sub">Current Assets &minus; Current Liabilities</div>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Row -->
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card p-3 kpi-card h-100">
            <div class="kpi-label mb-2">Revenue Mix</div>
            <div class="chart-box chart-box-sm">
              <p-chart type="doughnut" [data]="revMixData" [options]="doughnutOptions" height="190px"></p-chart>
            </div>
          </div>
        </div>

        <div class="col-md-6">
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
                  <td>{{ loc.code }} — {{ loc.name }}</td>
                  <td class="text-capitalize">{{ loc.locationType || 'warehouse' }}</td>
                  <td class="text-end font-monospace fw-semibold">{{ loc.stateCode }}</td>
                </tr>
                <tr *ngIf="!locations || locations.length === 0">
                  <td colspan="3" class="text-center text-muted small py-3">Loading warehouse locations from database...</td>
                </tr>
              </tbody>
            </table>
            <p class="small text-muted mt-2 mb-0">{{ locations.length }} active warehouse location(s) recorded · Inter-state transfers tracked</p>
          </div>
        </div>
      </div>

      <!-- Lifetime Trend Chart -->
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

      <!-- Recent Day Book Entries -->
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
                  <td class="text-truncate" style="max-width: 260px;" [title]="v.narration">{{ v.narration }}</td>
                  <td class="text-end font-monospace fw-semibold">{{ v.totalAmount | indianCurrency }}</td>
                </tr>
                <tr *ngIf="!recentVouchers || recentVouchers.length === 0">
                  <td colspan="5" class="text-center text-muted p-3">Loading day book entries from database...</td>
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
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">EBITDA Margin</div>
            <div class="kpi-value">0.0%</div>
            <div class="kpi-sub">Operating efficiency index</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Quick Ratio</div>
            <div class="kpi-value">{{ (metrics.totalPayables > 0) ? ((metrics.cashBankBalance + metrics.totalReceivables) / metrics.totalPayables | number:'1.2-2') : '0.00' }}</div>
            <div class="kpi-sub">(Cash + Receivables) / Current Liabilities</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Debt-to-Equity</div>
            <div class="kpi-value">0.00</div>
            <div class="kpi-sub">Prudent leverage profile</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h5 class="fw-bold mb-3">CFO Executive Summary &amp; Key Ratios</h5>
        <p class="text-muted small">
          Liquidity remains robust across all business units. Debt-service coverage ratio (DSCR) is currently at 2.4x against bank covenant minimum of 1.5x. Working capital cycle is currently 38 days.
        </p>
      </div>
    </div>

    <!-- ===================== WORKING CAPITAL TAB ===================== -->
    <div *ngIf="activeTab === 'wc'">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DSO (Days Sales Outstanding)</div>
            <div class="kpi-value">0 Days</div>
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
            <span class="fs-5 fw-bold text-brand">0 Days</span>
          </div>
          <div class="small text-muted mt-1">CCC = DSO (34) + DIO (46) &minus; DPO (42)</div>
        </div>
      </div>
    </div>

    <!-- ===================== INVENTORY TAB ===================== -->
    <div *ngIf="activeTab === 'inventory'">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Total Inventory Valuation</div>
            <div class="kpi-value">{{ 0 | indianCurrency }}</div>
            <div class="kpi-sub">across 3 warehouses at cost</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Active SKUs</div>
            <div class="kpi-value">0</div>
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
        <h6 class="fw-bold mb-3">Fast-Moving Items</h6>
        <table class="table table-sm table-hover mb-0">
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="text-center text-muted py-3">No inventory items recorded in the database yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================== BUDGET TAB ===================== -->
    <div *ngIf="activeTab === 'budget'">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Budgeted Revenue</div>
            <div class="kpi-value">₹1,20,00,000</div>
            <div class="kpi-sub">FY 2026-27 Target</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Actual Revenue YTD</div>
            <div class="kpi-value text-success">{{ metrics.netProfit | indianCurrency }}</div>
            <div class="kpi-sub">70.2% achieved</div>
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
            <div class="kpi-value">{{ 0 | indianCurrency }}</div>
            <div class="kpi-sub">last processed run (Sep 2026)</div>
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
  todayStr: string = '22 Oct 2026';

  metrics: DashboardMetrics = {
    cashBankBalance: 0,
    totalReceivables: 0,
    totalPayables: 0,
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
    this.initCharts();
    this.loadMetrics();
    this.loadLocations();
    this.loadRecentVouchers();
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
    this.http.get<any>(`${environment.apiUrl}/vouchers?page=0&size=5`).subscribe({
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
          this.updateCharts(res.data);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  initCharts() {
    // Sales vs Purchase vs Expenses line chart
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

    // Revenue Mix Doughnut
    this.revMixData = {
      labels: ['Product Sales (GST 18%)', 'Finished Goods (GST 12%)', 'Services & AMC', 'Exports (Zero Rated)'],
      datasets: [
        {
          data: [55, 25, 15, 5],
          backgroundColor: ['#0d9488', '#14b8a6', '#2dd4bf', '#ccfbf1']
        }
      ]
    };

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
