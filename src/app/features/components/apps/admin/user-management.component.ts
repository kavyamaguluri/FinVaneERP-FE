import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT_ADMIN' | 'CLIENT_USER' | string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
  template: `
    <!-- Page Header matching Express admin/users view -->
    <div class="page-header">
      <div>
        <h3 class="mb-0">Users</h3>
        <div class="subtitle">
          Manage system users, authorize permissions, and grant roles (ADMIN, CLIENT_ADMIN, CLIENT_USER).
        </div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="loadUsers()">
          <i class="bi bi-arrow-clockwise me-1"></i>Refresh Users
        </button>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div *ngIf="message" class="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
      <i class="bi bi-check-circle-fill fs-5"></i>
      <span>{{ message }}</span>
    </div>

    <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Table Card -->
    <div class="card p-3">
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 25%">User Details</th>
              <th style="width: 25%">Email Address</th>
              <th style="width: 15%">Current Role</th>
              <th style="width: 20%">Assign Role</th>
              <th style="width: 10%" class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td class="font-monospace small text-muted">{{ u.id }}</td>
              <td>
                <div class="fw-semibold text-dark">{{ u.fullName }}</div>
                <div class="text-muted small font-monospace">&#64;{{ u.username }}</div>
              </td>
              <td>
                <span class="small font-monospace">{{ u.email }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="getBadgeClass(u.role)">
                  {{ u.role }}
                </span>
              </td>
              <td>
                <select class="form-select form-select-sm fw-semibold"
                        [value]="u.role"
                        (change)="changeRole(u, $event)">
                  <option value="ADMIN">ADMIN (System Owner)</option>
                  <option value="CLIENT_ADMIN">CLIENT_ADMIN (Company Admin)</option>
                  <option value="CLIENT_USER">CLIENT_USER (Operator / Staff)</option>
                </select>
              </td>
              <td class="text-center">
                <button type="button"
                        class="btn btn-sm"
                        [ngClass]="u.isActive ? 'btn-outline-success' : 'btn-outline-secondary'"
                        (click)="toggleStatus(u)">
                  <i [class]="u.isActive ? 'bi bi-check me-1' : 'bi bi-slash-circle me-1'"></i>
                  {{ u.isActive ? 'Active' : 'Disabled' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="6" class="text-center p-4 text-muted">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: UserSummary[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadUsers();
  }

  getBadgeClass(role: string): string {
    if (role === 'ADMIN') return 'badge-status-rejected';
    if (role === 'CLIENT_ADMIN') return 'bg-brand-soft text-brand';
    return 'badge-status-draft';
  }

  loadUsers() {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.http.get<any>(`${environment.apiUrl}/users`).subscribe({
      next: (res) => {
        this.users = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Error loading users';
      }
    });
  }

  changeRole(user: UserSummary, event: any) {
    const newRole = event.target.value;
    if (newRole === user.role) return;

    if (!confirm(`Are you sure you want to change ${user.fullName}'s role from ${user.role} to ${newRole}?`)) {
      event.target.value = user.role;
      return;
    }

    this.loading = true;
    this.http.put<any>(`${environment.apiUrl}/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => {
        this.loading = false;
        this.message = `Successfully updated role for ${user.fullName} to ${newRole}`;
        user.role = newRole;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to update user role';
        event.target.value = user.role;
      }
    });
  }

  toggleStatus(user: UserSummary) {
    this.loading = true;
    this.http.put<any>(`${environment.apiUrl}/users/${user.id}/status`, {}).subscribe({
      next: () => {
        this.loading = false;
        user.isActive = !user.isActive;
        this.message = `User ${user.fullName} is now ${user.isActive ? 'Active' : 'Disabled'}`;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to update user status';
      }
    });
  }
}
