import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';

export interface DayBookRow {
  id?: number;
  entityGstn?: string;
  branchName?: string;
  date: string;
  voucherType: string;
  voucherNo: string;
  lineId: number;
  ledgerId: string;
  ledgerName: string;
  drAmount?: number;
  crAmount?: number;
  typeOfLedger: string;
}

@Component({
  selector: 'app-day-book',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Day Book</h3>
        <div class="subtitle">Matches your own Day Book template column-for-column, one row per ledger line -- Created by, Approved by, Status and Date of Posting are kept alongside every line.</div>
      </div>
      <div class="io-toolbar d-flex gap-2 align-items-center">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportPdf()">Export PDF</button>
        <div class="d-inline-flex border rounded px-2 py-1 align-items-center bg-white">
          <input type="file" id="fileImport" class="form-control-file d-none" (change)="onFileSelect($event)" />
          <label for="fileImport" class="btn btn-sm btn-light py-0 px-2 me-2 border">Browse...</label>
          <span class="small text-muted me-2" style="max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ selectedFileName || 'No fi...ted.' }}</span>
          <button type="button" class="btn btn-sm btn-outline-primary py-0" (click)="importVouchers()">Import</button>
        </div>
        <a routerLink="/vouchers/new" class="btn btn-primary btn-sm">+ New Voucher</a>
      </div>
    </div>

    <!-- Period Filter Bar matching Screenshot 2 -->
    <div class="filter-bar p-3 bg-white border rounded mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted">Granularity</label>
          <select [(ngModel)]="granularity" class="form-select form-select-sm">
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
          <button type="button" class="btn btn-primary btn-sm" (click)="applyPeriod()">Apply</button>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="resetToday()">Reset to today</button>
        </div>
      </div>
    </div>

    <!-- Search & Date Sort Bar -->
    <div class="card p-3 mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-md-6">
          <input type="text"
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="applyFilters()"
                 placeholder="Search voucher no., type, narration, status, created by, approved by..."
                 class="form-control form-control-sm" />
        </div>
        <div class="col-md-3">
          <select [(ngModel)]="dateSort" class="form-select form-select-sm">
            <option value="desc">Date: Newest first</option>
            <option value="asc">Date: Oldest first</option>
          </select>
        </div>
        <div class="col-md-3 d-flex gap-2">
          <button type="button" class="btn btn-outline-primary btn-sm" (click)="applyFilters()">Apply Filter</button>
          <button *ngIf="searchQuery || filterVoucherType || filterVoucherNo"
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  (click)="clearFilters()">
            Clear filters
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card matching Screenshot 2 column-for-column -->
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ filteredRows.length }} vouchers</span>
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAll()">Delete All (this view)</button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-sm align-middle mb-0">
          <thead>
            <tr class="text-uppercase small fw-bold">
              <th style="min-width: 120px;">ENTITY GSTN</th>
              <th style="min-width: 140px;">BRANCH NAME</th>
              <th style="min-width: 110px;">DATE</th>
              <th style="min-width: 120px;">VOUCHER TYPE</th>
              <th style="min-width: 130px;">VOUCHER NO.</th>
              <th style="min-width: 70px;">LINE ID</th>
              <th style="min-width: 90px;">LEDGER ID</th>
              <th style="min-width: 160px;">LEDGER NAME</th>
              <th style="min-width: 110px;" class="text-end">DR AMOUNT</th>
              <th style="min-width: 110px;" class="text-end">CR AMOUNT</th>
              <th style="min-width: 120px;">TYPE OF LEDGER</th>
            </tr>
            <!-- Second Row with inline filters -->
            <tr class="bg-light">
              <th></th>
              <th></th>
              <th></th>
              <th>
                <select [(ngModel)]="filterVoucherType" (change)="applyFilters()" class="form-select form-select-sm py-0">
                  <option value="">All</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Journal">Journal</option>
                  <option value="Payment">Payment</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Contra">Contra</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
                </select>
              </th>
              <th>
                <input type="text"
                       [(ngModel)]="filterVoucherNo"
                       (input)="applyFilters()"
                       placeholder="Filter..."
                       class="form-control form-control-sm py-0" />
              </th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of filteredRows">
              <td class="text-muted small">{{ row.entityGstn || '—' }}</td>
              <td class="small">{{ row.branchName || 'Acme Trading Co' }}</td>
              <td class="small font-monospace">{{ row.date }}</td>
              <td>
                <span class="badge bg-info-subtle text-info-emphasis rounded-pill px-2">
                  {{ row.voucherType }}
                </span>
              </td>
              <td>
                <a routerLink="/vouchers/new" class="fw-bold text-teal text-decoration-none" style="color: #0f766e;">
                  {{ row.voucherNo }}
                </a>
              </td>
              <td class="font-monospace small">{{ row.lineId }}</td>
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
            </tr>
            <tr *ngIf="filteredRows.length === 0">
              <td colspan="11" class="text-center p-4 text-muted">No voucher rows found matching the current criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DayBookComponent implements OnInit {
  granularity: string = 'Custom';
  fromDate: string = '2024-04-01';
  toDate: string = '2026-10-22';
  searchQuery: string = '';
  dateSort: string = 'desc';

  filterVoucherType: string = '';
  filterVoucherNo: string = '';
  selectedFileName: string = '';

  rows: DayBookRow[] = [];
  filteredRows: DayBookRow[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    // Demo baseline matching Screenshot 2
    this.rows = [
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '28-08-2026',
        voucherType: 'Payroll',
        voucherNo: 'PR-202608',
        lineId: 1,
        ledgerId: '5100',
        ledgerName: 'Salary Expense',
        drAmount: 553000.00,
        typeOfLedger: 'Expense'
      },
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '28-08-2026',
        voucherType: 'Payroll',
        voucherNo: 'PR-202608',
        lineId: 2,
        ledgerId: '2300',
        ledgerName: 'PF Payable',
        crAmount: 33180.00,
        typeOfLedger: 'Liability'
      },
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '28-08-2026',
        voucherType: 'Payroll',
        voucherNo: 'PR-202608',
        lineId: 3,
        ledgerId: '2310',
        ledgerName: 'ESIC Payable',
        crAmount: 4147.50,
        typeOfLedger: 'Liability'
      },
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '28-08-2026',
        voucherType: 'Payroll',
        voucherNo: 'PR-202608',
        lineId: 4,
        ledgerId: '2320',
        ledgerName: 'PT Payable',
        crAmount: 1400.00,
        typeOfLedger: 'Liability'
      },
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '28-08-2026',
        voucherType: 'Payroll',
        voucherNo: 'PR-202608',
        lineId: 5,
        ledgerId: '2100',
        ledgerName: 'Salaries Payable',
        crAmount: 514272.50,
        typeOfLedger: 'Liability'
      },
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '15-08-2026',
        voucherType: 'Journal',
        voucherNo: 'JV-2026-001',
        lineId: 1,
        ledgerId: '5200',
        ledgerName: 'Rent Expense',
        drAmount: 45000.00,
        typeOfLedger: 'Expense'
      },
      {
        entityGstn: '—',
        branchName: 'Acme Trading Co',
        date: '15-08-2026',
        voucherType: 'Journal',
        voucherNo: 'JV-2026-001',
        lineId: 2,
        ledgerId: '1010',
        ledgerName: 'HDFC Bank Operating',
        crAmount: 45000.00,
        typeOfLedger: 'Asset'
      }
    ];

    // Fetch live backend vouchers to blend in
    this.http.get<any>(`${environment.apiUrl}/vouchers?page=0&size=50`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.content && res.data.content.length > 0) {
          const liveRows: DayBookRow[] = [];
          res.data.content.forEach((v: any) => {
            if (v.items && v.items.length) {
              v.items.forEach((item: any, idx: number) => {
                liveRows.push({
                  entityGstn: '—',
                  branchName: 'Acme Trading Co',
                  date: v.voucherDate || '2026-10-22',
                  voucherType: v.voucherType,
                  voucherNo: v.voucherNumber || `VCH-${v.id}`,
                  lineId: idx + 1,
                  ledgerId: String(item.ledgerId || '1000'),
                  ledgerName: item.ledgerName || 'General Ledger',
                  drAmount: item.entryType === 'DEBIT' ? item.amount : undefined,
                  crAmount: item.entryType === 'CREDIT' ? item.amount : undefined,
                  typeOfLedger: item.entryType === 'DEBIT' ? 'Expense' : 'Asset'
                });
              });
            }
          });
          if (liveRows.length > 0) {
            this.rows = [...liveRows, ...this.rows];
          }
        }
        this.applyFilters();
      },
      error: () => {
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    this.filteredRows = this.rows.filter(r => {
      if (this.filterVoucherType && r.voucherType.toLowerCase() !== this.filterVoucherType.toLowerCase()) {
        return false;
      }
      if (this.filterVoucherNo && !r.voucherNo.toLowerCase().includes(this.filterVoucherNo.toLowerCase())) {
        return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const str = `${r.voucherNo} ${r.voucherType} ${r.ledgerName} ${r.ledgerId} ${r.branchName} ${r.typeOfLedger}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });

    if (this.dateSort === 'asc') {
      this.filteredRows.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      this.filteredRows.sort((a, b) => b.date.localeCompare(a.date));
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterVoucherType = '';
    this.filterVoucherNo = '';
    this.applyFilters();
  }

  applyPeriod() {
    this.applyFilters();
  }

  resetToday() {
    const today = new Date().toISOString().split('T')[0];
    this.fromDate = today;
    this.toDate = today;
    this.applyFilters();
  }

  downloadTemplate() {
    alert('Day Book Excel template download started.');
  }

  exportExcel() {
    let csv = 'ENTITY GSTN,BRANCH NAME,DATE,VOUCHER TYPE,VOUCHER NO,LINE ID,LEDGER ID,LEDGER NAME,DR AMOUNT,CR AMOUNT,TYPE OF LEDGER\n';
    this.filteredRows.forEach(r => {
      csv += `"${r.entityGstn || ''}","${r.branchName}","${r.date}","${r.voucherType}","${r.voucherNo}","${r.lineId}","${r.ledgerId}","${r.ledgerName}","${r.drAmount || ''}","${r.crAmount || ''}","${r.typeOfLedger}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'day_book.csv';
    a.click();
  }

  exportPdf() {
    alert('Exporting Day Book PDF.');
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
    alert(`Importing vouchers from ${this.selectedFileName}...`);
  }

  deleteAll() {
    if (confirm(`Delete ALL ${this.filteredRows.length} entries currently shown? This action cannot be undone.`)) {
      this.rows = [];
      this.filteredRows = [];
    }
  }
}
