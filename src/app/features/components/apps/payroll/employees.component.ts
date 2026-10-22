import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface EmployeeRow {
  id: number;
  name: string;
  gender: 'male' | 'female' | 'other';
  designation: string;
  bankMasked: string;
  monthlyCtc: number;
  dateOfJoining: string;
  isActive: boolean;
}

@Component({
  selector: 'app-employees',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Employees</h3>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="toggleExited()">
          {{ showExited ? 'Show Active Only' : 'Show Exited' }}
        </button>
        <button type="button" class="btn btn-primary btn-sm" (click)="openAddModal()">+ New Employee</button>
      </div>
    </div>

    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ employees.length }} employees</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr class="text-uppercase small fw-bold">
              <th>Name</th>
              <th>Gender</th>
              <th>Designation</th>
              <th>Bank</th>
              <th class="text-end">Monthly CTC</th>
              <th>DOJ</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of employees" [class.table-secondary]="!e.isActive">
              <td class="fw-semibold text-dark">{{ e.name }}</td>
              <td class="small text-capitalize">{{ e.gender }}</td>
              <td class="small">{{ e.designation || '—' }}</td>
              <td class="font-monospace small">{{ e.bankMasked }}</td>
              <td class="text-end font-monospace">&#8377;{{ e.monthlyCtc | number:'1.2-2' }}</td>
              <td class="font-monospace small">{{ e.dateOfJoining }}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary py-0 me-1" (click)="editEmp(e)">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteEmp(e)">Delete</button>
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
    { id: 1, name: 'Asha Accountant', gender: 'female', designation: 'Senior Accountant', bankMasked: 'HDFC •••• 4012', monthlyCtc: 65000, dateOfJoining: '01-04-2024', isActive: true },
    { id: 2, name: 'Rohan Approver', gender: 'male', designation: 'Operations Lead', bankMasked: 'ICICI •••• 9923', monthlyCtc: 85000, dateOfJoining: '15-05-2024', isActive: true },
    { id: 3, name: 'Priya Sales', gender: 'female', designation: 'Sales Manager', bankMasked: 'SBI •••• 3145', monthlyCtc: 72000, dateOfJoining: '01-06-2024', isActive: true },
    { id: 4, name: 'Vikram Inventory', gender: 'male', designation: 'Warehouse Supervisor', bankMasked: 'Axis •••• 8821', monthlyCtc: 48000, dateOfJoining: '10-07-2024', isActive: true },
    { id: 5, name: 'Neha Payroll', gender: 'female', designation: 'HR Specialist', bankMasked: 'Kotak •••• 5519', monthlyCtc: 55000, dateOfJoining: '01-08-2024', isActive: true }
  ];

  constructor() {}
  ngOnInit() {}
  toggleExited() { this.showExited = !this.showExited; }
  openAddModal() { alert('New Employee onboarding modal'); }
  editEmp(e: EmployeeRow) { alert(`Edit employee ${e.name}`); }
  deleteEmp(e: EmployeeRow) {
    if (confirm(`Delete employee "${e.name}"?`)) {
      this.employees = this.employees.filter(x => x.id !== e.id);
    }
  }
}
