import { Component, OnInit } from '@angular/core';

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
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Employees</h3>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="toggleExited()">
          {{ showExited ? 'Show Active Only' : 'Show Exited' }}
        </button>
        <button type="button" class="btn btn-primary btn-sm">+ New Employee</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ filteredEmployees.length }} employee{{ filteredEmployees.length === 1 ? '' : 's' }}</span>
        <button *ngIf="filteredEmployees.length > 0" type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAll()">
          Delete All (this view)
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Designation</th>
              <th>Bank</th>
              <th class="text-end">Monthly CTC</th>
              <th>DOJ</th>
              <th *ngIf="showExited">DOE</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filteredEmployees" [class.table-secondary]="!e.isActive">
              <td class="fw-bold">{{ e.name }}</td>
              <td>
                <span *ngIf="e.gender === 'male'" class="text-primary me-1">&#9794;</span>
                <span *ngIf="e.gender === 'female'" class="text-danger me-1">&#9792;</span>
                <span class="text-capitalize">{{ e.gender || '—' }}</span>
              </td>
              <td>{{ e.designation || '—' }}</td>
              <td>{{ e.bankMasked }}</td>
              <td class="text-end">{{ e.monthlyCtc | number:'1.2-2' }}</td>
              <td>{{ e.dateOfJoining || '—' }}</td>
              <td *ngIf="showExited">{{ e.dateOfExit || '—' }}</td>
              <td class="text-nowrap text-end">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">Edit</button>
                <button *ngIf="e.isActive" type="button" class="btn btn-sm btn-outline-danger me-1">Mark Exited</button>
                <span *ngIf="!e.isActive" class="badge bg-secondary-subtle text-secondary-emphasis me-1">Exited</span>
                <button type="button" class="btn btn-sm btn-outline-danger">Delete</button>
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
  `
})
export class EmployeesComponent implements OnInit {
  showExited = false;
  activeTenantId: string = '1';
  employees: EmployeeRow[] = [];

  private acmeEmployees: EmployeeRow[] = [
    { id: 1, name: "Karan Mehta", gender: "male", designation: "Sales Executive", bankMasked: "HDFC •••• 1037", monthlyCtc: 45000, dateOfJoining: "01-04-2024", isActive: true },
    { id: 2, name: "Priya Sharma", gender: "female", designation: "Accountant", bankMasked: "HDFC •••• 1074", monthlyCtc: 50000, dateOfJoining: "15-04-2024", isActive: true },
    { id: 3, name: "Rohan Verma", gender: "male", designation: "Warehouse Supervisor", bankMasked: "HDFC •••• 1111", monthlyCtc: 38000, dateOfJoining: "01-06-2024", isActive: true },
    { id: 4, name: "Ananya Iyer", gender: "female", designation: "HR Executive", bankMasked: "HDFC •••• 1148", monthlyCtc: 42000, dateOfJoining: "01-08-2024", isActive: true },
    { id: 5, name: "Vikram Singh", gender: "male", designation: "Inventory Manager", bankMasked: "HDFC •••• 1185", monthlyCtc: 55000, dateOfJoining: "15-01-2025", isActive: true },
    { id: 6, name: "Sneha Reddy", gender: "female", designation: "Sales Executive", bankMasked: "HDFC •••• 1222", monthlyCtc: 40000, dateOfJoining: "01-09-2024", dateOfExit: "31-03-2025", isActive: false },
    { id: 7, name: "Arjun Nair", gender: "male", designation: "Operations Executive", bankMasked: "HDFC •••• 1259", monthlyCtc: 41000, dateOfJoining: "01-05-2025", isActive: true },
    { id: 8, name: "Deepak Kulkarni", gender: "male", designation: "Accounts Executive", bankMasked: "HDFC •••• 1296", monthlyCtc: 39000, dateOfJoining: "01-07-2024", isActive: true },
    { id: 9, name: "Meera Nambiar", gender: "female", designation: "Customer Support Executive", bankMasked: "HDFC •••• 1333", monthlyCtc: 32000, dateOfJoining: "01-10-2024", isActive: true },
    { id: 10, name: "Aditya Rao", gender: "male", designation: "Warehouse Associate", bankMasked: "HDFC •••• 1370", monthlyCtc: 26000, dateOfJoining: "01-01-2025", isActive: true },
    { id: 11, name: "Kavya Menon", gender: "female", designation: "Marketing Executive", bankMasked: "HDFC •••• 1407", monthlyCtc: 36000, dateOfJoining: "01-04-2025", isActive: true },
    { id: 12, name: "Suresh Pillai", gender: "male", designation: "Logistics Coordinator", bankMasked: "HDFC •••• 1444", monthlyCtc: 34000, dateOfJoining: "01-07-2025", isActive: true },
    { id: 13, name: "Divya Krishnan", gender: "female", designation: "Sales Executive", bankMasked: "HDFC •••• 1481", monthlyCtc: 37000, dateOfJoining: "01-10-2025", isActive: true },
    { id: 14, name: "Manoj Tiwari", gender: "male", designation: "Store Manager", bankMasked: "HDFC •••• 1518", monthlyCtc: 48000, dateOfJoining: "01-01-2026", isActive: true },
    { id: 15, name: "Ritu Bose", gender: "female", designation: "HR Assistant", bankMasked: "HDFC •••• 1555", monthlyCtc: 30000, dateOfJoining: "01-04-2026", isActive: true }
  ];

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '2') {
      this.employees = [];
    } else {
      this.employees = [...this.acmeEmployees];
    }
  }

  get filteredEmployees(): EmployeeRow[] {
    return this.showExited ? this.employees : this.employees.filter(e => e.isActive);
  }

  toggleExited() {
    this.showExited = !this.showExited;
  }

  deleteAll() {
    if (confirm(`Delete ALL ${this.filteredEmployees.length} employees shown here?`)) {
      this.employees = [];
    }
  }
}
