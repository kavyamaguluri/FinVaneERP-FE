import { Component, OnInit } from '@angular/core';

export interface EmployeePayrollSummary {
  name: string;
  designation: string;
  gender: string;
  monthsPaid: number;
  totalGross: number;
  totalPf: number;
  totalTds: number;
  totalNet: number;
}

@Component({
  selector: 'app-payroll-report',
  template: `
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Payroll Report</h3>
        <div class="subtitle text-muted small">Consolidated payroll cost across every posted run, with a monthly trend and a per-employee summary</div>
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

    <!-- 4 KPI Cards matching Express views/payroll/report.ejs -->
    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Peak Headcount</div>
          <div class="fs-4 fw-bold text-dark">{{ grandTotal.headcount }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Total Gross Paid</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ grandTotal.totalGross | number:'1.0-0' }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Total PF + TDS Withheld</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ (grandTotal.totalPf + grandTotal.totalTds) | number:'1.0-0' }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">Total Net Paid</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ grandTotal.totalNet | number:'1.0-0' }}</div>
        </div>
      </div>
    </div>

    <!-- Monthly Chart if active -->
    <div class="card p-3 shadow-sm border-0 bg-white mb-3" *ngIf="byEmployee.length > 0">
      <h6 class="fw-bold mb-3">Monthly Payroll Cost</h6>
      <div class="chart-box" style="height: 250px;">
        <p-chart type="bar" [data]="monthlyChartData" [options]="monthlyChartOptions" height="240px"></p-chart>
      </div>
    </div>

    <!-- Summary by Employee Table matching Express views/payroll/report.ejs -->
    <div class="card p-3 shadow-sm border-0 bg-white">
      <h6 class="fw-bold mb-3">Summary by Employee</h6>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th class="text-end">Months Paid</th>
              <th class="text-end">Total Gross</th>
              <th class="text-end">Total PF</th>
              <th class="text-end">Total TDS</th>
              <th class="text-end">Total Net</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emp of byEmployee">
              <td class="fw-bold">
                <span *ngIf="emp.gender === 'male'" class="text-primary me-1">&#9794;</span>
                <span *ngIf="emp.gender === 'female'" class="text-danger me-1">&#9792;</span>
                {{ emp.name }}
              </td>
              <td>{{ emp.designation }}</td>
              <td class="text-end">{{ emp.monthsPaid }}</td>
              <td class="text-end">&#8377;{{ emp.totalGross | number:'1.2-2' }}</td>
              <td class="text-end">&#8377;{{ emp.totalPf | number:'1.2-2' }}</td>
              <td class="text-end">&#8377;{{ emp.totalTds | number:'1.2-2' }}</td>
              <td class="text-end fw-semibold">&#8377;{{ emp.totalNet | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="byEmployee.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No posted payroll runs in this period.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PayrollReportComponent implements OnInit {
  granularity = 'custom';
  fromDate = '2026-09-07';
  toDate = '2026-10-24';
  activeTenantId = '1';

  grandTotal = {
    headcount: 0,
    totalGross: 0,
    totalPf: 0,
    totalTds: 0,
    totalNet: 0
  };

  byEmployee: EmployeePayrollSummary[] = [];

  monthlyChartData: any;
  monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' } }
    }
  };

  private acmeEmployeeSummaries: EmployeePayrollSummary[] = [
    { name: "Vikram Singh", designation: "Inventory Manager", gender: "male", monthsPaid: 20, totalGross: 1100000, totalPf: 132000, totalTds: 0, totalNet: 968000 },
    { name: "Priya Sharma", designation: "Accountant", gender: "female", monthsPaid: 29, totalGross: 1450000, totalPf: 174000, totalTds: 0, totalNet: 1276000 },
    { name: "Manoj Tiwari", designation: "Store Manager", gender: "male", monthsPaid: 8, totalGross: 384000, totalPf: 46080, totalTds: 0, totalNet: 337920 },
    { name: "Karan Mehta", designation: "Sales Executive", gender: "male", monthsPaid: 29, totalGross: 1305000, totalPf: 156600, totalTds: 0, totalNet: 1148400 },
    { name: "Ananya Iyer", designation: "HR Executive", gender: "female", monthsPaid: 25, totalGross: 1050000, totalPf: 126000, totalTds: 0, totalNet: 924000 },
    { name: "Arjun Nair", designation: "Operations Executive", gender: "male", monthsPaid: 16, totalGross: 656000, totalPf: 78720, totalTds: 0, totalNet: 577280 },
    { name: "Deepak Kulkarni", designation: "Accounts Executive", gender: "male", monthsPaid: 26, totalGross: 1014000, totalPf: 121680, totalTds: 0, totalNet: 892320 },
    { name: "Rohan Verma", designation: "Warehouse Supervisor", gender: "male", monthsPaid: 27, totalGross: 1026000, totalPf: 123120, totalTds: 0, totalNet: 902880 },
    { name: "Divya Krishnan", designation: "Sales Executive", gender: "female", monthsPaid: 11, totalGross: 407000, totalPf: 48840, totalTds: 0, totalNet: 358160 },
    { name: "Kavya Menon", designation: "Marketing Executive", gender: "female", monthsPaid: 17, totalGross: 612000, totalPf: 73440, totalTds: 0, totalNet: 538560 },
    { name: "Suresh Pillai", designation: "Logistics Coordinator", gender: "male", monthsPaid: 14, totalGross: 476000, totalPf: 57120, totalTds: 0, totalNet: 418880 },
    { name: "Meera Nambiar", designation: "Customer Support Executive", gender: "female", monthsPaid: 23, totalGross: 736000, totalPf: 88320, totalTds: 0, totalNet: 647680 },
    { name: "Ritu Bose", designation: "HR Assistant", gender: "female", monthsPaid: 5, totalGross: 150000, totalPf: 18000, totalTds: 0, totalNet: 132000 },
    { name: "Aditya Rao", designation: "Warehouse Associate", gender: "male", monthsPaid: 20, totalGross: 520000, totalPf: 62400, totalTds: 0, totalNet: 457600 }
  ];

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '2') {
      this.fromDate = '2026-09-07';
      this.toDate = '2026-10-24';
    } else {
      this.fromDate = '2026-04-01';
      this.toDate = '2026-10-22';
    }
    this.loadReport();
  }

  onGranularityChange() {
    this.loadReport();
  }

  applyFilter() {
    this.loadReport();
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
    this.loadReport();
  }

  loadReport() {
    if (this.activeTenantId === '2') {
      this.grandTotal = { headcount: 0, totalGross: 0, totalPf: 0, totalTds: 0, totalNet: 0 };
      this.byEmployee = [];
    } else {
      this.byEmployee = [...this.acmeEmployeeSummaries];
      const tg = this.byEmployee.reduce((acc, e) => acc + e.totalGross, 0);
      const tp = this.byEmployee.reduce((acc, e) => acc + e.totalPf, 0);
      const tt = this.byEmployee.reduce((acc, e) => acc + e.totalTds, 0);
      const tn = this.byEmployee.reduce((acc, e) => acc + e.totalNet, 0);
      this.grandTotal = {
        headcount: 15,
        totalGross: tg,
        totalPf: tp,
        totalTds: tt,
        totalNet: tn
      };

      this.monthlyChartData = {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Monthly Gross Paid (₹)',
            data: [553000, 553000, 553000, 553000, 553000],
            backgroundColor: '#0d9488',
            borderRadius: 4
          }
        ]
      };
    }
  }
}
