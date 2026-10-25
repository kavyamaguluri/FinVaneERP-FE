import { Component, OnInit } from '@angular/core';

export interface PayrollRunRow {
  id: number;
  periodMonth: number;
  periodYear: number;
  status: string;
}

@Component({
  selector: 'app-payroll-runs',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Payroll Runs</h3>
      </div>
      <div>
        <button type="button" class="btn btn-primary btn-sm">+ Run Payroll</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Period</th>
              <th>Status</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of runs">
              <td>
                <span class="font-monospace fw-bold">{{ r.periodMonth }}/{{ r.periodYear }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="r.status === 'processed' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'">
                  {{ r.status === 'processed' ? 'Posted' : 'Draft' }}
                </span>
              </td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-secondary">View Run</button>
              </td>
            </tr>
            <tr *ngIf="runs.length === 0">
              <td colspan="3" class="text-center text-muted py-4">No payroll runs recorded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PayrollRunsComponent implements OnInit {
  activeTenantId = '1';
  runs: PayrollRunRow[] = [];

  private acmeRuns: PayrollRunRow[] = [
    { id: 29, periodMonth: 8, periodYear: 2026, status: 'processed' },
    { id: 28, periodMonth: 7, periodYear: 2026, status: 'processed' },
    { id: 27, periodMonth: 6, periodYear: 2026, status: 'processed' },
    { id: 26, periodMonth: 5, periodYear: 2026, status: 'processed' },
    { id: 25, periodMonth: 4, periodYear: 2026, status: 'processed' },
    { id: 24, periodMonth: 3, periodYear: 2026, status: 'processed' },
    { id: 23, periodMonth: 2, periodYear: 2026, status: 'processed' },
    { id: 22, periodMonth: 1, periodYear: 2026, status: 'processed' },
    { id: 21, periodMonth: 12, periodYear: 2025, status: 'processed' },
    { id: 20, periodMonth: 11, periodYear: 2025, status: 'processed' },
    { id: 19, periodMonth: 10, periodYear: 2025, status: 'processed' },
    { id: 18, periodMonth: 9, periodYear: 2025, status: 'processed' },
    { id: 17, periodMonth: 8, periodYear: 2025, status: 'processed' },
    { id: 16, periodMonth: 7, periodYear: 2025, status: 'processed' },
    { id: 15, periodMonth: 6, periodYear: 2025, status: 'processed' },
    { id: 14, periodMonth: 5, periodYear: 2025, status: 'processed' },
    { id: 13, periodMonth: 4, periodYear: 2025, status: 'processed' },
    { id: 12, periodMonth: 3, periodYear: 2025, status: 'processed' },
    { id: 11, periodMonth: 2, periodYear: 2025, status: 'processed' },
    { id: 10, periodMonth: 1, periodYear: 2025, status: 'processed' },
    { id: 9, periodMonth: 12, periodYear: 2024, status: 'processed' },
    { id: 8, periodMonth: 11, periodYear: 2024, status: 'processed' },
    { id: 7, periodMonth: 10, periodYear: 2024, status: 'processed' },
    { id: 6, periodMonth: 9, periodYear: 2024, status: 'processed' },
    { id: 5, periodMonth: 8, periodYear: 2024, status: 'processed' },
    { id: 4, periodMonth: 7, periodYear: 2024, status: 'processed' },
    { id: 3, periodMonth: 6, periodYear: 2024, status: 'processed' },
    { id: 2, periodMonth: 5, periodYear: 2024, status: 'processed' },
    { id: 1, periodMonth: 4, periodYear: 2024, status: 'processed' }
  ];

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '2') {
      this.runs = [];
    } else {
      this.runs = [...this.acmeRuns];
    }
  }
}
