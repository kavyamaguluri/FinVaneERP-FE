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
    <div class="p-card p-4">
      <!-- Header -->
      <div class="flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div class="flex align-items-center gap-2">
            <h2 class="text-xl font-bold text-900 m-0">Administration > User Access & Role Permissions</h2>
            <span class="p-badge p-badge-danger text-xs font-semibold">Admin Only</span>
          </div>
          <span class="text-sm text-500 mt-1 block">
            Manage system users, authorize permissions, and grant roles (ADMIN, CLIENT_ADMIN, CLIENT_USER).
          </span>
        </div>
        <button pButton label="Refresh Users" icon="pi pi-refresh" class="p-button-outlined p-button-sm" (click)="loadUsers()"></button>
      </div>

      <!-- Feedback Messages -->
      <div *ngIf="message" class="bg-green-50 border-1 border-green-200 border-round p-3 mb-3 flex align-items-center gap-2 text-green-700 text-sm">
        <i class="pi pi-check-circle text-base"></i>
        <span>{{ message }}</span>
      </div>

      <div *ngIf="errorMessage" class="bg-red-50 border-1 border-red-200 border-round p-3 mb-3 flex align-items-center gap-2 text-red-700 text-sm">
        <i class="pi pi-exclamation-circle text-base"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Users Table -->
      <p-table [value]="users"
               [loading]="loading"
               responsiveLayout="scroll"
               styleClass="p-datatable-sm p-datatable-striped"
               [paginator]="true"
               [rows]="10">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 25%">User Details</th>
            <th style="width: 25%">Email Address</th>
            <th style="width: 15%">Current Role</th>
            <th style="width: 20%">Grant / Assign Role</th>
            <th style="width: 10%" class="text-center">Status</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-u>
          <tr>
            <td class="font-mono text-xs text-500">{{ u.id }}</td>
            <td>
              <div class="font-semibold text-900">{{ u.fullName }}</div>
              <div class="text-xs text-500 font-mono">&#64;{{ u.username }}</div>
            </td>
            <td>
              <span class="text-sm text-700 font-mono">{{ u.email }}</span>
            </td>
            <td>
              <span class="p-badge font-bold text-xs"
                    [ngClass]="{
                      'p-badge-danger': u.role === 'ADMIN',
                      'p-badge-info': u.role === 'CLIENT_ADMIN',
                      'p-badge-success': u.role === 'CLIENT_USER'
                    }">
                {{ u.role }}
              </span>
            </td>
            <td>
              <select class="p-2 border-1 surface-border border-round text-xs font-semibold cursor-pointer w-full"
                      [value]="u.role"
                      (change)="changeRole(u, $event)">
                <option value="ADMIN">ADMIN (System Owner)</option>
                <option value="CLIENT_ADMIN">CLIENT_ADMIN (Company Admin)</option>
                <option value="CLIENT_USER">CLIENT_USER (Operator / Staff)</option>
              </select>
            </td>
            <td class="text-center">
              <button pButton
                      [label]="u.isActive ? 'Active' : 'Disabled'"
                      [icon]="u.isActive ? 'pi pi-check' : 'pi pi-ban'"
                      class="p-button-xs"
                      [ngClass]="u.isActive ? 'p-button-outlined p-button-success' : 'p-button-outlined p-button-secondary'"
                      (click)="toggleStatus(u)">
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4 text-500">No users found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: UserSummary[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
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
      next: (res) => {
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
      next: (res) => {
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

