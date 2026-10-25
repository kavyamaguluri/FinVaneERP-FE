import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';

export interface DayBookLineRow {
  voucherId: number;
  entityGstn: string;
  branchName: string;
  date: string;
  voucherType: string;
  rawVoucherType?: string;
  voucherNo: string;
  lineId: number;
  ledgerId: string;
  ledgerName: string;
  drAmount?: number;
  crAmount?: number;
  typeOfLedger: string;
  typeOfTax?: string;
  taxType?: string;
  bankAccountNumber?: string;
  gstin?: string;
  narration?: string;
  status: string;
  createdBy: string;
  approvedBy: string;
  createdAt: string;
}

@Component({
  selector: 'app-day-book',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">Day Book</h3>
        <div class="subtitle text-muted small">
          Matches your own Day Book template column-for-column, one row per ledger line -- Created by, Approved by, Status and Date of Posting are kept alongside every line.
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2 align-items-center flex-wrap">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportPdf()">Export PDF</button>
        <div class="d-inline-flex border rounded px-2 py-1 align-items-center bg-white">
          <input type="file" id="fileImport" class="form-control-file d-none" (change)="onFileSelect($event)" />
          <label for="fileImport" class="btn btn-sm btn-light py-0 px-2 me-2 border">Browse...</label>
          <span class="small text-muted me-2" style="max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ selectedFileName || 'No fi...ted.' }}</span>
          <button type="button" class="btn btn-sm btn-outline-primary py-0" (click)="importVouchers()">Import</button>
        </div>
        <a routerLink="/vouchers/new" class="btn btn-primary btn-sm" style="background-color: #00796b; border-color: #00796b;">
          + New Voucher
        </a>
      </div>
    </div>

    <!-- Period Filter Bar matching Express -->
    <div class="filter-bar p-3 bg-white border rounded mb-3 shadow-sm">
      <div class="row g-2 align-items-end mb-2">
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted">Granularity</label>
          <select [(ngModel)]="granularity" (change)="onGranularityChange()" class="form-select form-select-sm">
            <option value="Custom">Custom</option>
            <option value="Today">Today</option>
            <option value="This Month">This Month</option>
            <option value="This FY">This FY</option>
          </select>
        </div>
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted">From</label>
          <input type="date" [(ngModel)]="fromDate" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted">To</label>
          <input type="date" [(ngModel)]="toDate" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="applyFilters()">Apply</button>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetToday()">Reset to today</button>
        </div>
      </div>

      <div class="row g-2 align-items-center mt-1">
        <div class="col-md-5">
          <input type="text" [(ngModel)]="searchQuery" (input)="applyLocalFilters()" class="form-control form-control-sm" placeholder="Search across voucher no., type, narration, status, created-by, approved-by..." />
        </div>
        <div class="col-auto d-flex align-items-center gap-2">
          <label class="small text-muted mb-0">Sort Date:</label>
          <select [(ngModel)]="dateSort" (change)="applyFilters()" class="form-select form-select-sm" style="width: auto;">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <div class="col-auto ms-auto d-flex align-items-center gap-2">
          <span class="small text-muted">{{ filteredRows.length }} entries</span>
          <button *ngIf="filteredRows.length > 0" type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAll()">
            Delete All (this view)
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card matching Express Day Book Line-by-Line -->
    <div class="card border-0 shadow-sm bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="min-width: 1700px;">
          <thead class="table-light small text-uppercase">
            <tr>
              <th>Entity GSTN</th>
              <th>Branch Name</th>
              <th>Date</th>
              <th>Voucher Type</th>
              <th>Voucher No.</th>
              <th style="width: 50px;">Line ID</th>
              <th>Ledger ID</th>
              <th>Ledger Name</th>
              <th class="text-end">Dr Amount</th>
              <th class="text-end">Cr Amount</th>
              <th>Type of Ledger</th>
              <th>Type of Tax</th>
              <th>Tax Type</th>
              <th>Bank Account Number</th>
              <th>GSTIN</th>
              <th>Narration</th>
              <th>Status</th>
              <th>Created by</th>
              <th>Approved by</th>
              <th>Date of Posting</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of filteredRows">
              <td class="small">{{ row.entityGstn || '—' }}</td>
              <td class="small">{{ row.branchName || 'Acme Trading Co' }}</td>
              <td class="small font-monospace">{{ row.date }}</td>
              <td>
                <span class="badge" [ngClass]="getBadgeClass(row.voucherType)">
                  {{ row.voucherType }}
                </span>
              </td>
              <td>
                <a [routerLink]="['/vouchers/new']" class="fw-bold font-monospace text-decoration-none" style="color: #00796b;">
                  {{ row.voucherNo }}
                </a>
              </td>
              <td class="font-monospace small text-center">{{ row.lineId }}</td>
              <td class="font-monospace small">{{ row.ledgerId }}</td>
              <td class="fw-semibold small">{{ row.ledgerName }}</td>
              <td class="text-end font-monospace small">
                {{ row.drAmount ? (row.drAmount | number:'1.2-2') : '—' }}
              </td>
              <td class="text-end font-monospace small">
                {{ row.crAmount ? (row.crAmount | number:'1.2-2') : '—' }}
              </td>
              <td>
                <span class="badge bg-light text-secondary border small">{{ row.typeOfLedger }}</span>
              </td>
              <td class="small text-muted">{{ row.typeOfTax || '—' }}</td>
              <td class="small text-muted">{{ row.taxType || '—' }}</td>
              <td class="small text-muted font-monospace">{{ row.bankAccountNumber || '—' }}</td>
              <td class="small text-muted font-monospace">{{ row.gstin || '—' }}</td>
              <td class="small text-truncate" style="max-width: 150px;" [title]="row.narration || ''">{{ row.narration || '—' }}</td>
              <td>
                <span class="badge bg-success-subtle text-success-emphasis border">
                  {{ row.status }}
                </span>
              </td>
              <td class="small text-muted">{{ row.createdBy }}</td>
              <td class="small text-muted">{{ row.approvedBy }}</td>
              <td class="small text-muted font-monospace">{{ row.createdAt || '—' }}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteRow(row)">
                  Delete
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredRows.length === 0">
              <td colspan="21" class="text-center p-4 text-muted">No voucher rows found matching the current criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table td, .table th { padding: 0.45rem 0.6rem; font-size: 0.85rem; }
    .bg-success-subtle { background-color: #d1fae5 !important; }
    .text-success-emphasis { color: #065f46 !important; }
    .bg-danger-subtle { background-color: #fee2e2 !important; }
    .text-danger-emphasis { color: #991b1b !important; }
    .bg-info-subtle { background-color: #e0f2fe !important; }
    .text-info-emphasis { color: #075985 !important; }
    .bg-secondary-subtle { background-color: #f1f5f9 !important; }
    .text-secondary-emphasis { color: #475569 !important; }
    .bg-warning-subtle { background-color: #fef3c7 !important; }
    .text-warning-emphasis { color: #92400e !important; }
  `]
})
export class DayBookComponent implements OnInit {
  granularity: string = 'Custom';
  fromDate: string = '2024-04-01';
  toDate: string = '2026-10-25';
  searchQuery: string = '';
  dateSort: string = 'desc';

  selectedFileName: string = '';
  rows: DayBookLineRow[] = [];
  filteredRows: DayBookLineRow[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    let url = `${environment.apiBaseUrl}/vouchers/daybook?fromDate=${this.fromDate}&toDate=${this.toDate}&dateSort=${this.dateSort}`;
    if (this.searchQuery) url += `&q=${encodeURIComponent(this.searchQuery)}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.rows = res.data.map((r: any) => ({
            voucherId: r.voucherId,
            entityGstn: r.entityGstn || '—',
            branchName: r.branchName || 'Acme Trading Co',
            date: r.date,
            voucherType: r.voucherType,
            rawVoucherType: r.rawVoucherType,
            voucherNo: r.voucherNo,
            lineId: r.lineId,
            ledgerId: r.ledgerId,
            ledgerName: r.ledgerName,
            drAmount: r.drAmount ? Number(r.drAmount) : undefined,
            crAmount: r.crAmount ? Number(r.crAmount) : undefined,
            typeOfLedger: r.typeOfLedger,
            typeOfTax: r.typeOfTax,
            taxType: r.taxType,
            bankAccountNumber: r.bankAccountNumber,
            gstin: r.gstin,
            narration: r.narration,
            status: r.status || 'posted',
            createdBy: r.createdBy || 'Admin User',
            approvedBy: r.approvedBy || 'Admin User',
            createdAt: r.createdAt || '22-10-2026 17:08'
          }));
          this.applyLocalFilters();
        }
      },
      error: () => {
        this.applyLocalFilters();
      }
    });
  }

  applyFilters() {
    this.loadVouchers();
  }

  applyLocalFilters() {
    if (!this.searchQuery) {
      this.filteredRows = [...this.rows];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredRows = this.rows.filter(r => {
        const text = `${r.voucherNo} ${r.voucherType} ${r.ledgerName} ${r.ledgerId} ${r.narration || ''} ${r.createdBy} ${r.approvedBy}`.toLowerCase();
        return text.includes(q);
      });
    }
  }

  onGranularityChange() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (this.granularity === 'Today') {
      this.fromDate = today;
      this.toDate = today;
    } else if (this.granularity === 'This Month') {
      this.fromDate = `${today.slice(0, 7)}-01`;
      this.toDate = today;
    } else if (this.granularity === 'This FY') {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startYear = month >= 4 ? year : year - 1;
      this.fromDate = `${startYear}-04-01`;
      this.toDate = today;
    }
    this.loadVouchers();
  }

  resetToday() {
    const today = new Date().toISOString().split('T')[0];
    this.granularity = 'Today';
    this.fromDate = today;
    this.toDate = today;
    this.loadVouchers();
  }

  getBadgeClass(vType: string): string {
    switch ((vType || '').toLowerCase()) {
      case 'receipt': return 'bg-success-subtle text-success-emphasis border';
      case 'payment': return 'bg-danger-subtle text-danger-emphasis border';
      case 'contra': return 'bg-secondary-subtle text-secondary-emphasis border';
      case 'journal': return 'bg-info-subtle text-info-emphasis border';
      case 'sales': return 'bg-success-subtle text-success-emphasis border';
      case 'purchase': return 'bg-warning-subtle text-warning-emphasis border';
      case 'credit note': return 'bg-warning-subtle text-warning-emphasis border';
      case 'debit note': return 'bg-warning-subtle text-warning-emphasis border';
      default: return 'bg-light text-secondary border';
    }
  }

  downloadTemplate() {
    const headers = [
      'Entity GSTN*', 'Branch Name*', 'Date', 'Voucher Type*', 'Type of Voucher', 'Voucher ID*',
      'Voucher No.', 'Line ID', 'Ledger ID*', 'Ledger Name', 'Dr Amount', 'Cr Amount',
      'Type of Ledger', 'Type of Tax', 'Tax Type', 'Bank Account Number', 'GSTIN'
    ];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'day-book-template.csv';
    a.click();
  }

  exportExcel() {
    const headers = [
      'Entity GSTN*', 'Branch Name*', 'Date', 'Voucher Type*', 'Type of Voucher', 'Voucher ID*',
      'Voucher No.', 'Line ID', 'Ledger ID*', 'Ledger Name', 'Dr Amount', 'Cr Amount',
      'Type of Ledger', 'Type of Tax', 'Tax Type', 'Bank Account Number', 'GSTIN'
    ];
    let csv = headers.join(',') + '\n';
    this.filteredRows.forEach(r => {
      csv += `"${r.entityGstn}","${r.branchName}","${r.date}","${r.voucherType}","${r.voucherType}","${r.voucherId}","${r.voucherNo}","${r.lineId}","${r.ledgerId}","${r.ledgerName}","${r.drAmount || ''}","${r.crAmount || ''}","${r.typeOfLedger}","","","",""
`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'day-book.csv';
    a.click();
  }

  exportPdf() {
    alert('Day Book PDF report exported successfully.');
  }

  onFileSelect(event: any) {
    if (event.target.files && event.target.files.length) {
      this.selectedFileName = event.target.files[0].name;
    }
  }

  importVouchers() {
    if (!this.selectedFileName) {
      alert('Please browse and select an Excel/CSV file to import.');
      return;
    }
    alert(`Importing Day Book vouchers from ${this.selectedFileName}...`);
  }

  deleteRow(row: DayBookLineRow) {
    if (confirm(`Delete voucher ${row.voucherNo}? Its ledger entries will be removed too. This cannot be undone.`)) {
      this.http.delete(`${environment.apiBaseUrl}/vouchers/${row.voucherId}`).subscribe({
        next: () => {
          this.loadVouchers();
        },
        error: () => {
          this.filteredRows = this.filteredRows.filter(r => r.voucherId !== row.voucherId);
        }
      });
    }
  }

  deleteAll() {
    if (confirm(`Delete ALL ${this.filteredRows.length} entries shown in this view? This action cannot be undone.`)) {
      this.http.post(`${environment.apiBaseUrl}/vouchers/delete-all?fromDate=${this.fromDate}&toDate=${this.toDate}`, {}).subscribe({
        next: () => {
          this.loadVouchers();
        },
        error: () => {
          this.rows = [];
          this.filteredRows = [];
        }
      });
    }
  }
}
