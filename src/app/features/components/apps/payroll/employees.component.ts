import { Component, OnInit } from '@angular/core';

export interface EmployeeRow {
  id: number;
  name: string;
  gender: string;
  designation: string;
  bankMasked: string;
  monthlyCtc: number;
  dateOfJoining: string;
  isActive: boolean;
}

@Component({
  selector: 'app-employees',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Employees</h3>
        <div class="subtitle text-muted small">Employee profiles, monthly compensation, and bank details</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="toggleExited()">
          {{ showExited ? 'Show Active Only' : 'Show Exited' }}
        </button>
        <button type="button" class="btn btn-primary btn-sm">+ New Employee</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted fw-semibold">{{ filteredEmployees.length }} employee(s)</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Designation</th>
              <th>Bank Account</th>
              <th class="text-end">Monthly CTC</th>
              <th>DOJ</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emp of filteredEmployees">
              <td class="fw-bold text-dark">{{ emp.name }}</td>
              <td class="text-capitalize">{{ emp.gender }}</td>
              <td class="fw-medium text-secondary">{{ emp.designation }}</td>
              <td><code>{{ emp.bankMasked }}</code></td>
              <td class="text-end fw-semibold">₹{{ emp.monthlyCtc | number:'1.2-2' }}</td>
              <td>{{ emp.dateOfJoining }}</td>
              <td>
                <span class="badge" [ngClass]="emp.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                  {{ emp.isActive ? 'Active' : 'Exited' }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">Payslip</button>
                <button type="button" class="btn btn-sm btn-outline-danger">Del</button>
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
  employees: EmployeeRow[] = [
  {
    "id": 1,
    "name": "Karan Mehta",
    "gender": "male",
    "designation": "Sales Executive",
    "bankMasked": "HDFC •••• 1037",
    "monthlyCtc": 45000,
    "dateOfJoining": "2024-04-01",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Priya Sharma",
    "gender": "female",
    "designation": "Accountant",
    "bankMasked": "HDFC •••• 1074",
    "monthlyCtc": 50000,
    "dateOfJoining": "2024-04-15",
    "isActive": true
  },
  {
    "id": 3,
    "name": "Rohan Verma",
    "gender": "male",
    "designation": "Warehouse Supervisor",
    "bankMasked": "HDFC •••• 1111",
    "monthlyCtc": 38000,
    "dateOfJoining": "2024-06-01",
    "isActive": true
  },
  {
    "id": 4,
    "name": "Ananya Iyer",
    "gender": "female",
    "designation": "HR Executive",
    "bankMasked": "HDFC •••• 1148",
    "monthlyCtc": 42000,
    "dateOfJoining": "2024-08-01",
    "isActive": true
  },
  {
    "id": 5,
    "name": "Vikram Singh",
    "gender": "male",
    "designation": "Inventory Manager",
    "bankMasked": "HDFC •••• 1185",
    "monthlyCtc": 55000,
    "dateOfJoining": "2025-01-15",
    "isActive": true
  },
  {
    "id": 6,
    "name": "Sneha Reddy",
    "gender": "female",
    "designation": "Sales Executive",
    "bankMasked": "HDFC •••• 1222",
    "monthlyCtc": 40000,
    "dateOfJoining": "2024-09-01",
    "isActive": false
  },
  {
    "id": 7,
    "name": "Arjun Nair",
    "gender": "male",
    "designation": "Operations Executive",
    "bankMasked": "HDFC •••• 1259",
    "monthlyCtc": 41000,
    "dateOfJoining": "2025-05-01",
    "isActive": true
  },
  {
    "id": 8,
    "name": "Deepak Kulkarni",
    "gender": "male",
    "designation": "Accounts Executive",
    "bankMasked": "HDFC •••• 1296",
    "monthlyCtc": 39000,
    "dateOfJoining": "2024-07-01",
    "isActive": true
  },
  {
    "id": 9,
    "name": "Meera Nambiar",
    "gender": "female",
    "designation": "Customer Support Executive",
    "bankMasked": "HDFC •••• 1333",
    "monthlyCtc": 32000,
    "dateOfJoining": "2024-10-01",
    "isActive": true
  },
  {
    "id": 10,
    "name": "Aditya Rao",
    "gender": "male",
    "designation": "Warehouse Associate",
    "bankMasked": "HDFC •••• 1370",
    "monthlyCtc": 26000,
    "dateOfJoining": "2025-01-01",
    "isActive": true
  },
  {
    "id": 11,
    "name": "Kavya Menon",
    "gender": "female",
    "designation": "Marketing Executive",
    "bankMasked": "HDFC •••• 1407",
    "monthlyCtc": 36000,
    "dateOfJoining": "2025-04-01",
    "isActive": true
  },
  {
    "id": 12,
    "name": "Suresh Pillai",
    "gender": "male",
    "designation": "Logistics Coordinator",
    "bankMasked": "HDFC •••• 1444",
    "monthlyCtc": 34000,
    "dateOfJoining": "2025-07-01",
    "isActive": true
  },
  {
    "id": 13,
    "name": "Divya Krishnan",
    "gender": "female",
    "designation": "Sales Executive",
    "bankMasked": "HDFC •••• 1481",
    "monthlyCtc": 37000,
    "dateOfJoining": "2025-10-01",
    "isActive": true
  },
  {
    "id": 14,
    "name": "Manoj Tiwari",
    "gender": "male",
    "designation": "Store Manager",
    "bankMasked": "HDFC •••• 1518",
    "monthlyCtc": 48000,
    "dateOfJoining": "2026-01-01",
    "isActive": true
  },
  {
    "id": 15,
    "name": "Ritu Bose",
    "gender": "female",
    "designation": "HR Assistant",
    "bankMasked": "HDFC •••• 1555",
    "monthlyCtc": 30000,
    "dateOfJoining": "2026-04-01",
    "isActive": true
  }
];

  get filteredEmployees(): EmployeeRow[] {
    return this.showExited ? this.employees : this.employees.filter(e => e.isActive);
  }

  ngOnInit() {}

  toggleExited() {
    this.showExited = !this.showExited;
  }
}
