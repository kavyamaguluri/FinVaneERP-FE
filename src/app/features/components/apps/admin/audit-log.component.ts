import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface AuditLogItem {
  id: number;
  entityName?: string;
  userEmail?: string;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  createdAt: string;
}

@Component({
  selector: 'app-audit-log',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Audit Log</h3>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportLogs()">
          Export
        </button>
      </div>
    </div>

    <!-- Table Card matching Screenshot 5 exactly -->
    <div class="card p-3">
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="min-width: 140px;">TIME</th>
              <th style="min-width: 160px;">BUSINESS</th>
              <th style="min-width: 200px;">USER</th>
              <th style="min-width: 120px;">ACTION</th>
              <th style="min-width: 120px;">RECORD TYPE</th>
              <th style="min-width: 100px;">RECORD ID</th>
              <th style="min-width: 130px;">IP</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of logs">
              <td class="font-monospace small">{{ formatDateTime(l.createdAt) }}</td>
              <td class="fw-semibold">{{ l.entityName || '—' }}</td>
              <td class="font-monospace small text-muted">{{ l.userEmail || '—' }}</td>
              <td>
                <span class="badge bg-light text-dark border">{{ l.action }}</span>
              </td>
              <td class="small">{{ l.entity || '—' }}</td>
              <td class="font-monospace small">{{ l.entityId || '—' }}</td>
              <td class="font-monospace small text-muted">{{ l.ip || '::ffff:127.0.0.1' }}</td>
            </tr>
            <tr *ngIf="!loading && logs.length === 0">
              <td colspan="7" class="text-center p-4 text-muted">No audit log entries recorded yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  logs: AuditLogItem[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAuditLogs();
  }

  loadAuditLogs() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/audit-logs`).subscribe({
      next: (res) => {
        this.loading = false;
        this.logs = res.data || [];
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatDateTime(isoStr: string): string {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}-${mon}-${year} ${hrs}:${mins}`;
    } catch {
      return isoStr;
    }
  }

  exportLogs() {
    let csv = 'TIME,BUSINESS,USER,ACTION,RECORD TYPE,RECORD ID,IP\n';
    this.logs.forEach(l => {
      csv += `"${this.formatDateTime(l.createdAt)}","${l.entityName || ''}","${l.userEmail || ''}","${l.action}","${l.entity || ''}","${l.entityId || ''}","${l.ip || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log.csv';
    a.click();
  }
}
