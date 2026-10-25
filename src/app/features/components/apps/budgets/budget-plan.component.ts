import { Component, OnInit } from '@angular/core';

export interface PlanCell {
  period_start: string;
  amount: number | null;
}

export interface PlanRow {
  id: number;
  code: string;
  name: string;
  type: 'expense' | 'income';
  cells: (number | null)[];
  rowTotal: number;
}

@Component({
  selector: 'app-budget-plan',
  template: `
    <!-- Back Button matching Express -->
    <div class="mb-3">
      <a routerLink="/budgets" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <!-- Page Header matching Express views/budgets/plan.ejs -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-start mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Plan Budget &mdash; FY {{ fy }}-{{ (fy + 1).toString().slice(2) }}</h3>
        <div class="subtitle text-muted small">
          Set a monthly budget for every income &amp; expense ledger across the financial year in one grid, then compare it to actuals on the
          <a routerLink="/budgets" class="text-brand">Budget vs Actual</a> report or the Dashboard.
        </div>
      </div>
      <div class="io-toolbar d-flex flex-wrap gap-2 justify-content-end">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="changeFy(-1)">&laquo; FY {{ fy - 1 }}-{{ fy.toString().slice(2) }}</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="changeFy(1)">FY {{ fy + 1 }}-{{ (fy + 2).toString().slice(2) }} &raquo;</button>
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="copyFromPrev()">Copy from FY {{ fy - 1 }}-{{ fy.toString().slice(2) }}</button>
        <a routerLink="/budgets" class="btn btn-sm btn-outline-secondary">Budget vs Actual &rarr;</a>
      </div>
    </div>

    <div *ngIf="saved" class="alert alert-success py-2 mb-3">
      Budget plan for FY {{ fy }}-{{ (fy + 1).toString().slice(2) }} saved.
    </div>

    <!-- 3 KPI Cards with left accent line matching Express views/budgets/plan.ejs -->
    <div class="row g-3 mb-3">
      <div class="col-md-4">
        <div class="card p-3 kpi-card shadow-sm border-0 bg-white">
          <div class="kpi-label">PLANNED INCOME</div>
          <div class="kpi-value">&#8377;{{ plannedIncome | number:'1.0-0' }}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 kpi-card shadow-sm border-0 bg-white">
          <div class="kpi-label">PLANNED EXPENSE</div>
          <div class="kpi-value">&#8377;{{ plannedExpense | number:'1.0-0' }}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 kpi-card shadow-sm border-0 bg-white">
          <div class="kpi-label">NET PLANNED</div>
          <div class="kpi-value" [ngClass]="plannedNet < 0 ? 'text-danger' : 'text-success'">
            &#8377;{{ plannedNet | number:'1.0-0' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Grid Table matching Express views/budgets/plan.ejs -->
    <div class="card p-0 shadow-sm border-0 bg-white mb-3" style="overflow-x: auto;">
      <table class="table table-sm table-hover align-middle mb-0 budget-plan-table">
        <thead>
          <tr>
            <th style="position: sticky; left: 0; background: #fff; min-width: 220px; z-index: 2;" class="text-uppercase small fw-bold">
              Ledger
            </th>
            <th *ngFor="let m of monthLabels" class="text-end text-uppercase small fw-bold" style="min-width: 105px;">
              {{ m }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Expense Accounts Section -->
          <ng-container *ngIf="expenseRows.length > 0">
            <tr class="table-light">
              <td [attr.colspan]="monthLabels.length + 1" class="fw-bold text-capitalize small text-muted">
                Expense Accounts
              </td>
            </tr>
            <tr *ngFor="let acc of expenseRows">
              <td style="position: sticky; left: 0; background: #fff; z-index: 1;">
                <span class="fw-bold">{{ acc.code }} &mdash; {{ acc.name }}</span>
              </td>
              <td *ngFor="let idx of monthIndices" class="text-end p-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control form-control-sm text-end"
                  [(ngModel)]="acc.cells[idx]"
                  (ngModelChange)="recalcTotals()"
                  placeholder="0.00"
                  style="min-width: 75px;"
                >
              </td>
            </tr>
          </ng-container>

          <!-- Income Accounts Section -->
          <ng-container *ngIf="incomeRows.length > 0">
            <tr class="table-light">
              <td [attr.colspan]="monthLabels.length + 1" class="fw-bold text-capitalize small text-muted">
                Income Accounts
              </td>
            </tr>
            <tr *ngFor="let acc of incomeRows">
              <td style="position: sticky; left: 0; background: #fff; z-index: 1;">
                <span class="fw-bold">{{ acc.code }} &mdash; {{ acc.name }}</span>
              </td>
              <td *ngFor="let idx of monthIndices" class="text-end p-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control form-control-sm text-end"
                  [(ngModel)]="acc.cells[idx]"
                  (ngModelChange)="recalcTotals()"
                  placeholder="0.00"
                  style="min-width: 75px;"
                >
              </td>
            </tr>
          </ng-container>

          <tr *ngIf="expenseRows.length === 0 && incomeRows.length === 0">
            <td [attr.colspan]="monthLabels.length + 1" class="text-center text-muted py-3">
              No active income/expense ledgers yet &mdash; add some in the <a routerLink="/accounts">Chart of Accounts</a> first.
            </td>
          </tr>
        </tbody>
        <tfoot *ngIf="expenseRows.length > 0 || incomeRows.length > 0">
          <tr class="fw-bold table-light">
            <td style="position: sticky; left: 0; background: #f8f9fa; z-index: 1;">
              Month Total
            </td>
            <td *ngFor="let idx of monthIndices" class="text-end">
              {{ monthTotals[idx] | number:'1.2-2' }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Save Button matching Express -->
    <div class="mt-3 d-flex align-items-center">
      <button type="button" class="btn btn-primary" (click)="savePlan()">
        Save Budget Plan
      </button>
      <span class="text-muted small ms-2">
        Blank or zero cells are not saved (and clear any existing entry for that month).
      </span>
    </div>
  `,
  styles: [`
    .kpi-card {
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #0d9488, #0f766e);
    }
    .kpi-label {
      font-size: 0.76rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
    }
    .kpi-value {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .budget-plan-table th,
    .budget-plan-table td {
      border-color: #f1f5f9;
    }
    .btn-primary {
      background-color: #0d9488;
      border-color: #0d9488;
    }
    .btn-primary:hover {
      background-color: #0f766e;
      border-color: #0f766e;
    }
    .btn-outline-primary {
      color: #0d9488;
      border-color: #0d9488;
    }
    .btn-outline-primary:hover {
      background-color: #0d9488;
      color: #fff;
    }
  `]
})
export class BudgetPlanComponent implements OnInit {
  fy = 2026;
  saved = false;
  activeTenantId = '1';

  monthIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  monthLabels: string[] = [];

  expenseRows: PlanRow[] = [];
  incomeRows: PlanRow[] = [];
  monthTotals: number[] = new Array(12).fill(0);

  plannedIncome = 0;
  plannedExpense = 0;
  plannedNet = 0;

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    this.updateMonthLabels();
    this.initLedgers();
  }

  updateMonthLabels() {
    const y1 = this.fy.toString().slice(2);
    const y2 = (this.fy + 1).toString().slice(2);
    this.monthLabels = [
      `APR '${y1}`, `MAY '${y1}`, `JUN '${y1}`, `JUL '${y1}`, `AUG '${y1}`, `SEP '${y1}`,
      `OCT '${y1}`, `NOV '${y1}`, `DEC '${y1}`, `JAN '${y2}`, `FEB '${y2}`, `MAR '${y2}`
    ];
  }

  changeFy(delta: number) {
    this.fy += delta;
    this.saved = false;
    this.updateMonthLabels();
    this.recalcTotals();
  }

  copyFromPrev() {
    alert(`Values below were copied from FY ${this.fy - 1}-${this.fy.toString().slice(2)} as a starting point — nothing is saved until you click Save.`);
  }

  initLedgers() {
    if (this.activeTenantId === '2') {
      // Consultify Services (tenant 2) matching Express 2.db accounts
      this.expenseRows = [
        { id: 7, code: '5200', name: 'Rent Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 }
      ];
      this.incomeRows = [
        { id: 6, code: '4000', name: 'Consulting Revenue', type: 'income', cells: new Array(12).fill(null), rowTotal: 0 }
      ];
    } else {
      // Acme Corp (tenant 1) matching Express 1.db accounts
      this.expenseRows = [
        { id: 18, code: '5000', name: 'Purchases', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 19, code: '5100', name: 'Salary Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 20, code: '5200', name: 'Rent Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 21, code: '5300', name: 'Other Operating Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 27, code: '5301', name: 'Utilities Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 28, code: '5302', name: 'Telephone & Internet Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 29, code: '5303', name: 'Marketing & Advertising Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 25, code: '5900', name: 'Depreciation Expense', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 22, code: '6000', name: 'Inter-Unit Stock Transfer - Out', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 },
        { id: 23, code: '6001', name: 'Inter-Unit Stock Transfer - In', type: 'expense', cells: new Array(12).fill(null), rowTotal: 0 }
      ];
      this.incomeRows = [
        { id: 17, code: '4000', name: 'Sales Revenue', type: 'income', cells: new Array(12).fill(null), rowTotal: 0 }
      ];
    }
    this.recalcTotals();
  }

  recalcTotals() {
    let inc = 0;
    let exp = 0;
    const totals = new Array(12).fill(0);

    for (const r of this.expenseRows) {
      r.rowTotal = 0;
      for (let i = 0; i < 12; i++) {
        const val = Number(r.cells[i]) || 0;
        r.rowTotal += val;
        totals[i] += val;
      }
      exp += r.rowTotal;
    }

    for (const r of this.incomeRows) {
      r.rowTotal = 0;
      for (let i = 0; i < 12; i++) {
        const val = Number(r.cells[i]) || 0;
        r.rowTotal += val;
        totals[i] += val;
      }
      inc += r.rowTotal;
    }

    this.monthTotals = totals;
    this.plannedIncome = inc;
    this.plannedExpense = exp;
    this.plannedNet = inc - exp;
  }

  savePlan() {
    this.saved = true;
    setTimeout(() => { this.saved = false; }, 4000);
  }
}
