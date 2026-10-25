import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  template: `
    <div class="mb-3">
      <a routerLink="/payroll/employees" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <div class="page-header mb-3">
      <h4 class="fw-bold mb-0">{{ isEdit ? 'Edit Employee' : 'New Employee' }}</h4>
    </div>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <div class="card p-4 shadow-sm border-0 bg-white">
      <form (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Name</label>
            <input type="text" class="form-control" [(ngModel)]="name" name="name" required placeholder="Full Name">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Designation</label>
            <input type="text" class="form-control" [(ngModel)]="designation" name="designation" placeholder="e.g. Accountant">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Gender</label>
            <select class="form-select" [(ngModel)]="gender" name="gender">
              <option value="">&mdash; Not specified &mdash;</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Monthly CTC (₹)</label>
            <input type="number" step="0.01" class="form-control" [(ngModel)]="monthlyCtc" name="monthlyCtc" required placeholder="0.00">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Bank Account Number</label>
            <input type="text" class="form-control" [(ngModel)]="bankAccount" name="bankAccount" placeholder="Bank Account Number">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Bank IFSC</label>
            <input type="text" class="form-control" [(ngModel)]="bankIfsc" name="bankIfsc" placeholder="e.g. HDFC0001234">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small text-muted">Date of Joining</label>
            <input type="date" class="form-control" [(ngModel)]="dateOfJoining" name="dateOfJoining" required>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary">{{ isEdit ? 'Save Changes' : 'Save Employee' }}</button>
          <a routerLink="/payroll/employees" class="btn btn-outline-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class EmployeeFormComponent implements OnInit {
  isEdit = false;
  errorMessage = '';

  name = '';
  designation = '';
  gender = '';
  monthlyCtc: number | null = null;
  bankAccount = '';
  bankIfsc = '';
  dateOfJoining = '2026-10-01';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
    }
  }

  onSubmit() {
    if (!this.name.trim()) {
      this.errorMessage = 'Employee name is required.';
      return;
    }
    if (!this.monthlyCtc || this.monthlyCtc <= 0) {
      this.errorMessage = 'Please enter a valid monthly CTC.';
      return;
    }
    this.router.navigate(['/payroll/employees']);
  }
}
