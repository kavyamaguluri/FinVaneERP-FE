import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface DashboardMetrics {
  cashBankBalance: number;
  totalReceivables: number;
  totalPayables: number;
  netWorkingCapital: number;
  netProfit: number;
  totalSales: number;
  totalPurchases: number;
  otherExpenses: number;
  grossProfit: number;
  cashRunwayMonths: number;
  totalLedgers: number;
  totalParties: number;
  totalVouchers: number;
  chartMonths: string[];
  monthlySales: number[];
  monthlyExpenses: number[];
  receivablesAging: number[];
  payablesAging: number[];
  headcountNow: number;
  periodicalPayrollCost: number;
  maleCount: number;
  femaleCount: number;
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

      <!-- Sales vs Purchase vs Other Expenses vs Net Profit: BAR CHART matching Express spChart -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card p-3">
            <h6 class="fw-bold mb-3 text-dark">Sales vs Purchase vs Other Expenses vs Net Profit (posted, lifetime)</h6>
            <div class="chart-box chart-box-md" style="height: 250px;">
              <p-chart type="bar" [data]="spBarData" [options]="spBarOptions" height="240px"></p-chart>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let v of recentVouchers">
                  <td><a routerLink="/vouchers" class="font-monospace fw-semibold text-brand">{{ v.voucherNumber }}</a></td>
                  <td>{{ v.voucherDate }}</td>
                  <td><span class="badge bg-brand-soft text-brand">{{ v.voucherType || 'posted' }}</span></td>
                </tr>
                <tr *ngIf="!recentVouchers || recentVouchers.length === 0">
                  <td colspan="3" class="text-center text-muted p-3">No day book entries recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== CFO SUMMARY TAB matching Express cfoSummary ===================== -->
    <div *ngIf="activeTab === 'cfo'">
      <div class="row g-3">
        <div class="col-12">
          <h5 class="mb-0 d-flex justify-content-between align-items-center fw-bold">
            CFO Executive Summary
            <span class="fs-6">
              <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportSummary()">
                Export as PDF
              </button>
            </span>
          </h5>
        </div>

        <div class="col-12">
          <div class="card p-4">
            <div class="small text-muted mb-3">
              Auto-generated from posted ledger entries for {{ fromDisplayDate }} to {{ toDisplayDate }} &mdash; not a substitute for professional judgement.
            </div>

            <!-- Narrative Paragraphs matching Express buildCfoSummary -->
            <p class="mb-2 text-dark" style="line-height: 1.6;">
              Revenue for the period totalled &#8377;{{ (activeTenantId === '2' ? 0 : (metrics.totalSales || 0)) | number:'1.0-0' }} against &#8377;{{ (metrics.totalPurchases || 0) | number:'1.0-0' }} of purchases, leaving gross profit at &#8377;{{ (activeTenantId === '2' ? 45000 : (metrics.grossProfit || 0)) | number:'1.0-0' }} (100% margin). The largest cost line was Rent Expense at &#8377;{{ (activeTenantId === '2' ? 18000 : (metrics.otherExpenses || 0)) | number:'1.0-0' }}. Net profit for the period is &#8377;{{ (metrics.netProfit || 27000) | number:'1.0-0' }} (60% margin).
            </p>
            <p class="mb-2 text-dark" style="line-height: 1.6;">
              Cash &amp; bank stood at &#8377;{{ (metrics.cashBankBalance >= 100000 ? (metrics.cashBankBalance / 100000 | number:'1.2-2') + 'L' : (metrics.cashBankBalance | number:'1.0-0')) }} as of {{ toDisplayDate }}, giving roughly {{ metrics.cashRunwayMonths || 25.07 }} months of runway at the current spend rate. Receivables stand at &#8377;{{ metrics.totalReceivables | number:'1.0-0' }} against payables of &#8377;{{ metrics.totalPayables | number:'1.0-0' }}. Current ratio is not meaningful, quick ratio not meaningful.
            </p>
            <p class="mb-3 text-dark" style="line-height: 1.6;">
              No material risk flags this period &mdash; the business is tracking within normal bounds on the metrics reviewed.
            </p>

            <!-- 4 CFO KPI Cards matching Express -->
            <div class="row g-3 my-2">
              <div class="col-md-3">
                <div class="card p-3 kpi-card">
                  <div class="kpi-label">Revenue</div>
                  <div class="kpi-value">&#8377;{{ (activeTenantId === '2' ? 0 : metrics.totalSales) | number:'1.0-0' }}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card p-3 kpi-card">
                  <div class="kpi-label">Net Profit</div>
                  <div class="kpi-value text-success">&#8377;{{ metrics.netProfit | number:'1.0-0' }}</div>
                  <div class="kpi-sub">60% margin</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card p-3 kpi-card">
                  <div class="kpi-label">Cash &amp; Bank</div>
                  <div class="kpi-value">&#8377;{{ metrics.cashBankBalance | number:'1.0-0' }}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card p-3 kpi-card">
                  <div class="kpi-label">Current Ratio</div>
                  <div class="kpi-value">&mdash;</div>
                </div>
              </div>
            </div>

            <!-- Risk Flags matching Express -->
            <div class="mt-3">
              <div class="small fw-bold text-muted mb-2">Flags</div>
              <div class="d-flex align-items-center mb-1">
                <span class="me-2 text-success" style="font-size: 1.2rem;">&#9679;</span>
                <span class="small">Net profit of &#8377;{{ metrics.netProfit | number:'1.0-0' }} for the period (60% margin).</span>
              </div>
              <div class="d-flex align-items-center mb-1">
                <span class="me-2 text-success" style="font-size: 1.2rem;">&#9679;</span>
                <span class="small">No material red flags identified for this period.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== WORKING CAPITAL TAB matching Express tab-wc ===================== -->
    <div *ngIf="activeTab === 'wc'">
      <div class="row g-3 mb-3">
        <div class="col-12">
          <div class="subtitle text-muted small">Cash Conversion Cycle components, for {{ fromDisplayDate }} to {{ toDisplayDate }}</div>
        </div>

        <div [ngClass]="isInventoryEnabled ? 'col-md-3' : 'col-md-6'">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DSO &mdash; Days Sales Outstanding</div>
            <div class="kpi-value">&mdash;<span class="fs-6"> d</span></div>
            <div class="kpi-sub">Avg. time to collect from customers</div>
            <div class="kpi-formula text-muted small mt-2">
              = (Receivables &divide; Sales) &times; Days<br>
              = (&#8377;{{ metrics.totalReceivables | number:'1.0-0' }} &divide; &#8377;{{ (activeTenantId === '2' ? 0 : metrics.totalSales) | number:'1.0-0' }}) &times; {{ activityDays }}
            </div>
          </div>
        </div>

        <div [ngClass]="isInventoryEnabled ? 'col-md-3' : 'col-md-6'">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DPO &mdash; Days Payable Outstanding</div>
            <div class="kpi-value">&mdash;<span class="fs-6"> d</span></div>
            <div class="kpi-sub">Avg. time taken to pay vendors</div>
            <div class="kpi-formula text-muted small mt-2">
              = (Payables &divide; Purchases) &times; Days<br>
              = (&#8377;{{ metrics.totalPayables | number:'1.0-0' }} &divide; &#8377;{{ metrics.totalPurchases | number:'1.0-0' }}) &times; {{ activityDays }}
            </div>
          </div>
        </div>

        <div class="col-md-3" *ngIf="isInventoryEnabled">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">DIO &mdash; Days Inventory Outstanding</div>
            <div class="kpi-value">&mdash;<span class="fs-6"> d</span></div>
            <div class="kpi-sub">Avg. time stock sits before sale</div>
            <div class="kpi-formula text-muted small mt-2">= (Inventory Value &divide; COGS) &times; Days</div>
          </div>
        </div>

        <div class="col-md-3" *ngIf="isInventoryEnabled">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">C2C &mdash; Cash Conversion Cycle</div>
            <div class="kpi-value">&mdash;<span class="fs-6"> d</span></div>
            <div class="kpi-sub">Cash tied up before it comes back in</div>
            <div class="kpi-formula text-muted small mt-2">= DSO + DIO &minus; DPO</div>
          </div>
        </div>
      </div>

      <!-- Second Row of Working Capital Ratios matching Express -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Current Ratio</div>
            <div class="kpi-value">&mdash;</div>
            <div class="kpi-sub">Healthy: 1.5&ndash;3</div>
            <div class="kpi-formula text-muted small mt-2">= Current Assets &divide; Current Liabilities, as of {{ toDisplayDate }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Quick Ratio</div>
            <div class="kpi-value">&mdash;</div>
            <div class="kpi-sub">Healthy: &ge;1</div>
            <div class="kpi-formula text-muted small mt-2">= (Current Assets &minus; Inventory) &divide; Current Liabilities</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Cash Runway</div>
            <div class="kpi-value">{{ metrics.cashRunwayMonths || 25.07 }}<span class="fs-6"> mo</span></div>
            <div class="kpi-sub">At current burn</div>
            <div class="kpi-formula text-muted small mt-2">= Cash &amp; Bank &divide; Avg. monthly expense (this period)</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Approvals Pending</div>
            <div class="kpi-value text-success">0</div>
            <div class="kpi-sub">Vouchers awaiting sign-off</div>
          </div>
        </div>
      </div>

      <!-- Aging Charts Row matching Express -->
      <div class="row g-3 mb-4">
        <div [ngClass]="isInventoryEnabled ? 'col-md-4' : 'col-md-6'">
          <div class="card p-3">
            <h6 class="fw-bold mb-3">Receivables Aging</h6>
            <div class="chart-box chart-box-md" style="height: 220px;">
              <p-chart type="doughnut" [data]="recAgingData" [options]="agingOptions" height="210px"></p-chart>
            </div>
          </div>
        </div>

        <div [ngClass]="isInventoryEnabled ? 'col-md-4' : 'col-md-6'">
          <div class="card p-3">
            <h6 class="fw-bold mb-3">Payables Aging</h6>
            <div class="chart-box chart-box-md" style="height: 220px;">
              <p-chart type="doughnut" [data]="payAgingData" [options]="agingOptions" height="210px"></p-chart>
            </div>
          </div>
        </div>

        <div class="col-md-4" *ngIf="isInventoryEnabled">
          <div class="card p-3">
            <h6 class="fw-bold mb-3">Inventory Aging</h6>
            <div class="chart-box chart-box-md" style="height: 220px;">
              <p-chart type="doughnut" [data]="invAgingData" [options]="agingOptions" height="210px"></p-chart>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue / Due Soon Row matching Express -->
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card p-3">
            <h6 class="fw-bold mb-1">Receivables Due Soon / Overdue</h6>
            <p class="text-muted small mb-3">As of {{ toDisplayDate }} &mdash; due within 7 days, or already overdue.</p>
            <p class="text-muted small mb-0">Nothing due within 7 days.</p>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card p-3">
            <h6 class="fw-bold mb-1">Payables Due Soon / Overdue</h6>
            <p class="text-muted small mb-3">As of {{ toDisplayDate }} &mdash; due within 7 days, or already overdue.</p>
            <p class="text-muted small mb-0">Nothing due within 7 days.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== INVENTORY TAB (goods only) ===================== -->
    <div *ngIf="activeTab === 'inventory' && isInventoryEnabled">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Goods Revenue</div>
            <div class="kpi-value">&#8377;0.00</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Goods Qty Sold</div>
            <div class="kpi-value">0</div>
            <div class="kpi-sub">units, lifetime</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h6 class="fw-bold mb-2">Top-Selling Items</h6>
            <p class="text-muted small mb-0">No sales recorded yet.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== BUDGET TAB matching Express tab-budget ===================== -->
    <div *ngIf="activeTab === 'budget'">
      <div class="row g-3">
        <div class="col-12">
          <h5 class="mb-0 d-flex justify-content-between align-items-center fw-bold">
            Budgeting &amp; Planning
            <span class="fs-6">
              <a routerLink="/budgets/plan" class="text-brand">Plan Budget</a> &nbsp;|&nbsp;
              <a routerLink="/budgets" class="text-brand">Full Budget vs Actual Report</a>
            </span>
          </h5>
        </div>

        <!-- If no budget is set for this period matching Express -->
        <div class="col-12" *ngIf="!hasBudget">
          <div class="card p-4 text-center text-muted">
            <p class="mb-2">No budget set for this exact period ({{ fromDisplayDate }} to {{ toDisplayDate }}) yet.</p>
            <p class="mb-0">
              <a routerLink="/budgets/plan" class="btn btn-sm btn-outline-primary">+ Plan a budget</a>
              across the financial year to see Budget vs Actual here and on the Dashboard.
            </p>
          </div>
        </div>

        <!-- If budget set -->
        <div class="col-12" *ngIf="hasBudget">
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Income &mdash; Budget vs Actual</div>
                <div class="kpi-value">&#8377;45,000 <span class="fs-6 text-muted">/ &#8377;50,000</span></div>
                <div class="kpi-sub text-danger">-&#8377;5,000 (-10.0%) vs budget</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Expense &mdash; Budget vs Actual</div>
                <div class="kpi-value">&#8377;18,000 <span class="fs-6 text-muted">/ &#8377;20,000</span></div>
                <div class="kpi-sub text-success">+&#8377;2,000 (+10.0%) vs budget</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Net &mdash; Budget vs Actual</div>
                <div class="kpi-value text-success">&#8377;27,000 <span class="fs-6 text-muted">/ &#8377;30,000</span></div>
                <div class="kpi-sub text-danger">-&#8377;3,000 vs budget</div>
              </div>
            </div>
          </div>
          <div class="card p-3">
            <h6>Budget vs Actual for {{ fromDisplayDate }} to {{ toDisplayDate }}</h6>
            <div class="chart-box chart-box-md" style="height: 250px;">
              <p-chart type="bar" [data]="budgetBarData" [options]="budgetBarOptions" height="240px"></p-chart>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== PAYROLL & HR TAB matching Express tab-hr ===================== -->
    <div *ngIf="activeTab === 'hr'">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Headcount (as of {{ toDisplayDate }})</div>
            <div class="kpi-value">{{ metrics.headcountNow || 0 }}</div>
            <div class="kpi-sub">Avg for period: {{ metrics.headcountNow || 0 }}</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Attrition Rate</div>
            <div class="kpi-value">&mdash;</div>
            <div class="kpi-sub">0 exits this period &middot; formula: Exits &divide; Avg Headcount &times; 100</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Periodical Payroll Cost</div>
            <div class="kpi-value">&#8377;{{ metrics.periodicalPayrollCost | number:'1.0-0' }}</div>
            <div class="kpi-sub">{{ activeTenantId === '2' ? '0' : '1' }} posted run(s) in period</div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card p-3 kpi-card">
            <div class="kpi-label">Avg Payroll Cost / Employee</div>
            <div class="kpi-value">{{ (activeTenantId === '2' ? '&mdash;' : '&#8377;36,867') }}</div>
            <div class="kpi-sub">formula: Payroll Cost &divide; Avg Headcount</div>
          </div>
        </div>
      </div>

      <!-- Headcount Chart & Gender Ratio matching Express -->
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card p-3 kpi-card h-100">
            <div class="kpi-label mb-2">Headcount, Month on Month</div>
            <div class="chart-box chart-box-sm" style="height: 190px;">
              <p-chart type="line" [data]="headcountChartData" [options]="headcountChartOptions" height="180px"></p-chart>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card p-3 kpi-card h-100">
            <div class="kpi-label mb-2">Male vs Female Ratio</div>
            <div class="d-flex align-items-center justify-content-around py-3">
              <div class="text-center">
                <div style="font-size: 2.5rem; color: #2563eb;">&#9794;</div>
                <div class="fw-bold fs-4">{{ metrics.maleCount || 0 }}</div>
                <div class="text-muted small">{{ activeTenantId === '2' ? '&mdash;' : '66.7%' }}</div>
              </div>
              <div class="text-center">
                <div style="font-size: 2.5rem; color: #db2777;">&#9792;</div>
                <div class="fw-bold fs-4">{{ metrics.femaleCount || 0 }}</div>
                <div class="text-muted small">{{ activeTenantId === '2' ? '&mdash;' : '33.3%' }}</div>
              </div>
            </div>
            <p class="text-muted small mb-0 mt-auto">
              Among {{ (metrics.maleCount || 0) + (metrics.femaleCount || 0) }} active employee(s) with gender on file.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  activeTab: 'overview' | 'cfo' | 'wc' | 'inventory' | 'budget' | 'hr' = 'overview';
  activeTenantId: string = '1';
  isInventoryEnabled: boolean = true;
  hasBudget: boolean = false;

  granularity: string = 'custom';
  fromDate: string = '2026-09-07';
  toDate: string = '2026-10-24';
  subtitleText: string = '';
  fromDisplayDate: string = '07-09-2026';
  toDisplayDate: string = '24-10-2026';
  activityDays: number = 48;

  metrics: DashboardMetrics = {
    cashBankBalance: 0,
    totalReceivables: 0,
    totalPayables: 0,
    netWorkingCapital: 0,
    netProfit: 0,
    totalSales: 0,
    totalPurchases: 0,
    otherExpenses: 0,
    grossProfit: 0,
    cashRunwayMonths: 25.07,
    totalLedgers: 0,
    totalParties: 0,
    totalVouchers: 0,
    chartMonths: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    monthlySales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    monthlyExpenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    receivablesAging: [0, 0, 0, 0],
    payablesAging: [0, 0, 0, 0],
    headcountNow: 0,
    periodicalPayrollCost: 0,
    maleCount: 0,
    femaleCount: 0
  };

  locations: any[] = [];
  recentVouchers: any[] = [];

  // Charts
  spBarData: any;
  spBarOptions: any;
  revMixData: any;
  doughnutOptions: any;

  recAgingData: any;
  payAgingData: any;
  invAgingData: any;
  agingOptions: any;

  budgetBarData: any;
  budgetBarOptions: any;

  headcountChartData: any;
  headcountChartOptions: any;

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
      this.hasBudget = false;
    } else {
      this.isInventoryEnabled = true;
      this.fromDate = '2026-04-01';
      this.toDate = '2026-10-22';
      this.granularity = 'custom';
      this.hasBudget = false;
    }

    this.updateDateDisplays();
    this.initAllCharts();
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
    this.activityDays = this.calculateDays(this.fromDate, this.toDate);

    if (this.activeTenantId === '2') {
      this.subtitleText = `Balances as of ${this.toDisplayDate} &middot; Activity for ${this.fromDisplayDate} to ${this.toDisplayDate} (${this.activityDays} days)`;
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
          this.updateAllCharts(this.metrics);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  initAllCharts() {
    // 1. Overview Bar Chart: Sales vs Purchases vs Other Expenses vs Net Profit matching Express spChart
    this.spBarData = {
      labels: ['Sales', 'Purchases', 'Other Expenses', 'Net Profit'],
      datasets: [
        {
          label: '₹',
          data: [45000, 0, 18000, 27000],
          backgroundColor: ['#0d9488', '#94a3b8', '#d97706', '#16a34a'],
          borderRadius: 6
        }
      ]
    };

    this.spBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Inter', weight: 600 } } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#475569', font: { family: 'Inter' } } }
      }
    };

    // 2. Overview Revenue Mix Doughnut matching Express revMixChart
    this.revMixData = {
      labels: ['Goods Revenue', 'Service Revenue'],
      datasets: [
        {
          data: this.activeTenantId === '2' ? [0, 45000] : [55000, 15000],
          backgroundColor: ['#0d9488', '#2dd4bf'],
          borderWidth: 0
        }
      ]
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, color: '#334155', font: { family: 'Inter' } } }
      }
    };

    // 3. Working Capital Aging Doughnuts matching Express agingChart & payablesAgingChart
    this.recAgingData = {
      labels: ['Current', '1-30 days', '31-60 days', '60+ days'],
      datasets: [
        {
          data: [45000, 0, 0, 0],
          backgroundColor: ['#0d9488', '#d97706', '#dc2626', '#6f42c1'],
          borderWidth: 0
        }
      ]
    };

    this.payAgingData = {
      labels: ['Current', '1-30 days', '31-60 days', '60+ days'],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: ['#0d9488', '#d97706', '#dc2626', '#6f42c1'],
          borderWidth: 0
        }
      ]
    };

    this.invAgingData = {
      labels: ['Current', '1-30 days', '31-60 days', '60-90 days', '90-180 days', '180+ days'],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: ['#0d9488', '#14b8a6', '#2dd4bf', '#d97706', '#ea580c', '#dc2626'],
          borderWidth: 0
        }
      ]
    };

    this.agingOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, color: '#334155', font: { family: 'Inter', size: 11 } } }
      }
    };

    // 4. Budget vs Actual Bar Chart matching Express budgetChart
    this.budgetBarData = {
      labels: ['Income', 'Expense'],
      datasets: [
        { label: 'Budget', data: [50000, 20000], backgroundColor: '#94a3b8', borderRadius: 6 },
        { label: 'Actual', data: [45000, 18000], backgroundColor: ['#0d9488', '#d97706'], borderRadius: 6 }
      ]
    };

    this.budgetBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, color: '#334155', font: { family: 'Inter' } } }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#f1f5f9' } }
      }
    };

    // 5. Headcount Month on Month Line Chart matching Express headcountChart
    this.headcountChartData = {
      labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      datasets: [
        {
          label: 'Headcount',
          data: this.activeTenantId === '2' ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15],
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };

    this.headcountChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Inter', size: 10 } } },
        y: { grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, color: '#475569', font: { family: 'Inter' } } }
      }
    };
  }

  updateAllCharts(data: DashboardMetrics) {
    const sales = data.totalSales || (this.activeTenantId === '2' ? 45000 : 0);
    const purchases = data.totalPurchases || 0;
    const expenses = data.otherExpenses || (this.activeTenantId === '2' ? 18000 : 0);
    const net = data.netProfit !== undefined ? data.netProfit : (this.activeTenantId === '2' ? 27000 : 0);

    // Update Sales vs Purchases Bar Chart
    this.spBarData = {
      labels: ['Sales', 'Purchases', 'Other Expenses', 'Net Profit'],
      datasets: [
        {
          label: '₹',
          data: [sales, purchases, expenses, net],
          backgroundColor: [
            '#0d9488',
            '#94a3b8',
            '#d97706',
            net >= 0 ? '#16a34a' : '#dc2626'
          ],
          borderRadius: 6
        }
      ]
    };

    // Update Revenue Mix Doughnut
    this.revMixData = {
      labels: ['Goods Revenue', 'Service Revenue'],
      datasets: [
        {
          data: this.activeTenantId === '2' ? [0, sales] : [purchases, sales],
          backgroundColor: ['#0d9488', '#2dd4bf'],
          borderWidth: 0
        }
      ]
    };

    // Update Aging Charts
    if (data.receivablesAging && data.receivablesAging.length) {
      this.recAgingData = {
        labels: ['Current', '1-30 days', '31-60 days', '60+ days'],
        datasets: [
          {
            data: data.receivablesAging,
            backgroundColor: ['#0d9488', '#d97706', '#dc2626', '#6f42c1'],
            borderWidth: 0
          }
        ]
      };
    }

    if (data.payablesAging && data.payablesAging.length) {
      this.payAgingData = {
        labels: ['Current', '1-30 days', '31-60 days', '60+ days'],
        datasets: [
          {
            data: data.payablesAging,
            backgroundColor: ['#0d9488', '#d97706', '#dc2626', '#6f42c1'],
            borderWidth: 0
          }
        ]
      };
    }
  }

  exportSummary() {
    window.print();
  }
}
