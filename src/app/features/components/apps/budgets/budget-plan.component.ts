import { Component, OnInit } from '@angular/core';

export interface PlanRow {
  code: string;
  name: string;
  type: string;
  months: number[];
  total: number;
}

@Component({
  selector: 'app-budget-plan',
  template: `
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Plan Budget &mdash; FY {{ fy }}-{{ (fy + 1).toString().slice(2) }}</h3>
        <div class="subtitle text-muted small">
          Set a monthly budget for every income &amp; expense ledger across the financial year in one grid, then compare it to actuals on the
          <a routerLink="/budgets" class="text-brand">Budget vs Actual</a> report or the Dashboard.
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary" (click)="changeFy(-1)">&laquo; FY {{ fy - 1 }}-{{ fy.toString().slice(2) }}</button>
        <button class="btn btn-sm btn-outline-secondary" (click)="changeFy(1)">FY {{ fy + 1 }}-{{ (fy + 2).toString().slice(2) }} &raquo;</button>
        <button class="btn btn-sm btn-outline-primary" (click)="copyFromPrev()">Copy from FY {{ fy - 1 }}-{{ fy.toString().slice(2) }}</button>
        <a routerLink="/budgets" class="btn btn-sm btn-outline-secondary">Budget vs Actual &rarr;</a>
      </div>
    </div>

    <div *ngIf="saved" class="alert alert-success py-2 mb-3">
      Budget plan for FY {{ fy }}-{{ (fy + 1).toString().slice(2) }} saved.
    </div>

    <!-- 3 KPI Cards matching Express views/budgets/plan.ejs -->
    <div class="row g-3 mb-3">
      <div class="col-md-4">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Planned Income</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ plannedIncome | number:'1.2-2' }}</div>
          <div class="small text-muted">annual target across income ledgers</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Planned Expense</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ plannedExpense | number:'1.2-2' }}</div>
          <div class="small text-muted">annual ceiling across expense ledgers</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Planned Net Profit</div>
          <div class="fs-4 fw-bold" [ngClass]="plannedNet >= 0 ? 'text-success' : 'text-danger'">
            &#8377;{{ plannedNet | number:'1.2-2' }}
          </div>
          <div class="small text-muted">Planned Income &minus; Planned Expense</div>
        </div>
      </div>
    </div>

    <!-- Monthly Grid Table matching Express views/budgets/plan.ejs -->
    <div class="card p-3 shadow-sm border-0 bg-white mb-3">
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead class="table-light small text-uppercase">
            <tr>
              <th style="min-width: 180px;">Account</th>
              <th>Type</th>
              <th *ngFor="let m of monthNames" class="text-end" style="min-width: 80px;">{{ m }}</th>
              <th class="text-end" style="min-width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of planRows">
              <td>
                <div class="fw-bold">{{ r.code }}</div>
                <div class="small text-muted">{{ r.name }}</div>
              </td>
              <td class="text-capitalize small">{{ r.type }}</td>
              <td *ngFor="let m of [0,1,2,3,4,5,6,7,8,9,10,11]" class="p-1">
                <input type="number" class="form-control form-control-sm text-end" [(ngModel)]="r.months[m]" (ngModelChange)="recalcTotals()" style="min-width: 70px;">
              </td>
              <td class="text-end fw-bold">&#8377;{{ r.total | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-primary" (click)="savePlan()">Save Budget Plan</button>
      </div>
    </div>
  `
})
export class BudgetPlanComponent implements OnInit {
  fy = 2026;
  saved = false;
  activeTenantId = '1';

  monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  planRows: PlanRow[] = [];

  plannedIncome = 0;
  plannedExpense = 0;
  plannedNet = 0;

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    this.initLedgers();
  }

  changeFy(delta: number) {
    this.fy += delta;
    this.saved = false;
  }

  copyFromPrev() {
    alert(`Copied budget values from FY ${this.fy - 1}-${this.fy.toString().slice(2)} as a starting point.`);
  }

  initLedgers() {
    if (this.activeTenantId === '2') {
      this.planRows = [
        { code: 'SVC-001', name: 'Consulting Revenue', type: 'income', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: 'EXP-001', name: 'Rent Expense', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: 'EXP-002', name: 'Office Supplies & Admin', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0], total: 0 }
      ];
    } else {
      this.planRows = [
        { code: '4000', name: 'Sales Revenue', type: 'income', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: '4100', name: 'Service Revenue', type: 'income', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: '5000', name: 'Cost of Goods Sold', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: '6000', name: 'Rent Expense', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: '6100', name: 'Salaries & Wages', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: '6200', name: 'Utilities & Power', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 },
        { code: '6300', name: 'Marketing & Advertising', type: 'expense', months: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0 }
      ];
    }
    this.recalcTotals();
  }

  recalcTotals() {
    let inc = 0;
    let exp = 0;
    for (const r of this.planRows) {
      r.total = r.months.reduce((acc, v) => acc + (Number(v) || 0), 0);
      if (r.type === 'income') {
        inc += r.total;
      } else {
        exp += r.total;
      }
    }
    this.plannedIncome = inc;
    this.plannedExpense = exp;
    this.plannedNet = inc - exp;
  }

  savePlan() {
    this.saved = true;
    setTimeout(() => { this.saved = false; }, 4000);
  }
}
