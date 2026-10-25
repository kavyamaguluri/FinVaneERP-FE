import { Component, OnInit } from '@angular/core';

export interface BudgetRow {
  id: number;
  code: string;
  name: string;
  type: string;
  amount: number;
  actual: number;
  variance: number;
  variancePct: number | null;
  notes: string;
}

@Component({
  selector: 'app-budget-list',
  template: `
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Budget vs Actual</h3>
        <div class="subtitle text-muted small">Compares budget entries to actual posted activity for the exact period selected below</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <a routerLink="/budgets/plan" class="btn btn-outline-primary btn-sm">Plan Budget (by month)</a>
        <button type="button" class="btn btn-primary btn-sm">+ New Budget Entry</button>
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

    <!-- Chart if rows exist -->
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
              <th></th>
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
              <td class="text-end">{{ r.variancePct !== null ? (r.variancePct | number:'1.1-1') + '%' : '—' }}</td>
              <td class="small text-muted">{{ r.notes || '—' }}</td>
              <td class="text-nowrap text-end">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger">Delete</button>
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

  rows: BudgetRow[] = [];
  chartData: any;
  chartOptions: any;

  totalBudget = 0;
  totalActual = 0;

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '2') {
      this.fromDate = '2026-09-07';
      this.toDate = '2026-10-24';
    } else {
      this.fromDate = '2026-04-01';
      this.toDate = '2026-10-22';
    }
    this.loadBudgets();
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
    this.loadBudgets();
  }

  applyFilter() {
    this.loadBudgets();
  }

  resetToToday() {
    this.granularity = 'custom';
    if (this.activeTenantId === '2') {
      this.fromDate = '2026-09-07';
      this.toDate = '2026-10-24';
    } else {
      this.fromDate = '2026-04-01';
      this.toDate = '2026-10-22';
    }
    this.loadBudgets();
  }

  loadBudgets() {
    // Both 1.db and 2.db have 0 budget entries initially matching Express
    this.rows = [];
    this.totalBudget = 0;
    this.totalActual = 0;
  }
}
