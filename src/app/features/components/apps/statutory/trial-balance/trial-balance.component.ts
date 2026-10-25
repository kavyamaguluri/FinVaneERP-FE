import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface TrialBalanceRow {
  id?: number;
  code: string;
  name: string;
  primaryGroupName: string;
  secondaryGroupName: string;
  openingDr: number;
  openingCr: number;
  debit: number;
  credit: number;
  closingDr: number;
  closingCr: number;
}

@Component({
  selector: 'app-trial-balance',
  template: `
    <div class="page-header no-print">
      <div>
        <h3 class="mb-0">Trial Balance</h3>
        <div class="subtitle">Opening Balance, Debit, Credit and Closing Balance for the period selected below. Income/Expense ledgers always show a zero Opening Balance (they reset every period) &mdash; any manually entered opening balance on one is folded into the Profit and Loss Account ledger instead.</div>
      </div>
      <div class="io-toolbar">
        <button type="button" (click)="exportExcel()" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-file-earmark-excel me-1"></i>Export Excel
        </button>
        <button type="button" (click)="exportPdf()" class="btn btn-sm btn-outline-danger">
          <i class="bi bi-file-earmark-pdf me-1"></i>Export PDF
        </button>
      </div>
    </div>

    <!-- Period Filter Bar -->
    <div class="filter-bar no-print">
      <form (submit)="applyFilter($event)" class="row g-2 align-items-end" id="period-filter-form">
        <div class="col-auto">
          <label class="form-label mb-0 small">Granularity</label>
          <select [(ngModel)]="granularity" (change)="onGranularityChange()" name="granularity" id="granularity-select" class="form-select form-select-sm">
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
          <label class="form-label mb-0 small">From</label>
          <input type="date" [(ngModel)]="from" name="from" id="period-from" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <label class="form-label mb-0 small">To</label>
          <input type="date" [(ngModel)]="to" name="to" id="period-to" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-sm btn-primary">Apply</button>
        </div>
        <div class="col-auto">
          <button type="button" (click)="resetToToday()" class="btn btn-sm btn-outline-secondary">Reset to today</button>
        </div>
        <div class="col-12" *ngIf="dateRangeCorrected">
          <span class="small text-danger">From date cannot be after To date &mdash; To date was adjusted to match.</span>
        </div>
      </form>
    </div>

    <!-- Quick Search Row -->
    <div class="card p-2 mb-3 no-print">
      <div class="d-flex align-items-center justify-content-between">
        <div class="input-group input-group-sm" style="max-width: 320px;">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" [(ngModel)]="searchTerm" (input)="filterRows()" placeholder="Search code, ledger, group..." class="form-control border-start-0" />
          <button *ngIf="searchTerm" (click)="searchTerm = ''; filterRows()" class="btn btn-outline-secondary" type="button"><i class="bi bi-x"></i></button>
        </div>
        <div class="small text-muted">
          Showing <strong>{{ filteredRows.length }}</strong> of {{ rows.length }} ledgers
        </div>
      </div>
    </div>

    <!-- Table Card matching Express double-tier headers -->
    <div class="card p-3" style="overflow-x:auto;">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th rowspan="2" class="align-bottom">Code</th>
            <th rowspan="2" class="align-bottom">Ledger</th>
            <th rowspan="2" class="align-bottom">Primary Group</th>
            <th rowspan="2" class="align-bottom">Secondary Group</th>
            <th colspan="2" class="text-center border-start">Opening Balance</th>
            <th colspan="2" class="text-center border-start">Transactions (this period)</th>
            <th colspan="2" class="text-center border-start">Closing Balance</th>
          </tr>
          <tr>
            <th class="text-end border-start">Debit</th>
            <th class="text-end">Credit</th>
            <th class="text-end border-start">Debit</th>
            <th class="text-end">Credit</th>
            <th class="text-end border-start">Debit</th>
            <th class="text-end">Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of filteredRows">
            <td><span class="badge bg-light text-dark border">{{ r.code }}</span></td>
            <td>
              <span class="fw-semibold text-dark">{{ r.name }}</span>
            </td>
            <td><span class="text-muted small">{{ r.primaryGroupName }}</span></td>
            <td><span class="text-muted small">{{ r.secondaryGroupName || '—' }}</span></td>
            
            <td class="text-end border-start">
              <span *ngIf="r.openingDr">{{ formatNumber(r.openingDr) }}</span>
            </td>
            <td class="text-end">
              <span *ngIf="r.openingCr">{{ formatNumber(r.openingCr) }}</span>
            </td>

            <td class="text-end border-start">
              <span *ngIf="r.debit" class="fw-medium text-dark">{{ formatNumber(r.debit) }}</span>
            </td>
            <td class="text-end">
              <span *ngIf="r.credit" class="fw-medium text-dark">{{ formatNumber(r.credit) }}</span>
            </td>

            <td class="text-end border-start">
              <span *ngIf="r.closingDr" class="fw-semibold text-dark">{{ formatNumber(r.closingDr) }}</span>
            </td>
            <td class="text-end">
              <span *ngIf="r.closingCr" class="fw-semibold text-dark">{{ formatNumber(r.closingCr) }}</span>
            </td>
          </tr>
          <tr *ngIf="filteredRows.length === 0">
            <td colspan="10" class="text-center text-muted py-4">No ledger accounts match the active filter.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="fw-bold table-light border-top border-dark">
            <td colspan="4">Total</td>
            <td class="text-end border-start">{{ formatNumber(totals.openingDr) }}</td>
            <td class="text-end">{{ formatNumber(totals.openingCr) }}</td>
            <td class="text-end border-start">{{ formatNumber(totals.debit) }}</td>
            <td class="text-end">{{ formatNumber(totals.credit) }}</td>
            <td class="text-end border-start">{{ formatNumber(totals.closingDr) }}</td>
            <td class="text-end">{{ formatNumber(totals.closingCr) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .page-header h3 {
      font-weight: 700;
      color: #020617;
      font-size: 1.45rem;
    }
    .subtitle {
      font-size: 0.84rem;
      color: #475569;
      max-width: 900px;
    }
    .filter-bar {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 2px rgba(15,23,42,0.05);
    }
    .io-toolbar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }
    @media print {
      .no-print { display: none !important; }
      body { background: #fff !important; }
      .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
    }
  `]
})
export class TrialBalanceComponent implements OnInit {
  granularity: string = 'custom';
  from: string = '2024-04-01';
  to: string = '2026-10-25';
  dateRangeCorrected: boolean = false;
  searchTerm: string = '';

  rows: TrialBalanceRow[] = [
    { code: '3000', name: "Owner's Capital", primaryGroupName: 'Capital Account', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 0, credit: 500000, closingDr: 0, closingCr: 500000 },
    { code: '3900', name: 'Profit and Loss Account', primaryGroupName: 'Capital Account', secondaryGroupName: 'Profit & Loss Account', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '2100', name: 'Accounts Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Sundry Creditors', openingDr: 0, openingCr: 0, debit: 0, credit: 50538774, closingDr: 0, closingCr: 50538774 },
    { code: '2200', name: 'Output CGST Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 2068830, closingDr: 0, closingCr: 2068830 },
    { code: '2201', name: 'Output SGST Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 2068830, closingDr: 0, closingCr: 2068830 },
    { code: '2202', name: 'Output IGST Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 2529678, closingDr: 0, closingCr: 2529678 },
    { code: '2210', name: 'CGST Payable under RCM', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '2211', name: 'SGST Payable under RCM', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '2212', name: 'IGST Payable under RCM / Import', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '2220', name: 'TDS Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Duties & Taxes', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '2300', name: 'PF Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Provisions', openingDr: 0, openingCr: 0, debit: 0, credit: 688380, closingDr: 0, closingCr: 688380 },
    { code: '2302', name: 'Salary Payable', primaryGroupName: 'Current Liabilities', secondaryGroupName: 'Provisions', openingDr: 0, openingCr: 0, debit: 0, credit: 10784620, closingDr: 0, closingCr: 10784620 },
    { code: '1350', name: 'Fixed Assets - Gross Block', primaryGroupName: 'Fixed Assets', secondaryGroupName: 'Fixed Assets', openingDr: 0, openingCr: 0, debit: 1779000, credit: 0, closingDr: 1779000, closingCr: 0 },
    { code: '1360', name: 'Accumulated Depreciation', primaryGroupName: 'Fixed Assets', secondaryGroupName: 'Fixed Assets', openingDr: 0, openingCr: 0, debit: 0, credit: 575176.35, closingDr: 0, closingCr: 575176.35 },
    { code: '1020', name: 'Bank Account - HDFC', primaryGroupName: 'Current Assets', secondaryGroupName: 'Bank Accounts', openingDr: 0, openingCr: 0, debit: 0, credit: 586750, closingDr: 0, closingCr: 586750 },
    { code: '1000', name: 'Cash in Hand', primaryGroupName: 'Current Assets', secondaryGroupName: 'Cash-in-Hand', openingDr: 0, openingCr: 0, debit: 0, credit: 302000, closingDr: 0, closingCr: 302000 },
    { code: '1100', name: 'Inventory', primaryGroupName: 'Current Assets', secondaryGroupName: 'Stock-in-Hand', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '1200', name: 'Accounts Receivable', primaryGroupName: 'Current Assets', secondaryGroupName: 'Sundry Debtors', openingDr: 0, openingCr: 0, debit: 44366108, credit: 0, closingDr: 44366108, closingCr: 0 },
    { code: '1400', name: 'Input CGST', primaryGroupName: 'Current Assets', secondaryGroupName: 'Input Tax Credit', openingDr: 0, openingCr: 0, debit: 3674487, credit: 0, closingDr: 3674487, closingCr: 0 },
    { code: '1401', name: 'Input SGST', primaryGroupName: 'Current Assets', secondaryGroupName: 'Input Tax Credit', openingDr: 0, openingCr: 0, debit: 3674487, credit: 0, closingDr: 3674487, closingCr: 0 },
    { code: '1402', name: 'Input IGST', primaryGroupName: 'Current Assets', secondaryGroupName: 'Input Tax Credit', openingDr: 0, openingCr: 0, debit: 16830, credit: 0, closingDr: 16830, closingCr: 0 },
    { code: '1410', name: 'Input CGST - RCM', primaryGroupName: 'Current Assets', secondaryGroupName: 'Input Tax Credit', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '1411', name: 'Input SGST - RCM', primaryGroupName: 'Current Assets', secondaryGroupName: 'Input Tax Credit', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '1412', name: 'Input IGST - RCM / Import', primaryGroupName: 'Current Assets', secondaryGroupName: 'Input Tax Credit', openingDr: 0, openingCr: 0, debit: 0, credit: 0, closingDr: 0, closingCr: 0 },
    { code: '4000', name: 'Sales Revenue', primaryGroupName: 'Direct Incomes', secondaryGroupName: 'Sales Accounts', openingDr: 0, openingCr: 0, debit: 0, credit: 37755600, closingDr: 0, closingCr: 37755600 },
    { code: '5000', name: 'Purchases', primaryGroupName: 'Direct Expenses', secondaryGroupName: 'Purchase Accounts', openingDr: 0, openingCr: 0, debit: 41913800, credit: 0, closingDr: 41913800, closingCr: 0 },
    { code: '5100', name: 'Salary Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 11473000, credit: 0, closingDr: 11473000, closingCr: 0 },
    { code: '5200', name: 'Rent Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 202250, credit: 0, closingDr: 202250, closingCr: 0 },
    { code: '5300', name: 'Other Operating Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 196250, credit: 0, closingDr: 196250, closingCr: 0 },
    { code: '5400', name: 'Utilities Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 175000, credit: 0, closingDr: 175000, closingCr: 0 },
    { code: '5500', name: 'Telephone & Internet Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 178750, credit: 0, closingDr: 178750, closingCr: 0 },
    { code: '5600', name: 'Marketing & Advertising Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 173500, credit: 0, closingDr: 173500, closingCr: 0 },
    { code: '5900', name: 'Depreciation Expense', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 575176.35, credit: 0, closingDr: 575176.35, closingCr: 0 },
    { code: '6000', name: 'Inter-Unit Stock Transfer - Out', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 0, credit: 93500, closingDr: 0, closingCr: 93500 },
    { code: '6001', name: 'Inter-Unit Stock Transfer - In', primaryGroupName: 'Indirect Expenses', secondaryGroupName: '—', openingDr: 0, openingCr: 0, debit: 93500, credit: 0, closingDr: 93500, closingCr: 0 }
  ];

  filteredRows: TrialBalanceRow[] = [];

  totals = {
    openingDr: 0.00,
    openingCr: 0.00,
    debit: 108492138.35,
    credit: 108492138.35,
    closingDr: 108492138.35,
    closingCr: 108492138.35
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.to = today;
    this.filterRows();
    this.calculateTotals();
  }

  filterRows(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRows = [...this.rows];
    } else {
      const q = this.searchTerm.toLowerCase().trim();
      this.filteredRows = this.rows.filter(r =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.primaryGroupName.toLowerCase().includes(q) ||
        (r.secondaryGroupName && r.secondaryGroupName.toLowerCase().includes(q))
      );
    }
    this.calculateTotals();
  }

  calculateTotals(): void {
    let od = 0, oc = 0, d = 0, c = 0, cd = 0, cc = 0;
    for (const r of this.filteredRows) {
      od += r.openingDr || 0;
      oc += r.openingCr || 0;
      d += r.debit || 0;
      c += r.credit || 0;
      cd += r.closingDr || 0;
      cc += r.closingCr || 0;
    }
    this.totals = {
      openingDr: od,
      openingCr: oc,
      debit: d,
      credit: c,
      closingDr: cd,
      closingCr: cc
    };
  }

  onGranularityChange(): void {
    const now = new Date();
    const curYear = now.getFullYear();
    if (this.granularity === 'annually') {
      this.from = '2024-04-01';
      this.to = `${curYear}-03-31`;
    } else if (this.granularity === 'half_yearly') {
      this.from = '2024-04-01';
      this.to = '2024-09-30';
    } else if (this.granularity === 'quarterly') {
      this.from = '2024-04-01';
      this.to = '2024-06-30';
    } else if (this.granularity === 'monthly') {
      const m = String(now.getMonth() + 1).padStart(2, '0');
      this.from = `${curYear}-${m}-01`;
      this.to = now.toISOString().split('T')[0];
    }
  }

  shiftPeriod(direction: number): void {
    const f = new Date(this.from);
    if (this.granularity === 'monthly') {
      f.setMonth(f.getMonth() + direction);
      this.from = f.toISOString().split('T')[0];
    } else if (this.granularity === 'quarterly') {
      f.setMonth(f.getMonth() + (direction * 3));
      this.from = f.toISOString().split('T')[0];
    } else if (this.granularity === 'annually') {
      f.setFullYear(f.getFullYear() + direction);
      this.from = f.toISOString().split('T')[0];
    }
  }

  applyFilter(e: Event): void {
    e.preventDefault();
    if (this.from > this.to) {
      this.to = this.from;
      this.dateRangeCorrected = true;
    } else {
      this.dateRangeCorrected = false;
    }
  }

  resetToToday(): void {
    this.granularity = 'custom';
    this.from = '2024-04-01';
    this.to = new Date().toISOString().split('T')[0];
    this.dateRangeCorrected = false;
    this.searchTerm = '';
    this.filterRows();
  }

  exportExcel(): void {
    let csv = 'Code,Ledger,Primary Group,Secondary Group,Opening Dr,Opening Cr,Txn Dr,Txn Cr,Closing Dr,Closing Cr\n';
    this.rows.forEach(r => {
      csv += `"${r.code}","${r.name}","${r.primaryGroupName}","${r.secondaryGroupName}",${r.openingDr},${r.openingCr},${r.debit},${r.credit},${r.closingDr},${r.closingCr}\n`;
    });
    csv += `"Total","","","",${this.totals.openingDr},${this.totals.openingCr},${this.totals.debit},${this.totals.credit},${this.totals.closingDr},${this.totals.closingCr}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${this.from}-to-${this.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    window.print();
  }

  formatNumber(val: number | undefined | null): string {
    if (val === undefined || val === null || val === 0) return '0.00';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
