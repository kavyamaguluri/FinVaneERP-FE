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
    <div class="page-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 no-print">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">Day Book</h3>
        <div class="subtitle text-muted small">
          Matches your own Day Book template column-for-column, one row per ledger line &mdash; Created by, Approved by, Status and Date of Posting are kept alongside every line.
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2 align-items-center flex-wrap">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportPdf()">Export PDF</button>
        <div class="d-inline-flex border rounded px-2 py-1 align-items-center bg-white">
          <input type="file" id="fileImport" class="form-control-file d-none" (change)="onFileSelect($event)" />
          <label for="fileImport" class="btn btn-sm btn-light py-0 px-2 me-2 border">Browse...</label>
          <span class="small text-muted me-2" style="max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ selectedFileName || 'No file selected.' }}</span>
          <button type="button" class="btn btn-sm btn-outline-primary py-0" (click)="importVouchers()">Import</button>
        </div>
        <a routerLink="/vouchers/new" class="btn btn-primary btn-sm" style="background-color: #00796b; border-color: #00796b;">
          + New Voucher
        </a>
      </div>
    </div>

    <!-- Period Filter Bar matching Express -->
    <div class="filter-bar p-3 bg-white border rounded mb-3 shadow-sm no-print">
      <div class="row g-2 align-items-end mb-2">
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted">Granularity</label>
          <select [(ngModel)]="granularity" (change)="onGranularityChange()" class="form-select form-select-sm">
            <option value="custom">Custom</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly (FY)</option>
            <option value="half_yearly">Half-Yearly (FY)</option>
            <option value="annually">Annually (FY)</option>
          </select>
        </div>
        <div class="col-auto" *ngIf="granularity !== 'custom'">
          <label class="form-label mb-0 small d-block">&nbsp;</label>
          <button type="button" (click)="shiftPeriod(-1)" class="btn btn-sm btn-outline-secondary" title="Previous period">&lsaquo; Prev</button>
          <button type="button" (click)="shiftPeriod(1)" class="btn btn-sm btn-outline-secondary ms-1" title="Next period">Next &rsaquo;</button>
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

      <!-- Search & Date Sort Row matching Express -->
      <div class="row g-2 align-items-center mt-1">
        <div class="col-md-5">
          <input type="text" [(ngModel)]="searchQuery" (input)="applyLocalFilters()" class="form-control form-control-sm" placeholder="Search voucher no., type, narration, status, created by, approved by..." />
        </div>
        <div class="col-auto d-flex align-items-center gap-2">
          <label class="small text-muted mb-0">Sort Date:</label>
          <select [(ngModel)]="dateSort" (change)="applyFilters()" class="form-select form-select-sm" style="width: auto;">
            <option value="desc">Date: Newest first</option>
            <option value="asc">Date: Oldest first</option>
          </select>
        </div>
        <div class="col-auto ms-auto d-flex align-items-center gap-2">
          <button type="button" class="btn btn-outline-primary btn-sm" (click)="applyLocalFilters()">Apply Filter</button>
          <button *ngIf="hasActiveFilters()" type="button" class="btn btn-outline-secondary btn-sm" (click)="clearAllFilters()">Clear filters</button>
        </div>
      </div>
    </div>

    <!-- Summary & Delete All Header -->
    <div class="d-flex justify-content-between align-items-center mb-2 no-print">
      <span class="small text-muted fw-semibold">{{ filteredRows.length }} voucher entries ({{ getUniqueVoucherCount() }} unique vouchers)</span>
      <button *ngIf="filteredRows.length > 0" type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAll()">
        Delete All (this view)
      </button>
    </div>

    <!-- Table Card matching Express 21 Columns & Filter Row -->
    <div class="card border-0 shadow-sm bg-white">
      <div class="table-responsive" style="max-height: 75vh; overflow-x: auto;">
        <table class="table table-hover align-middle mb-0" style="min-width: 2200px;">
          <thead class="table-light small">
            <tr>
              <th style="min-width: 120px;">Entity GSTN</th>
              <th style="min-width: 140px;">Branch Name</th>
              <th style="min-width: 100px;">Date</th>
              <th style="min-width: 110px;">Voucher Type</th>
              <th style="min-width: 110px;">Voucher No.</th>
              <th style="min-width: 70px;">Line ID</th>
              <th style="min-width: 90px;">Ledger ID</th>
              <th style="min-width: 160px;">Ledger Name</th>
              <th style="min-width: 100px;" class="text-end">Dr Amount</th>
              <th style="min-width: 100px;" class="text-end">Cr Amount</th>
              <th style="min-width: 100px;">Type of Ledger</th>
              <th style="min-width: 90px;">Type of Tax</th>
              <th style="min-width: 90px;">Tax Type</th>
              <th style="min-width: 120px;">Bank A/c No.</th>
              <th style="min-width: 110px;">GSTIN</th>
              <th style="min-width: 160px;">Narration</th>
              <th style="min-width: 100px;">Status</th>
              <th style="min-width: 110px;">Created by</th>
              <th style="min-width: 110px;">Approved by</th>
              <th style="min-width: 130px;">Date of Posting</th>
              <th style="min-width: 90px;" class="text-end">Actions</th>
            </tr>
            <!-- Inline Column Filter Row matching Express -->
            <tr class="filter-row bg-light no-print">
              <th></th>
              <th></th>
              <th></th>
              <th>
                <select [(ngModel)]="fType" (change)="applyLocalFilters()" class="form-select form-select-sm py-0">
                  <option value="">All</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Payment">Payment</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Contra">Contra</option>
                  <option value="Journal">Journal</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Debit Note">Debit Note</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Depreciation">Depreciation</option>
                </select>
              </th>
              <th>
                <input type="text" [(ngModel)]="fNo" (input)="applyLocalFilters()" placeholder="Filter..." class="form-control form-control-sm py-0" />
              </th>
              <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
              <th>
                <input type="text" [(ngModel)]="fNarration" (input)="applyLocalFilters()" placeholder="Filter..." class="form-control form-control-sm py-0" />
              </th>
              <th>
                <select [(ngModel)]="fStatus" (change)="applyLocalFilters()" class="form-select form-select-sm py-0">
                  <option value="">All</option>
                  <option value="posted">posted</option>
                  <option value="draft">draft</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </th>
              <th>
                <input type="text" [(ngModel)]="fCreatedBy" (input)="applyLocalFilters()" placeholder="Filter..." class="form-control form-control-sm py-0" />
              </th>
              <th>
                <input type="text" [(ngModel)]="fApprovedBy" (input)="applyLocalFilters()" placeholder="Filter..." class="form-control form-control-sm py-0" />
              </th>
              <th></th>
              <th class="text-end">
                <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" (click)="applyLocalFilters()">Go</button>
              </th>
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
                <span class="badge" [ngClass]="row.status === 'posted' ? 'bg-success-subtle text-success-emphasis border' : 'bg-light text-muted border'">
                  {{ row.status }}
                </span>
              </td>
              <td class="small text-muted">{{ row.createdBy }}</td>
              <td class="small text-muted">{{ row.approvedBy }}</td>
              <td class="small text-muted font-monospace">{{ row.createdAt || '—' }}</td>
              <td class="text-end text-nowrap">
                <a [routerLink]="['/vouchers/new']" class="btn btn-sm btn-outline-secondary py-0 me-1">Edit</a>
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
    .filter-row th { background-color: #f8fafc; padding: 4px; }
    @media print {
      .no-print { display: none !important; }
      body { background: #fff !important; }
      .card { border: none !important; box-shadow: none !important; }
    }
  `]
})
export class DayBookComponent implements OnInit {
  granularity: string = 'custom';
  fromDate: string = '2024-04-01';
  toDate: string = '2026-10-25';
  searchQuery: string = '';
  dateSort: string = 'desc';

  // Inline column filters
  fType: string = '';
  fNo: string = '';
  fNarration: string = '';
  fStatus: string = '';
  fCreatedBy: string = '';
  fApprovedBy: string = '';

  selectedFileName: string = '';
  rows: DayBookLineRow[] = [];
  filteredRows: DayBookLineRow[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.rows = this.getDefaultSampleRows();
    this.filteredRows = [...this.rows];
    this.loadVouchers();
  }

  loadVouchers() {
    let url = `${environment.apiBaseUrl}/vouchers/daybook?fromDate=${this.fromDate}&toDate=${this.toDate}&dateSort=${this.dateSort}`;
    if (this.searchQuery) url += `&q=${encodeURIComponent(this.searchQuery)}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
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

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.fType || this.fNo || this.fNarration || this.fStatus || this.fCreatedBy || this.fApprovedBy || this.dateSort !== 'desc');
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.fType = '';
    this.fNo = '';
    this.fNarration = '';
    this.fStatus = '';
    this.fCreatedBy = '';
    this.fApprovedBy = '';
    this.dateSort = 'desc';
    this.applyLocalFilters();
  }

  applyLocalFilters() {
    let result = [...this.rows];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r => {
        const text = `${r.voucherNo} ${r.voucherType} ${r.ledgerName} ${r.ledgerId} ${r.narration || ''} ${r.createdBy} ${r.approvedBy}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (this.fType) {
      result = result.filter(r => (r.voucherType || '').toLowerCase() === this.fType.toLowerCase());
    }

    if (this.fNo) {
      const q = this.fNo.toLowerCase();
      result = result.filter(r => (r.voucherNo || '').toLowerCase().includes(q));
    }

    if (this.fNarration) {
      const q = this.fNarration.toLowerCase();
      result = result.filter(r => (r.narration || '').toLowerCase().includes(q));
    }

    if (this.fStatus) {
      result = result.filter(r => (r.status || '').toLowerCase() === this.fStatus.toLowerCase());
    }

    if (this.fCreatedBy) {
      const q = this.fCreatedBy.toLowerCase();
      result = result.filter(r => (r.createdBy || '').toLowerCase().includes(q));
    }

    if (this.fApprovedBy) {
      const q = this.fApprovedBy.toLowerCase();
      result = result.filter(r => (r.approvedBy || '').toLowerCase().includes(q));
    }

    if (this.dateSort === 'asc') {
      result.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      result.sort((a, b) => b.date.localeCompare(a.date));
    }

    this.filteredRows = result;
  }

  getUniqueVoucherCount(): number {
    const set = new Set(this.filteredRows.map(r => r.voucherNo));
    return set.size;
  }

  onGranularityChange() {
    const now = new Date();
    const curYear = now.getFullYear();
    if (this.granularity === 'annually') {
      this.fromDate = '2024-04-01';
      this.toDate = `${curYear}-03-31`;
    } else if (this.granularity === 'half_yearly') {
      this.fromDate = '2024-04-01';
      this.toDate = '2024-09-30';
    } else if (this.granularity === 'quarterly') {
      this.fromDate = '2024-04-01';
      this.toDate = '2024-06-30';
    } else if (this.granularity === 'monthly') {
      const m = String(now.getMonth() + 1).padStart(2, '0');
      this.fromDate = `${curYear}-${m}-01`;
      this.toDate = now.toISOString().split('T')[0];
    }
    this.loadVouchers();
  }

  shiftPeriod(direction: number): void {
    const f = new Date(this.fromDate);
    if (this.granularity === 'monthly') {
      f.setMonth(f.getMonth() + direction);
      this.fromDate = f.toISOString().split('T')[0];
    } else if (this.granularity === 'quarterly') {
      f.setMonth(f.getMonth() + (direction * 3));
      this.fromDate = f.toISOString().split('T')[0];
    } else if (this.granularity === 'annually') {
      f.setFullYear(f.getFullYear() + direction);
      this.fromDate = f.toISOString().split('T')[0];
    }
  }

  resetToday() {
    this.granularity = 'custom';
    this.fromDate = '2024-04-01';
    this.toDate = new Date().toISOString().split('T')[0];
    this.clearAllFilters();
  }

  getBadgeClass(vType: string): string {
    switch ((vType || '').toLowerCase()) {
      case 'receipt': return 'bg-success-subtle text-success-emphasis border';
      case 'payment': return 'bg-danger-subtle text-danger-emphasis border';
      case 'contra': return 'bg-secondary-subtle text-secondary-emphasis border';
      case 'journal': return 'bg-info-subtle text-info-emphasis border';
      case 'sales':
      case 'invoice': return 'bg-success-subtle text-success-emphasis border';
      case 'purchase':
      case 'purchase bill': return 'bg-warning-subtle text-warning-emphasis border';
      case 'credit note': return 'bg-warning-subtle text-warning-emphasis border';
      case 'debit note': return 'bg-warning-subtle text-warning-emphasis border';
      case 'payroll': return 'bg-info-subtle text-info-emphasis border';
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
      'Entity GSTN*', 'Branch Name*', 'Date', 'Voucher Type*', 'Voucher No.', 'Line ID',
      'Ledger ID*', 'Ledger Name', 'Dr Amount', 'Cr Amount', 'Type of Ledger',
      'Type of Tax', 'Tax Type', 'Bank Account Number', 'GSTIN', 'Narration', 'Status',
      'Created by', 'Approved by', 'Date of Posting'
    ];
    let csv = headers.join(',') + '\n';
    this.filteredRows.forEach(r => {
      csv += `"${r.entityGstn}","${r.branchName}","${r.date}","${r.voucherType}","${r.voucherNo}","${r.lineId}","${r.ledgerId}","${r.ledgerName}","${r.drAmount || ''}","${r.crAmount || ''}","${r.typeOfLedger}","${r.typeOfTax || ''}","${r.taxType || ''}","${r.bankAccountNumber || ''}","${r.gstin || ''}","${r.narration || ''}","${r.status}","${r.createdBy}","${r.approvedBy}","${r.createdAt || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `day-book-${this.fromDate}-to-${this.toDate}.csv`;
    a.click();
  }

  exportPdf() {
    window.print();
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
          this.rows = this.rows.filter(r => r.voucherNo !== row.voucherNo);
          this.applyLocalFilters();
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

  getDefaultSampleRows(): DayBookLineRow[] {
    return [
      { voucherId: 1, entityGstn: '—', branchName: 'Acme Trading Co', date: '28-08-2026', voucherType: 'Payroll', voucherNo: 'PR-202608', lineId: 1, ledgerId: '5100', ledgerName: 'Salary Expense', drAmount: 553000, crAmount: undefined, typeOfLedger: 'expense', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payroll for 8/2026', status: 'posted', createdBy: 'Neha Payroll', approvedBy: 'Admin User', createdAt: '22-10-2026 17:08' },
      { voucherId: 1, entityGstn: '—', branchName: 'Acme Trading Co', date: '28-08-2026', voucherType: 'Payroll', voucherNo: 'PR-202608', lineId: 2, ledgerId: '2300', ledgerName: 'PF Payable', drAmount: undefined, crAmount: 33180, typeOfLedger: 'liability', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payroll for 8/2026', status: 'posted', createdBy: 'Neha Payroll', approvedBy: 'Admin User', createdAt: '22-10-2026 17:08' },
      { voucherId: 1, entityGstn: '—', branchName: 'Acme Trading Co', date: '28-08-2026', voucherType: 'Payroll', voucherNo: 'PR-202608', lineId: 3, ledgerId: '2302', ledgerName: 'Salary Payable', drAmount: undefined, crAmount: 519820, typeOfLedger: 'liability', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payroll for 8/2026', status: 'posted', createdBy: 'Neha Payroll', approvedBy: 'Admin User', createdAt: '22-10-2026 17:08' },
      { voucherId: 2, entityGstn: '—', branchName: 'Acme Trading Co', date: '15-08-2026', voucherType: 'Payment', voucherNo: 'PMT-2026-0815', lineId: 1, ledgerId: '2100', ledgerName: 'Accounts Payable', drAmount: 250000, crAmount: undefined, typeOfLedger: 'liability', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payment to vendor Apex Corp', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '15-08-2026 11:30' },
      { voucherId: 2, entityGstn: '—', branchName: 'Acme Trading Co', date: '15-08-2026', voucherType: 'Payment', voucherNo: 'PMT-2026-0815', lineId: 2, ledgerId: '1020', ledgerName: 'Bank Account - HDFC', drAmount: undefined, crAmount: 250000, typeOfLedger: 'asset', typeOfTax: '', taxType: '', bankAccountNumber: '50200012345678', gstin: '', narration: 'Payment to vendor Apex Corp', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '15-08-2026 11:30' },
      { voucherId: 3, entityGstn: '—', branchName: 'Acme Trading Co', date: '10-08-2026', voucherType: 'Receipt', voucherNo: 'RCP-2026-0810', lineId: 1, ledgerId: '1020', ledgerName: 'Bank Account - HDFC', drAmount: 185000, crAmount: undefined, typeOfLedger: 'asset', typeOfTax: '', taxType: '', bankAccountNumber: '50200012345678', gstin: '', narration: 'Customer receipt - Inv INV-2026-089', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '10-08-2026 14:15' },
      { voucherId: 3, entityGstn: '—', branchName: 'Acme Trading Co', date: '10-08-2026', voucherType: 'Receipt', voucherNo: 'RCP-2026-0810', lineId: 2, ledgerId: '1200', ledgerName: 'Accounts Receivable', drAmount: undefined, crAmount: 185000, typeOfLedger: 'asset', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Customer receipt - Inv INV-2026-089', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '10-08-2026 14:15' },
      { voucherId: 4, entityGstn: '—', branchName: 'Acme Trading Co', date: '01-08-2026', voucherType: 'Journal', voucherNo: 'JRN-2026-0801', lineId: 1, ledgerId: '5200', ledgerName: 'Rent Expense', drAmount: 45000, crAmount: undefined, typeOfLedger: 'expense', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Office rent provision for August', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '01-08-2026 09:00' },
      { voucherId: 4, entityGstn: '—', branchName: 'Acme Trading Co', date: '01-08-2026', voucherType: 'Journal', voucherNo: 'JRN-2026-0801', lineId: 2, ledgerId: '2100', ledgerName: 'Accounts Payable', drAmount: undefined, crAmount: 45000, typeOfLedger: 'liability', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Office rent provision for August', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '01-08-2026 09:00' },
      { voucherId: 5, entityGstn: '—', branchName: 'Acme Trading Co', date: '28-07-2026', voucherType: 'Payroll', voucherNo: 'PR-202607', lineId: 1, ledgerId: '5100', ledgerName: 'Salary Expense', drAmount: 553000, crAmount: undefined, typeOfLedger: 'expense', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payroll for 7/2026', status: 'posted', createdBy: 'Neha Payroll', approvedBy: 'Admin User', createdAt: '28-07-2026 17:00' },
      { voucherId: 5, entityGstn: '—', branchName: 'Acme Trading Co', date: '28-07-2026', voucherType: 'Payroll', voucherNo: 'PR-202607', lineId: 2, ledgerId: '2300', ledgerName: 'PF Payable', drAmount: undefined, crAmount: 33180, typeOfLedger: 'liability', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payroll for 7/2026', status: 'posted', createdBy: 'Neha Payroll', approvedBy: 'Admin User', createdAt: '28-07-2026 17:00' },
      { voucherId: 5, entityGstn: '—', branchName: 'Acme Trading Co', date: '28-07-2026', voucherType: 'Payroll', voucherNo: 'PR-202607', lineId: 3, ledgerId: '2302', ledgerName: 'Salary Payable', drAmount: undefined, crAmount: 519820, typeOfLedger: 'liability', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Payroll for 7/2026', status: 'posted', createdBy: 'Neha Payroll', approvedBy: 'Admin User', createdAt: '28-07-2026 17:00' },
      { voucherId: 6, entityGstn: '—', branchName: 'Acme Trading Co', date: '20-07-2026', voucherType: 'Contra', voucherNo: 'CNT-2026-0720', lineId: 1, ledgerId: '1000', ledgerName: 'Cash in Hand', drAmount: 50000, crAmount: undefined, typeOfLedger: 'asset', typeOfTax: '', taxType: '', bankAccountNumber: '', gstin: '', narration: 'Cash withdrawal from HDFC for petty expenses', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '20-07-2026 12:00' },
      { voucherId: 6, entityGstn: '—', branchName: 'Acme Trading Co', date: '20-07-2026', voucherType: 'Contra', voucherNo: 'CNT-2026-0720', lineId: 2, ledgerId: '1020', ledgerName: 'Bank Account - HDFC', drAmount: undefined, crAmount: 50000, typeOfLedger: 'asset', typeOfTax: '', taxType: '', bankAccountNumber: '50200012345678', gstin: '', narration: 'Cash withdrawal from HDFC for petty expenses', status: 'posted', createdBy: 'Admin User', approvedBy: 'Admin User', createdAt: '20-07-2026 12:00' }
    ];
  }
}
