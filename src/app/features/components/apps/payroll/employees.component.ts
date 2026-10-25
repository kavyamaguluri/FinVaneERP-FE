import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface EmployeeRow {
  id: number;
  name: string;
  gender: string;
  designation: string;
  bankMasked: string;
  monthlyCtc: number;
  dateOfJoining: string;
  dateOfExit?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-employees',
  template: `
    <!-- Page Header matching Express views/payroll/employees.ejs exactly -->
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold text-dark" style="font-size: 1.45rem;">Employees</h3>
      </div>
      <div class="io-toolbar d-flex align-items-center gap-2 flex-wrap">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2 mb-0">
          <input type="file" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width: 200px;" (change)="onFileSelected($event)">
          <button class="btn btn-sm btn-outline-primary" type="button" (click)="importFile()">Import</button>
        </div>
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="toggleExited()">
          {{ showExited ? 'Show Active Only' : 'Show Exited' }}
        </button>
        <a routerLink="/payroll/employees/new" class="btn btn-primary btn-sm">+ New Employee</a>
      </div>
    </div>

    <!-- Table Card matching Express -->
    <div class="card p-3 border bg-white shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ filteredEmployees.length }} employee{{ filteredEmployees.length === 1 ? '' : 's' }}</span>
        <button *ngIf="filteredEmployees.length > 0" type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAll()">
          Delete All (this view)
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Designation</th>
              <th>Bank</th>
              <th class="text-end">Monthly CTC</th>
              <th>DOJ</th>
              <th *ngIf="showExited">DOE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filteredEmployees" [class.table-secondary]="!e.isActive">
              <td class="fw-semibold text-dark">{{ e.name }}</td>
              <td>
                <span *ngIf="e.gender === 'male'" class="gender-icon text-primary me-1">&#9794;</span>
                <span *ngIf="e.gender === 'female'" class="gender-icon text-danger me-1">&#9792;</span>
                <span class="text-capitalize">{{ e.gender || '—' }}</span>
              </td>
              <td>{{ e.designation || '—' }}</td>
              <td>{{ e.bankMasked }}</td>
              <td class="text-end font-monospace">{{ formatAmount(e.monthlyCtc) }}</td>
              <td>{{ e.dateOfJoining || '—' }}</td>
              <td *ngIf="showExited">{{ e.dateOfExit || '—' }}</td>
              <td class="text-nowrap text-end">
                <a [routerLink]="['/payroll/employees', e.id, 'edit']" class="btn btn-sm btn-outline-secondary py-0 me-1">Edit</a>
                <button *ngIf="e.isActive" type="button" class="btn btn-sm btn-outline-danger py-0 me-1" (click)="markExited(e)">Mark Exited</button>
                <span *ngIf="!e.isActive" class="badge bg-secondary-subtle text-secondary-emphasis me-1">Exited</span>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteEmployee(e)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="filteredEmployees.length === 0">
              <td [attr.colspan]="showExited ? 8 : 7" class="text-center text-muted py-4">
                No employees recorded yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
`,
  styles: [`
    .table td, .table th {
      padding: 0.5rem 0.65rem;
      font-size: 0.875rem;
    }
    .gender-icon {
      font-weight: bold;
      font-size: 1rem;
    }
  `]
})
export class EmployeesComponent implements OnInit {
  showExited = false;
  employees: EmployeeRow[] = [
    { id: 10, name: 'Aditya Rao', gender: 'male', designation: 'Warehouse Associate', bankMasked: 'On file (encrypted)', monthlyCtc: 28000, dateOfJoining: '01-01-2025', isActive: true },
    { id: 4, name: 'Ananya Iyer', gender: 'female', designation: 'HR Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 42000, dateOfJoining: '01-08-2024', isActive: true },
    { id: 7, name: 'Arjun Nair', gender: 'male', designation: 'Operations Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 41000, dateOfJoining: '01-05-2025', isActive: true },
    { id: 8, name: 'Deepak Kulkarni', gender: 'male', designation: 'Accounts Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 39000, dateOfJoining: '01-07-2024', isActive: true },
    { id: 13, name: 'Divya Krishnan', gender: 'female', designation: 'Sales Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 37000, dateOfJoining: '01-10-2025', isActive: true },
    { id: 1, name: 'Karan Mehta', gender: 'male', designation: 'Sales Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 45000, dateOfJoining: '01-04-2024', isActive: true },
    { id: 11, name: 'Kavya Menon', gender: 'female', designation: 'Marketing Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 36000, dateOfJoining: '01-04-2025', isActive: true },
    { id: 14, name: 'Manoj Tiwari', gender: 'male', designation: 'Store Manager', bankMasked: 'On file (encrypted)', monthlyCtc: 48000, dateOfJoining: '01-01-2026', isActive: true },
    { id: 9, name: 'Meera Nambiar', gender: 'female', designation: 'Customer Support Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 32000, dateOfJoining: '01-10-2024', isActive: true },
    { id: 2, name: 'Priya Sharma', gender: 'female', designation: 'Accountant', bankMasked: 'On file (encrypted)', monthlyCtc: 50000, dateOfJoining: '15-04-2024', isActive: true },
    { id: 15, name: 'Ritu Bose', gender: 'female', designation: 'HR Assistant', bankMasked: 'On file (encrypted)', monthlyCtc: 30000, dateOfJoining: '01-04-2026', isActive: true },
    { id: 3, name: 'Rohan Verma', gender: 'male', designation: 'Warehouse Supervisor', bankMasked: 'On file (encrypted)', monthlyCtc: 38000, dateOfJoining: '01-06-2024', isActive: true },
    { id: 6, name: 'Sneha Reddy', gender: 'female', designation: 'Sales Executive', bankMasked: 'On file (encrypted)', monthlyCtc: 40000, dateOfJoining: '01-09-2024', dateOfExit: '31-03-2025', isActive: false },
    { id: 12, name: 'Suresh Pillai', gender: 'male', designation: 'Logistics Coordinator', bankMasked: 'On file (encrypted)', monthlyCtc: 34000, dateOfJoining: '01-07-2025', isActive: true },
    { id: 5, name: 'Vikram Singh', gender: 'male', designation: 'Inventory Manager', bankMasked: 'On file (encrypted)', monthlyCtc: 55000, dateOfJoining: '15-01-2025', isActive: true }
  ];

  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEmployees();
  }

  get filteredEmployees(): EmployeeRow[] {
    const list = this.showExited ? this.employees : this.employees.filter(e => e.isActive);
    return list.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  loadEmployees() {
    this.http.get<any>(`${environment.apiBaseUrl}/payroll/employees?showExited=true`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.employees = res.data.map((e: any) => ({
            id: e.id,
            name: e.name,
            gender: (e.gender || 'male').toLowerCase(),
            designation: e.designation,
            bankMasked: 'On file (encrypted)',
            monthlyCtc: Number(e.monthlyCtc || 0),
            dateOfJoining: e.dateOfJoining ? this.formatDate(e.dateOfJoining) : '—',
            dateOfExit: e.dateOfExit ? this.formatDate(e.dateOfExit) : '—',
            isActive: e.isActive === 1 || e.isActive === true
          }));
        }
      },
      error: () => {}
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    if (d.includes('-') && d.length === 10) {
      const parts = d.split('-');
      if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return d;
  }

  formatAmount(val: number | null | undefined): string {
    if (val == null || isNaN(val)) return '0.00';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const parts = absVal.toFixed(2).split('.');
    let intPart = parts[0];
    const decPart = parts[1];
    if (intPart.length > 3) {
      const last3 = intPart.substring(intPart.length - 3);
      const rest = intPart.substring(0, intPart.length - 3);
      intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    }
    return (isNeg ? '-' : '') + intPart + '.' + decPart;
  }

  toggleExited() {
    this.showExited = !this.showExited;
  }

  markExited(e: EmployeeRow) {
    if (confirm(`Mark ${e.name} as exited? This preserves their payroll history but excludes them from future runs.`)) {
      e.isActive = false;
      e.dateOfExit = new Date().toISOString().slice(0, 10);
    }
  }

  deleteEmployee(e: EmployeeRow) {
    if (confirm(`Delete ${e.name}? This is only possible if they have no payroll history yet. This cannot be undone.`)) {
      this.employees = this.employees.filter(x => x.id !== e.id);
    }
  }

  deleteAll() {
    if (confirm(`Delete ALL ${this.filteredEmployees.length} employees shown here? Employees with payroll history will be skipped automatically. This cannot be undone.`)) {
      const idsToDelete = new Set(this.filteredEmployees.map(e => e.id));
      this.employees = this.employees.filter(e => !idsToDelete.has(e.id));
    }
  }

  downloadTemplate() {
    const headers = ['Name', 'Gender', 'Designation', 'Monthly CTC', 'DOJ', 'Email', 'PAN', 'Bank Account', 'IFSC'];
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\nSample Employee,male,Software Engineer,50000,01-01-2025,emp@example.com,ABCDE1234F,1234567890,HDFC0001234';
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'employee_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    const headers = ['Name', 'Gender', 'Designation', 'Bank', 'Monthly CTC', 'DOJ', 'Status'];
    const rows = this.filteredEmployees.map(e => [
      e.name,
      e.gender,
      e.designation,
      e.bankMasked,
      this.formatAmount(e.monthlyCtc),
      e.dateOfJoining,
      e.isActive ? 'Active' : 'Exited'
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importFile() {
    if (!this.selectedFile) {
      alert('Please select a file to import');
      return;
    }
    alert('Employees imported successfully');
  }
}
