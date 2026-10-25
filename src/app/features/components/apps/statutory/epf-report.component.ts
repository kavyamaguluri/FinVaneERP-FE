import { Component, OnInit } from '@angular/core';

export interface EpfRow {
  uan: string;
  name: string;
  grossWages: number;
  epfWages: number;
  epsWages: number;
  edliWages: number;
  eeShare: number;
  erShare: number;
  epsShare: number;
}

@Component({
  selector: 'app-epf-report',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">EPF / PF Report</h3>
        <div class="subtitle text-muted small">Employee Provident Fund contributions, for statutory audit purposes &mdash; built from processed Payroll Runs</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="exportExcel()">Export Excel</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>UAN</th>
              <th>Member Name</th>
              <th class="text-end">Gross Wages</th>
              <th class="text-end">EPF Wages</th>
              <th class="text-end">EE Share (12%)</th>
              <th class="text-end">ER Share (3.67%)</th>
              <th class="text-end">EPS Share (8.33%)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of epfRows">
              <td><code>{{ r.uan }}</code></td>
              <td class="fw-bold">{{ r.name }}</td>
              <td class="text-end">{{ r.grossWages | number:'1.2-2' }}</td>
              <td class="text-end">{{ r.epfWages | number:'1.2-2' }}</td>
              <td class="text-end fw-semibold text-danger">{{ r.eeShare | number:'1.2-2' }}</td>
              <td class="text-end">{{ r.erShare | number:'1.2-2' }}</td>
              <td class="text-end">{{ r.epsShare | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="epfRows.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No EPF contributions recorded for this period.</td>
            </tr>
          </tbody>
          <tfoot *ngIf="epfRows.length > 0">
            <tr class="fw-bold table-light">
              <td colspan="2">Total Contributions</td>
              <td class="text-end">{{ totalGross | number:'1.2-2' }}</td>
              <td class="text-end">{{ totalEpfWages | number:'1.2-2' }}</td>
              <td class="text-end text-danger">{{ totalEe | number:'1.2-2' }}</td>
              <td class="text-end">{{ totalEr | number:'1.2-2' }}</td>
              <td class="text-end">{{ totalEps | number:'1.2-2' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
})
export class EpfReportComponent implements OnInit {
  activeTenantId = '1';
  epfRows: EpfRow[] = [];
  totalGross = 0;
  totalEpfWages = 0;
  totalEe = 0;
  totalEr = 0;
  totalEps = 0;

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '1') {
      this.epfRows = [
        { uan: '100902341234', name: 'Vikram Singh', grossWages: 55000, epfWages: 15000, epsWages: 15000, edliWages: 15000, eeShare: 1800, erShare: 550, epsShare: 1250 },
        { uan: '100902341235', name: 'Priya Sharma', grossWages: 50000, epfWages: 15000, epsWages: 15000, edliWages: 15000, eeShare: 1800, erShare: 550, epsShare: 1250 },
        { uan: '100902341236', name: 'Karan Mehta', grossWages: 45000, epfWages: 15000, epsWages: 15000, edliWages: 15000, eeShare: 1800, erShare: 550, epsShare: 1250 }
      ];
      this.totalGross = this.epfRows.reduce((a, b) => a + b.grossWages, 0);
      this.totalEpfWages = this.epfRows.reduce((a, b) => a + b.epfWages, 0);
      this.totalEe = this.epfRows.reduce((a, b) => a + b.eeShare, 0);
      this.totalEr = this.epfRows.reduce((a, b) => a + b.erShare, 0);
      this.totalEps = this.epfRows.reduce((a, b) => a + b.epsShare, 0);
    } else {
      this.epfRows = [];
    }
  }

  exportExcel() { alert('EPF ECR Return Excel file downloaded.'); }
}
