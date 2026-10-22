import { Component, OnInit } from '@angular/core';

export interface CoaMappingRow {
  id: number;
  code: string;
  name: string;
  type: string;
  g1: string;
  g2: string;
  place: string;
  status: 'ok' | 'catchall' | 'unclassified';
  selected?: boolean;
}

@Component({
  selector: 'app-coa-mapping',
  template: `
    <!-- Header matching Express views/accounts/coa_mapping.ejs -->
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div>
        <a routerLink="/accounts" class="btn btn-sm btn-outline-secondary mb-2 px-2 py-1" style="font-size: 0.82rem;">&larr; Back</a>
        <h3 class="mb-1 fw-bold text-dark" style="font-size: 1.45rem;">COA Mapping</h3>
        <div class="text-secondary small" style="line-height: 1.45;">
          Give every ledger a <strong>Ledger Group 1</strong> (primary) and <strong>Ledger Group 2</strong> (secondary). That pair decides where the ledger appears in the <strong>Schedule III</strong> Balance Sheet; income / expense ledgers also use their <a routerLink="/accounts/sector-mapping" class="text-primary text-decoration-underline">Sector Mapping</a> line.
        </div>
      </div>
      <div class="d-flex gap-2 align-items-center mt-2 flex-wrap">
        <a routerLink="/accounts" class="btn btn-sm btn-outline-secondary">&mdash; Chart of Accounts</a>
        <a routerLink="/accounts" class="btn btn-sm btn-outline-secondary">Manage Groups</a>
        <a routerLink="/accounts/sector-mapping" class="btn btn-sm btn-outline-primary fw-medium">Sector Mapping</a>
        <a routerLink="/reports/financials" class="btn btn-sm btn-outline-primary fw-medium">View Schedule III</a>
      </div>
    </div>

    <!-- Stat Counter Cards -->
    <div class="d-flex gap-3 flex-wrap mb-4">
      <div class="stat-card p-3 rounded border text-start cursor-pointer"
           [class.active-card]="currentStatusFilter === ''"
           (click)="setStatusFilter('')"
           style="min-width: 170px;">
        <span class="fs-4 fw-bold d-block">{{ counts.all }}</span>
        <span class="small fw-medium">All ledgers</span>
      </div>

      <div class="stat-card p-3 rounded border text-start cursor-pointer"
           [class.active-card]="currentStatusFilter === 'ok'"
           (click)="setStatusFilter('ok')"
           style="min-width: 200px;">
        <span class="fs-4 fw-bold d-block">{{ counts.ok }}</span>
        <span class="small fw-medium">Specific Schedule III line</span>
      </div>

      <div class="stat-card p-3 rounded border text-start cursor-pointer"
           [class.active-card]="currentStatusFilter === 'catchall'"
           (click)="setStatusFilter('catchall')"
           style="min-width: 240px;">
        <span class="fs-4 fw-bold d-block">{{ counts.catchall }}</span>
        <span class="small fw-medium">Catch-all line &mdash; add Group 2</span>
      </div>

      <div class="stat-card p-3 rounded border text-start cursor-pointer"
           [class.active-card]="currentStatusFilter === 'unclassified'"
           (click)="setStatusFilter('unclassified')"
           style="min-width: 210px;">
        <span class="fs-4 fw-bold d-block">{{ counts.unclassified }}</span>
        <span class="small fw-medium">Unclassified &mdash; needs Group 1</span>
      </div>
    </div>

    <!-- Main Content: Left Table & Right Documentation Sidebar -->
    <div class="row g-3">
      <div class="col-lg-9">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <!-- Filter Controls Form -->
          <div class="d-flex gap-2 flex-wrap align-items-center mb-3">
            <input type="search"
                   [(ngModel)]="searchQuery"
                   (keyup.enter)="applyFilters()"
                   class="form-control form-control-sm"
                   placeholder="Search ledger id or name…"
                   style="max-width: 240px;">

            <select [(ngModel)]="filterG1" class="form-select form-select-sm" style="max-width: 180px;">
              <option value="">Any Group 1</option>
              <option *ngFor="let g of primaryGroups" [value]="g">{{ g }}</option>
            </select>

            <select [(ngModel)]="filterG2" class="form-select form-select-sm" style="max-width: 180px;">
              <option value="">Any Group 2</option>
              <option value="-">(no Group 2)</option>
              <option *ngFor="let g of secondaryGroups" [value]="g">{{ g }}</option>
            </select>

            <select [(ngModel)]="filterType" class="form-select form-select-sm" style="max-width: 130px;">
              <option value="">Any type</option>
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>

            <button class="btn btn-sm btn-outline-primary px-3" (click)="applyFilters()">Apply filter</button>
            <button class="btn btn-sm btn-link text-decoration-none" (click)="clearFilters()">Clear</button>

            <span class="text-muted small ms-auto fw-medium">
              {{ filteredRows.length }} ledger(s) &middot; showing 1&ndash;{{ filteredRows.length }}
            </span>
          </div>

          <!-- Move to Bar -->
          <div class="d-flex gap-2 flex-wrap align-items-center mb-3 p-2 rounded" style="background-color: #f1f5f9;">
            <strong class="small text-secondary me-1">Move to:</strong>
            <select [(ngModel)]="bulkG1" class="form-select form-select-sm" style="max-width: 210px;">
              <option value="">Ledger Group 1…</option>
              <option *ngFor="let g of primaryGroups" [value]="g">{{ g }}</option>
            </select>

            <select [(ngModel)]="bulkG2" class="form-select form-select-sm" style="max-width: 230px;">
              <option value="">Ledger Group 2 (optional)</option>
              <option *ngFor="let g of secondaryGroups" [value]="g">{{ g }}</option>
            </select>

            <button class="btn btn-sm btn-outline-primary" (click)="applyToTicked()">Apply to ticked rows</button>
            <button class="btn btn-sm text-white" style="background-color: #0d9488;" (click)="applyToAllMatching()">
              Apply to all {{ filteredRows.length }} matching ledgers
            </button>
          </div>

          <!-- Ledgers Table -->
          <div class="table-responsive">
            <table class="table table-sm table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr class="small text-muted text-uppercase">
                  <th style="width: 32px;"><input type="checkbox" [(ngModel)]="selectAll" (change)="toggleSelectAll()"></th>
                  <th style="width: 100px;">LEDGER ID</th>
                  <th>LEDGER NAME</th>
                  <th style="width: 90px;">TYPE</th>
                  <th>LEDGER GROUP 1</th>
                  <th>LEDGER GROUP 2</th>
                  <th>SCHEDULE III LINE</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of filteredRows">
                  <td><input type="checkbox" [(ngModel)]="r.selected"></td>
                  <td class="fw-semibold text-secondary">{{ r.code }}</td>
                  <td class="fw-medium text-dark">{{ r.name }}</td>
                  <td>{{ r.type }}</td>
                  <td>{{ r.g1 || '—' }}</td>
                  <td>{{ r.g2 || '—' }}</td>
                  <td>
                    <span>{{ r.place }}</span>
                    <span *ngIf="r.status === 'ok'" class="badge text-bg-success ms-2 px-2 py-1" style="font-weight: 500; font-size: 0.72rem;">Specific line</span>
                    <span *ngIf="r.status === 'catchall'" class="badge text-bg-warning ms-2 px-2 py-1" style="font-weight: 500; font-size: 0.72rem;">Catch-all line</span>
                    <span *ngIf="r.status === 'unclassified'" class="badge text-bg-danger ms-2 px-2 py-1" style="font-weight: 500; font-size: 0.72rem;">Unclassified</span>
                  </td>
                </tr>
                <tr *ngIf="filteredRows.length === 0">
                  <td colspan="7" class="text-center text-muted py-4">No ledgers match.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: How to map thousands of ledgers -->
      <div class="col-lg-3">
        <div class="card p-3 shadow-sm border-0 bg-white small" style="line-height: 1.6;">
          <h6 class="fw-bold text-dark mb-3">How to map thousands of ledgers</h6>
          <p class="mb-2"><strong>1.</strong> Filter to <strong>Unclassified</strong> or <strong>Catch-all</strong> to see what needs attention.</p>
          <p class="mb-2"><strong>2.</strong> Search by name (e.g. &quot;bank&quot;, &quot;loan&quot;, &quot;gst&quot;) or filter by Group 1.</p>
          <p class="mb-2"><strong>3.</strong> Choose Group 1 and Group 2, then <strong>Apply to all matching</strong>.</p>
          <p class="mb-3"><strong>4.</strong> Or map in Excel: the Chart of Accounts template has Ledger Group 1 / Ledger Group 2 columns; re-importing updates existing ledgers.</p>
          <p class="text-muted border-top pt-2 mb-0" style="font-size: 0.8rem;">
            A ledger that already has postings or an opening balance is not moved to a group of a different nature (e.g. asset &rarr; liability).
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: #ffffff;
      color: #334155;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .stat-card:hover {
      background: #f8fafc;
      border-color: #94a3b8 !important;
    }
    .active-card {
      background: #475569 !important;
      color: #ffffff !important;
      border-color: #334155 !important;
    }
    .active-card span {
      color: #ffffff !important;
    }
    .cursor-pointer {
      cursor: pointer;
    }
  `]
})
export class CoaMappingComponent implements OnInit {
  rawRows: CoaMappingRow[] = [
  {
    "id": 2,
    "code": "1000",
    "name": "Cash in Hand",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Cash-in-Hand",
    "place": "Balance Sheet › Assets › Cash and cash equivalents",
    "status": "ok"
  },
  {
    "id": 3,
    "code": "1100",
    "name": "Bank Account - HDFC",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Bank Accounts",
    "place": "Balance Sheet › Assets › Cash and cash equivalents",
    "status": "ok"
  },
  {
    "id": 4,
    "code": "1200",
    "name": "Accounts Receivable",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Sundry Debtors",
    "place": "Balance Sheet › Assets › Trade receivables",
    "status": "ok"
  },
  {
    "id": 5,
    "code": "1300",
    "name": "Inventory",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Stock-in-Hand",
    "place": "Balance Sheet › Assets › Inventories",
    "status": "ok"
  },
  {
    "id": 24,
    "code": "1350",
    "name": "Fixed Assets - Gross Block",
    "type": "Asset",
    "g1": "Fixed Assets",
    "g2": "",
    "place": "Balance Sheet › Assets › Tangible assets (non-current)",
    "status": "ok"
  },
  {
    "id": 26,
    "code": "1360",
    "name": "Accumulated Depreciation",
    "type": "Asset",
    "g1": "Fixed Assets",
    "g2": "",
    "place": "Balance Sheet › Assets › Tangible assets (non-current)",
    "status": "ok"
  },
  {
    "id": 6,
    "code": "1400",
    "name": "Input CGST",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Input Tax Credit",
    "place": "Balance Sheet › Assets › Other current assets",
    "status": "catchall"
  },
  {
    "id": 7,
    "code": "1401",
    "name": "Input SGST",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Input Tax Credit",
    "place": "Balance Sheet › Assets › Other current assets",
    "status": "catchall"
  },
  {
    "id": 8,
    "code": "1402",
    "name": "Input IGST",
    "type": "Asset",
    "g1": "Current Assets",
    "g2": "Input Tax Credit",
    "place": "Balance Sheet › Assets › Other current assets",
    "status": "catchall"
  },
  {
    "id": 9,
    "code": "2100",
    "name": "Accounts Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Sundry Creditors",
    "place": "Balance Sheet › Equity & Liabilities › Trade payables",
    "status": "ok"
  },
  {
    "id": 10,
    "code": "2200",
    "name": "Output CGST Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Duties & Taxes",
    "place": "Balance Sheet › Equity & Liabilities › Other current liabilities",
    "status": "catchall"
  },
  {
    "id": 11,
    "code": "2201",
    "name": "Output SGST Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Duties & Taxes",
    "place": "Balance Sheet › Equity & Liabilities › Other current liabilities",
    "status": "catchall"
  },
  {
    "id": 12,
    "code": "2202",
    "name": "Output IGST Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Duties & Taxes",
    "place": "Balance Sheet › Equity & Liabilities › Other current liabilities",
    "status": "catchall"
  },
  {
    "id": 13,
    "code": "2300",
    "name": "PF Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Provisions",
    "place": "Balance Sheet › Equity & Liabilities › Short-term provisions",
    "status": "ok"
  },
  {
    "id": 14,
    "code": "2301",
    "name": "TDS Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Duties & Taxes",
    "place": "Balance Sheet › Equity & Liabilities › Other current liabilities",
    "status": "catchall"
  },
  {
    "id": 15,
    "code": "2302",
    "name": "Salary Payable",
    "type": "Liability",
    "g1": "Current Liabilities",
    "g2": "Provisions",
    "place": "Balance Sheet › Equity & Liabilities › Short-term provisions",
    "status": "ok"
  },
  {
    "id": 16,
    "code": "3000",
    "name": "Owner's Capital",
    "type": "Equity",
    "g1": "Capital Account",
    "g2": "",
    "place": "Balance Sheet › Equity & Liabilities › Share capital",
    "status": "catchall"
  },
  {
    "id": 1,
    "code": "3900",
    "name": "Profit and Loss Account",
    "type": "Equity",
    "g1": "Capital Account",
    "g2": "Profit & Loss Account",
    "place": "Balance Sheet › Equity & Liabilities › Reserves and surplus",
    "status": "ok"
  },
  {
    "id": 17,
    "code": "4000",
    "name": "Sales Revenue",
    "type": "Income",
    "g1": "Sales Accounts",
    "g2": "",
    "place": "Statement of P&L › Other income",
    "status": "ok"
  },
  {
    "id": 18,
    "code": "5000",
    "name": "Purchases",
    "type": "Expense",
    "g1": "Purchase Accounts",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 19,
    "code": "5100",
    "name": "Salary Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Employee benefits expense",
    "status": "ok"
  },
  {
    "id": 20,
    "code": "5200",
    "name": "Rent Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 21,
    "code": "5300",
    "name": "Other Operating Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 27,
    "code": "5301",
    "name": "Utilities Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 28,
    "code": "5302",
    "name": "Telephone & Internet Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 29,
    "code": "5303",
    "name": "Marketing & Advertising Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 25,
    "code": "5900",
    "name": "Depreciation Expense",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Depreciation and amortization",
    "status": "ok"
  },
  {
    "id": 22,
    "code": "6000",
    "name": "Inter-Unit Stock Transfer - Out",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  },
  {
    "id": 23,
    "code": "6001",
    "name": "Inter-Unit Stock Transfer - In",
    "type": "Expense",
    "g1": "Indirect Expenses",
    "g2": "",
    "place": "Statement of P&L › Other expenses",
    "status": "catchall"
  }
];
  filteredRows: CoaMappingRow[] = [];

  counts = { all: 29, ok: 14, catchall: 15, unclassified: 0 };

  searchQuery = '';
  filterG1 = '';
  filterG2 = '';
  filterType = '';
  currentStatusFilter = '';

  bulkG1 = '';
  bulkG2 = '';
  selectAll = false;

  primaryGroups: string[] = [
    'Capital Account',
    'Current Assets',
    'Current Liabilities',
    'Fixed Assets',
    'Indirect Expenses',
    'Purchase Accounts',
    'Sales Accounts'
  ];

  secondaryGroups: string[] = [
    'Bank Accounts',
    'Cash-in-Hand',
    'Duties & Taxes',
    'Input Tax Credit',
    'Profit & Loss Account',
    'Provisions',
    'Stock-in-Hand',
    'Sundry Creditors',
    'Sundry Debtors'
  ];

  ngOnInit() {
    this.applyFilters();
  }

  setStatusFilter(status: string) {
    this.currentStatusFilter = status;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredRows = this.rawRows.filter(r => {
      const matchStatus = !this.currentStatusFilter || r.status === this.currentStatusFilter;
      const matchG1 = !this.filterG1 || r.g1 === this.filterG1;
      const matchG2 = !this.filterG2 || (this.filterG2 === '-' ? !r.g2 : r.g2 === this.filterG2);
      const matchType = !this.filterType || r.type.toLowerCase() === this.filterType.toLowerCase();
      const matchQ = !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
      return matchStatus && matchG1 && matchG2 && matchType && matchQ;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterG1 = '';
    this.filterG2 = '';
    this.filterType = '';
    this.currentStatusFilter = '';
    this.applyFilters();
  }

  toggleSelectAll() {
    this.filteredRows.forEach(r => r.selected = this.selectAll);
  }

  applyToTicked() {
    const ticked = this.filteredRows.filter(r => r.selected);
    if (!ticked.length) {
      alert('Please tick one or more rows to move.');
      return;
    }
    if (!this.bulkG1) {
      alert('Please select a Ledger Group 1.');
      return;
    }
    ticked.forEach(r => {
      r.g1 = this.bulkG1;
      if (this.bulkG2) r.g2 = this.bulkG2;
    });
    alert(`Moved ${ticked.length} ledger(s) successfully!`);
  }

  applyToAllMatching() {
    if (!this.bulkG1) {
      alert('Please select a Ledger Group 1.');
      return;
    }
    this.filteredRows.forEach(r => {
      r.g1 = this.bulkG1;
      if (this.bulkG2) r.g2 = this.bulkG2;
    });
    alert(`Applied to all ${this.filteredRows.length} matching ledgers!`);
  }
}
