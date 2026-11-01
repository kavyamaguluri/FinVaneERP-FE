import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetService } from '../../../service/budget.service';

export interface BudgetAccountOption {
  id: number;
  code: string;
  name: string;
  type: string;
}

@Component({
  selector: 'app-budget-form',
  template: `
    <div class="page-header mb-3">
      <h4 class="fw-bold mb-0">{{ isEdit ? 'Edit Budget Entry' : 'New Budget Entry' }}</h4>
    </div>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <div class="card p-4 shadow-sm border-0 bg-white">
      <form (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Account (income/expense only)</label>
            <select
              name="account_id"
              class="form-select"
              [(ngModel)]="selectedAccountKey"
              (ngModelChange)="onAccountChange()"
              required
            >
              <option value="">-- select --</option>
              <option *ngFor="let a of accounts" [value]="a.code">
                {{ a.code }} &mdash; {{ a.name }} ({{ a.type }})
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-semibold small text-muted">Period Start</label>
            <input
              type="date"
              name="period_start"
              class="form-control"
              [(ngModel)]="periodStart"
              required
            >
          </div>

          <div class="col-md-3">
            <label class="form-label fw-semibold small text-muted">Period End</label>
            <input
              type="date"
              name="period_end"
              class="form-control"
              [(ngModel)]="periodEnd"
              required
            >
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold small text-muted">Budgeted Amount</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              class="form-control"
              [(ngModel)]="amount"
              placeholder="0.00"
              required
            >
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold small text-muted">Notes</label>
            <input
              type="text"
              name="notes"
              class="form-control"
              [(ngModel)]="notes"
              placeholder="Optional notes or assumptions"
            >
          </div>
        </div>

        <p *ngIf="!isEdit" class="text-muted small mt-3 mb-3">
          Saving again for the same account and exact period updates the existing budget rather than duplicating it.
        </p>

        <div class="mt-3 d-flex gap-2">
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? 'Save Changes' : 'Save Budget Entry' }}
          </button>
          <a routerLink="/budgets" class="btn btn-outline-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  `
})
export class BudgetFormComponent implements OnInit {
  isEdit = false;
  budgetId?: number;
  activeTenantId = '1';
  errorMessage = '';

  accounts: BudgetAccountOption[] = [];
  selectedAccountKey = '';
  periodStart = '';
  periodEnd = '';
  amount: number | null = null;
  notes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    this.initAccounts();

    this.route.queryParams.subscribe(qp => {
      if (qp['from']) this.periodStart = qp['from'];
      if (qp['to']) this.periodEnd = qp['to'];
    });

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.isEdit = true;
      this.budgetId = parseInt(idParam, 10);
      const existing = this.budgetService.getBudgetById(this.budgetId);
      if (existing) {
        this.selectedAccountKey = existing.code;
        this.periodStart = existing.periodStart;
        this.periodEnd = existing.periodEnd;
        this.amount = existing.amount;
        this.notes = existing.notes;
      }
    } else {
      if (this.activeTenantId === '2') {
        this.periodStart = this.getFyStart();
        this.periodEnd = this.getToday();
      } else {
        this.periodStart = this.getFyStart();
        this.periodEnd = this.getToday();
      }
    }
  }

  initAccounts() {
    if (this.activeTenantId === '2') {
      this.accounts = [
        { id: 7, code: '5200', name: 'Rent Expense', type: 'expense' },
        { id: 6, code: '4000', name: 'Consulting Revenue', type: 'income' }
      ];
    } else {
      this.accounts = [
        { id: 18, code: '5000', name: 'Purchases', type: 'expense' },
        { id: 19, code: '5100', name: 'Salary Expense', type: 'expense' },
        { id: 20, code: '5200', name: 'Rent Expense', type: 'expense' },
        { id: 21, code: '5300', name: 'Other Operating Expense', type: 'expense' },
        { id: 27, code: '5301', name: 'Utilities Expense', type: 'expense' },
        { id: 28, code: '5302', name: 'Telephone & Internet Expense', type: 'expense' },
        { id: 29, code: '5303', name: 'Marketing & Advertising Expense', type: 'expense' },
        { id: 25, code: '5900', name: 'Depreciation Expense', type: 'expense' },
        { id: 17, code: '4000', name: 'Sales Revenue', type: 'income' }
      ];
    }
  }

  onAccountChange() {
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.selectedAccountKey) {
      this.errorMessage = 'Please select an account.';
      return;
    }
    if (!this.periodStart || !this.periodEnd) {
      this.errorMessage = 'Period start and end dates are required.';
      return;
    }
    if (this.amount === null || isNaN(this.amount) || this.amount < 0) {
      this.errorMessage = 'Please enter a valid budgeted amount.';
      return;
    }

    const acc = this.accounts.find(a => a.code === this.selectedAccountKey);
    if (!acc) return;

    this.budgetService.saveBudget({
      id: this.budgetId,
      tenantId: this.activeTenantId,
      accountId: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      amount: Number(this.amount),
      notes: this.notes
    });

    this.router.navigate(['/budgets'], {
      queryParams: {
        from: this.periodStart,
        to: this.periodEnd,
        granularity: 'custom'
      }
    });
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
