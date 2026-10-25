import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-run-form',
  template: `
    <div class="mb-3">
      <a routerLink="/payroll/runs" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <div class="page-header mb-3">
      <h4 class="fw-bold mb-0">Run Payroll</h4>
    </div>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <div class="card p-4 shadow-sm border-0 bg-white">
      <form (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Month</label>
            <input type="number" min="1" max="12" class="form-control" [(ngModel)]="month" name="month" required>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Year</label>
            <input type="number" class="form-control" [(ngModel)]="year" name="year" required>
          </div>
        </div>

        <p class="small text-muted mt-3 mb-3">
          Computes Basic/HRA/Allowances, PF (12% of Basic) and an illustrative TDS estimate for every active employee, and generates payslips as a draft run. Nothing is posted to the ledger yet &mdash; review the run, then use the "Post to Accounts" button on it to create the journal voucher.
        </p>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary">Run Payroll</button>
          <a routerLink="/payroll/runs" class="btn btn-outline-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class PayrollRunFormComponent implements OnInit {
  month = 10;
  year = 2026;
  errorMessage = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const d = new Date();
    this.month = d.getMonth() + 1;
    this.year = d.getFullYear();
  }

  onSubmit() {
    if (!this.month || this.month < 1 || this.month > 12) {
      this.errorMessage = 'Please enter a valid month (1-12).';
      return;
    }
    if (!this.year || this.year < 2000) {
      this.errorMessage = 'Please enter a valid year.';
      return;
    }
    this.router.navigate(['/payroll/runs']);
  }
}
