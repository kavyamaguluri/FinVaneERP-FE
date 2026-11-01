import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetEntry, BudgetService } from '../../../service/budget.service';

@Component({
  selector: 'app-budget-list',
  template: `
    <!-- Back Button matching Express -->
    <div class="mb-3">
      <a routerLink="/dashboard" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <!-- Page Header matching Express views/budgets/list.ejs -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Budget vs Actual</h3>
        <div class="subtitle text-muted small">Compares budget entries to actual posted activity for the exact period selected below</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <a routerLink="/budgets/plan" class="btn btn-outline-primary btn-sm">Plan Budget (by month)</a>
        <a [routerLink]="['/budgets/new']" [queryParams]="{ from: fromDate, to: toDate }" class="btn btn-primary btn-sm">
          + New Budget Entry
        </a>
      </div>
    </div>

    <!-- Period Filter matching Express partials/period_filter.ejs -->
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
          <button type="button" class="btn btn-sm btn-primary" (click)="applyFilter()">Apply</button>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetToToday()">Reset to today</button>
        </div>
      </div>
    </div>

    <!-- Chart if rows exist matching Express budgetVsActualChart -->
    <div class="row g-3 mb-3" *ngIf="rows.length > 0">
      <div class="col-12">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <h6 class="fw-bold mb-3">Budget vs Actual by Account</h6>
          <div class="chart-box chart-box-md" style="height: 260px;">
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" height="250px"></p-chart>
          </div>
        </div>
      </div>
    </div>

    <!-- Table matching Express views/budgets/list.ejs -->
    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Account</th>
              <th>Type</th>
              <th class="text-end">Budget</th>
              <th class="text-end">Actual</th>
              <th class="text-end">Variance</th>
              <th class="text-end">Variance %</th>
              <th>Notes</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows">
              <td class="fw-bold">{{ r.code }} &mdash; {{ r.name }}</td>
              <td class="text-capitalize">{{ r.type }}</td>
              <td class="text-end">{{ r.amount | number:'1.2-2' }}</td>
              <td class="text-end">{{ r.actual | number:'1.2-2' }}</td>
              <td class="text-end" [ngClass]="r.variance < 0 ? 'text-danger' : 'text-success'">
                {{ r.variance | number:'1.2-2' }}
              </td>
              <td class="text-end">{{ r.variancePct !== null ? (r.variancePct | number:'1.1-1') + '%' : 'â€”' }}</td>
              <td class="small text-muted">{{ r.notes || 'â€”' }}</td>
              <td class="text-nowrap text-end">
                <a [routerLink]="['/budgets', r.id, 'edit']" class="btn btn-sm btn-outline-secondary me-1">Edit</a>
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="onDelete(r.id, r.code, r.name)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="rows.length === 0">
              <td colspan="8" class="text-center text-muted py-4">
                No budget entries for this exact period yet &mdash; set the From/To above to match a budget entry's period, or create a new one.
              </td>
            </tr>
          </tbody>
          <tfoot *ngIf="rows.length > 0">
            <tr class="fw-bold">
              <td colspan="2">Total</td>
              <td class="text-end">{{ totalBudget | number:'1.2-2' }}</td>
              <td class="text-end">{{ totalActual | number:'1.2-2' }}</td>
              <td class="text-end" [ngClass]="(totalActual - totalBudget) < 0 ? 'text-danger' : 'text-success'">
                {{ (totalActual - totalBudget) | number:'1.2-2' }}
              </td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
})
export class BudgetListComponent implements OnInit {
  granularity = 'custom';
  fromDate = '2026-09-07';
  toDate = '2026-10-24';
  activeTenantId = '1';

  rows: BudgetEntry[] = [];
  chartData: any;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' } }
    }
  };

  totalBudget = 0;
  totalActual = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    this.route.queryParams.subscribe(qp => {
      if (qp['from']) this.fromDate = qp['from'];
      if (qp['to']) this.toDate = qp['to'];
      if (qp['granularity']) this.granularity = qp['granularity'];
      this.loadBudgets();
    });

    if (!this.route.snapshot.queryParams['from']) {
      if (this.activeTenantId === '2') {
        this.fromDate = this.getFyStart();
        this.toDate = this.getToday();
      } else {
        this.fromDate = this.getFyStart();
        this.toDate = this.getToday();
      }
      this.loadBudgets();
    }
  }

  onGranularityChange() {
    if (this.granularity === 'monthly') {
      this.fromDate = this.getMonthStart();
      this.toDate = this.getMonthEnd();
    } else if (this.granularity === 'quarterly') {
      this.fromDate = this.getQuarterStart();
      this.toDate = this.getQuarterEnd();
    } else if (this.granularity === 'annually') {
      this.fromDate = this.getFyStart();
      this.toDate = this.getFyEnd();
    }
    this.applyFilter();
  }

  applyFilter() {
    this.router.navigate(['/budgets'], {
      queryParams: {
        from: this.fromDate,
        to: this.toDate,
        granularity: this.granularity
      }
    });
  }

  resetToToday() {
    this.granularity = 'custom';
    if (this.activeTenantId === '2') {
      this.fromDate = this.getFyStart();
      this.toDate = this.getToday();
    } else {
      this.fromDate = this.getFyStart();
      this.toDate = this.getToday();
    }
    this.applyFilter();
  }

  loadBudgets() {
    this.rows = this.budgetService.getBudgetsForPeriod(this.activeTenantId, this.fromDate, this.toDate);
    this.totalBudget = this.rows.reduce((acc, r) => acc + r.amount, 0);
    this.totalActual = this.rows.reduce((acc, r) => acc + r.actual, 0);

    if (this.rows.length > 0) {
      this.chartData = {
        labels: this.rows.map(r => `${r.code} - ${r.name}`),
        datasets: [
          {
            label: 'Budget',
            data: this.rows.map(r => r.amount),
            backgroundColor: '#94a3b8',
            borderRadius: 6
          },
          {
            label: 'Actual',
            data: this.rows.map(r => r.actual),
            backgroundColor: '#0d9488',
            borderRadius: 6
          }
        ]
      };
    }
  }

  onDelete(id: number, code: string, name: string) {
    if (confirm(`Delete the budget entry for ${code} â€” ${name}? This cannot be undone.`)) {
      this.budgetService.deleteBudget(id);
      this.loadBudgets();
    }
  }

  // === Dynamic Date Helpers ===
  private fmt(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  getToday(): string { return this.fmt(new Date()); }
  getFyStart(): string {
    const now = new Date();
    const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return fy + '-04-01';
  }
  getFyEnd(): string {
    const now = new Date();
    const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return (fy + 1) + '-03-31';
  }
  getMonthStart(): string {
    const n = new Date();
    return this.fmt(new Date(n.getFullYear(), n.getMonth(), 1));
  }
  getMonthEnd(): string {
    const n = new Date();
    return this.fmt(new Date(n.getFullYear(), n.getMonth() + 1, 0));
  }
  getQuarterStart(): string {
    const now = new Date();
    const mInFy = (now.getMonth() - 3 + 12) % 12;
    const qm = Math.floor(mInFy / 3) * 3 + 3;
    const yr = qm > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
    return this.fmt(new Date(yr, qm, 1));
  }
  getQuarterEnd(): string {
    const now = new Date();
    const mInFy = (now.getMonth() - 3 + 12) % 12;
    const qm = Math.floor(mInFy / 3) * 3 + 3;
    const yr = qm > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
    return this.fmt(new Date(yr, qm + 3, 0));
  }
  // ============================
}
