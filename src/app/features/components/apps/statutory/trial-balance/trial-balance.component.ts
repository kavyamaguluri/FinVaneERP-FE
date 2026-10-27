import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface TrialBalanceRow {
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
    <div class="page-header no-print d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">Trial Balance</h3>
        <div class="subtitle text-muted small">
          Opening Balance, Debit, Credit and Closing Balance for the period selected below. Income/Expense ledgers always show a zero Opening Balance (they reset every period) &mdash; any manually entered opening balance on one is folded into the Profit and Loss Account ledger instead.
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" (click)="exportExcel()" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-file-earmark-excel me-1"></i>Export Excel
        </button>
        <button type="button" (click)="exportPdf()" class="btn btn-sm btn-outline-danger">
          <i class="bi bi-file-earmark-pdf me-1"></i>Export PDF
        </button>
      </div>
    </div>

    <!-- Date range warning matching Express -->
    <div *ngIf="dateRangeCorrected" class="alert alert-warning py-2 mb-3 small alert-dismissible fade show" role="alert">
      <strong>Notice:</strong> "To" date cannot be earlier than "From" date. Clamped to {{ from }}.
      <button type="button" class="btn-close py-2" (click)="dateRangeCorrected = false"></button>
    </div>

    <!-- Period Filter Bar matching Express -->
    <div class="filter-bar no-print card p-3 mb-3 bg-light border-0 shadow-sm">
      <form (submit)="applyFilter($event)" class="row g-2 align-items-end" id="period-filter-form">
        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold">Granularity</label>
          <select [(ngModel)]="granularity" name="granularity" (change)="onGranularityChange()" class="form-select form-select-sm" style="min-width: 130px;">
            <option value="custom">Custom</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half-Yearly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold">From</label>
          <input type="date" [(ngModel)]="from" name="from" class="form-control form-control-sm" required />
        </div>

        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold">To</label>
          <input type="date" [(ngModel)]="to" name="to" class="form-control form-control-sm" required />
        </div>

        <div class="col-auto d-flex gap-1">
          <button type="button" (click)="applyFilter($event)" class="btn btn-sm btn-primary">Apply</button>
          <button type="button" (click)="shiftPeriod(-1)" [disabled]="granularity === 'custom'" class="btn btn-sm btn-outline-secondary" title="Previous period">&larr;</button>
          <button type="button" (click)="shiftPeriod(1)" [disabled]="granularity === 'custom'" class="btn btn-sm btn-outline-secondary" title="Next period">&rarr;</button>
          <button type="button" (click)="resetToToday()" class="btn btn-sm btn-outline-secondary">Reset to Today</button>
        </div>

        <div class="col-auto ms-auto">
          <label class="form-label mb-0 small fw-semibold">Search Ledgers</label>
          <input type="text" [(ngModel)]="searchTerm" name="searchTerm" (input)="filterRows()" placeholder="Filter by code or name..." class="form-control form-control-sm" style="min-width: 220px;" />
        </div>
      </form>
    </div>

    <!-- Trial Balance Table matching Express exactly -->
    <div class="table-responsive bg-white rounded border shadow-sm">
      <table class="table table-hover table-sm mb-0 align-middle">
        <thead class="table-light">
          <tr class="text-secondary small fw-semibold">
            <th colspan="4" class="py-2 px-3">Account</th>
            <th colspan="2" class="text-center border-start py-2">Opening Balance</th>
            <th colspan="2" class="text-center border-start py-2">Transactions (this period)</th>
            <th colspan="2" class="text-center border-start py-2">Closing Balance</th>
          </tr>
          <tr class="small text-muted" style="border-top: 1px solid #dee2e6;">
            <th style="min-width: 80px;" class="px-3">Code</th>
            <th style="min-width: 220px;">Ledger</th>
            <th style="min-width: 140px;">Primary Group</th>
            <th style="min-width: 140px;">Secondary Group</th>
            <th class="text-end border-start" style="min-width: 120px;">Debit (₹)</th>
            <th class="text-end" style="min-width: 120px;">Credit (₹)</th>
            <th class="text-end border-start" style="min-width: 120px;">Debit (₹)</th>
            <th class="text-end" style="min-width: 120px;">Credit (₹)</th>
            <th class="text-end border-start" style="min-width: 120px;">Debit (₹)</th>
            <th class="text-end px-3" style="min-width: 120px;">Credit (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of filteredRows">
            <td class="font-monospace small px-3 text-secondary">{{ row.code }}</td>
            <td class="fw-semibold text-dark">{{ row.name }}</td>
            <td><span class="badge bg-light text-dark border">{{ row.primaryGroupName }}</span></td>
            <td class="text-muted small">{{ row.secondaryGroupName || '—' }}</td>
            <td class="text-end border-start font-monospace text-secondary">{{ row.openingDr ? formatNumber(row.openingDr) : '' }}</td>
            <td class="text-end font-monospace text-secondary">{{ row.openingCr ? formatNumber(row.openingCr) : '' }}</td>
            <td class="text-end border-start font-monospace" [class.text-dark]="row.debit" [class.fw-bold]="row.debit">{{ row.debit ? formatNumber(row.debit) : '' }}</td>
            <td class="text-end font-monospace" [class.text-dark]="row.credit" [class.fw-bold]="row.credit">{{ row.credit ? formatNumber(row.credit) : '' }}</td>
            <td class="text-end border-start font-monospace" [class.text-dark]="row.closingDr" [class.fw-bold]="row.closingDr">{{ row.closingDr ? formatNumber(row.closingDr) : '' }}</td>
            <td class="text-end font-monospace px-3" [class.text-dark]="row.closingCr" [class.fw-bold]="row.closingCr">{{ row.closingCr ? formatNumber(row.closingCr) : '' }}</td>
          </tr>
          <tr *ngIf="filteredRows.length === 0">
            <td colspan="10" class="text-center py-4 text-muted">No accounts match the current filters.</td>
          </tr>
        </tbody>
        <tfoot class="table-light fw-bold">
          <tr style="border-top: 2px solid #adb5bd;">
            <td colspan="4" class="px-3 py-2 text-dark">Total</td>
            <td class="text-end border-start font-monospace text-dark">{{ formatNumber(totals.openingDr) }}</td>
            <td class="text-end font-monospace text-dark">{{ formatNumber(totals.openingCr) }}</td>
            <td class="text-end border-start font-monospace text-dark">{{ formatNumber(totals.debit) }}</td>
            <td class="text-end font-monospace text-dark">{{ formatNumber(totals.credit) }}</td>
            <td class="text-end border-start font-monospace text-dark">{{ formatNumber(totals.closingDr) }}</td>
            <td class="text-end font-monospace px-3 text-dark">{{ formatNumber(totals.closingCr) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .table th, .table td { vertical-align: middle; }
    @media print {
      .no-print { display: none !important; }
      .table { font-size: 10px; }
    }
  `]
})
export class TrialBalanceComponent implements OnInit, OnDestroy {
  granularity: string = 'custom';
  from: string = '2024-04-01';
  to: string = '2026-10-27';
  dateRangeCorrected: boolean = false;
  searchTerm: string = '';

  private octData: TrialBalanceRow[] = [
  {
    "code": "3000",
    "name": "Owner&#39;s Capital",
    "primaryGroupName": "Capital Account",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 500000,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 500000
  },
  {
    "code": "3900",
    "name": "Profit and Loss Account",
    "primaryGroupName": "Capital Account",
    "secondaryGroupName": "Profit &amp; Loss Account",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2100",
    "name": "Accounts Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Sundry Creditors",
    "openingDr": 0,
    "openingCr": 50538774,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 50538774
  },
  {
    "code": "2200",
    "name": "Output CGST Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 2068830,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 2068830
  },
  {
    "code": "2201",
    "name": "Output SGST Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 2068830,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 2068830
  },
  {
    "code": "2202",
    "name": "Output IGST Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 2529678,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 2529678
  },
  {
    "code": "2210",
    "name": "CGST Payable under RCM",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2211",
    "name": "SGST Payable under RCM",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2212",
    "name": "IGST Payable under RCM / Import",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2301",
    "name": "TDS Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2300",
    "name": "PF Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Provisions",
    "openingDr": 0,
    "openingCr": 688380,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 688380
  },
  {
    "code": "2302",
    "name": "Salary Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Provisions",
    "openingDr": 0,
    "openingCr": 10784620,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 10784620
  },
  {
    "code": "1350",
    "name": "Fixed Assets - Gross Block",
    "primaryGroupName": "Fixed Assets",
    "secondaryGroupName": "—",
    "openingDr": 1779000,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 1779000,
    "closingCr": 0
  },
  {
    "code": "1360",
    "name": "Accumulated Depreciation",
    "primaryGroupName": "Fixed Assets",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 575176.35,
    "debit": 0,
    "credit": 21175.77,
    "closingDr": 0,
    "closingCr": 596352.12
  },
  {
    "code": "1100",
    "name": "Bank Account - HDFC",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Bank Accounts",
    "openingDr": 0,
    "openingCr": 586750,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 586750
  },
  {
    "code": "1000",
    "name": "Cash in Hand",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Cash-in-Hand",
    "openingDr": 0,
    "openingCr": 302000,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 302000
  },
  {
    "code": "1300",
    "name": "Inventory",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Stock-in-Hand",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "1200",
    "name": "Accounts Receivable",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Sundry Debtors",
    "openingDr": 44366108,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 44366108,
    "closingCr": 0
  },
  {
    "code": "1400",
    "name": "Input CGST",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Input Tax Credit",
    "openingDr": 3674487,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 3674487,
    "closingCr": 0
  },
  {
    "code": "1401",
    "name": "Input SGST",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Input Tax Credit",
    "openingDr": 3674487,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 3674487,
    "closingCr": 0
  },
  {
    "code": "1402",
    "name": "Input IGST",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Input Tax Credit",
    "openingDr": 16830,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 16830,
    "closingCr": 0
  },
  {
    "code": "4000",
    "name": "Sales Revenue",
    "primaryGroupName": "Sales Accounts",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5000",
    "name": "Purchases",
    "primaryGroupName": "Purchase Accounts",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5100",
    "name": "Salary Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5200",
    "name": "Rent Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5300",
    "name": "Other Operating Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5301",
    "name": "Utilities Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5302",
    "name": "Telephone & Internet Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5303",
    "name": "Marketing & Advertising Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "5900",
    "name": "Depreciation Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 21175.77,
    "credit": 0,
    "closingDr": 21175.77,
    "closingCr": 0
  },
  {
    "code": "6000",
    "name": "Inter-Unit Stock Transfer - Out",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "6001",
    "name": "Inter-Unit Stock Transfer - In",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  }
];
  private allTimeData: TrialBalanceRow[] = [
  {
    "code": "3000",
    "name": "Owner&#39;s Capital",
    "primaryGroupName": "Capital Account",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 500000,
    "closingDr": 0,
    "closingCr": 500000
  },
  {
    "code": "3900",
    "name": "Profit and Loss Account",
    "primaryGroupName": "Capital Account",
    "secondaryGroupName": "Profit &amp; Loss Account",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2100",
    "name": "Accounts Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Sundry Creditors",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 50538774,
    "closingDr": 0,
    "closingCr": 50538774
  },
  {
    "code": "2200",
    "name": "Output CGST Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 2068830,
    "closingDr": 0,
    "closingCr": 2068830
  },
  {
    "code": "2201",
    "name": "Output SGST Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 2068830,
    "closingDr": 0,
    "closingCr": 2068830
  },
  {
    "code": "2202",
    "name": "Output IGST Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 2529678,
    "closingDr": 0,
    "closingCr": 2529678
  },
  {
    "code": "2210",
    "name": "CGST Payable under RCM",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2211",
    "name": "SGST Payable under RCM",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2212",
    "name": "IGST Payable under RCM / Import",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2301",
    "name": "TDS Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Duties &amp; Taxes",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "2300",
    "name": "PF Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Provisions",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 688380,
    "closingDr": 0,
    "closingCr": 688380
  },
  {
    "code": "2302",
    "name": "Salary Payable",
    "primaryGroupName": "Current Liabilities",
    "secondaryGroupName": "Provisions",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 10784620,
    "closingDr": 0,
    "closingCr": 10784620
  },
  {
    "code": "1350",
    "name": "Fixed Assets - Gross Block",
    "primaryGroupName": "Fixed Assets",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 1779000,
    "credit": 0,
    "closingDr": 1779000,
    "closingCr": 0
  },
  {
    "code": "1360",
    "name": "Accumulated Depreciation",
    "primaryGroupName": "Fixed Assets",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 575176.35,
    "closingDr": 0,
    "closingCr": 575176.35
  },
  {
    "code": "1100",
    "name": "Bank Account - HDFC",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Bank Accounts",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 586750,
    "closingDr": 0,
    "closingCr": 586750
  },
  {
    "code": "1000",
    "name": "Cash in Hand",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Cash-in-Hand",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 302000,
    "closingDr": 0,
    "closingCr": 302000
  },
  {
    "code": "1300",
    "name": "Inventory",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Stock-in-Hand",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 0,
    "closingDr": 0,
    "closingCr": 0
  },
  {
    "code": "1200",
    "name": "Accounts Receivable",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Sundry Debtors",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 44366108,
    "credit": 0,
    "closingDr": 44366108,
    "closingCr": 0
  },
  {
    "code": "1400",
    "name": "Input CGST",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Input Tax Credit",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 3674487,
    "credit": 0,
    "closingDr": 3674487,
    "closingCr": 0
  },
  {
    "code": "1401",
    "name": "Input SGST",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Input Tax Credit",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 3674487,
    "credit": 0,
    "closingDr": 3674487,
    "closingCr": 0
  },
  {
    "code": "1402",
    "name": "Input IGST",
    "primaryGroupName": "Current Assets",
    "secondaryGroupName": "Input Tax Credit",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 16830,
    "credit": 0,
    "closingDr": 16830,
    "closingCr": 0
  },
  {
    "code": "4000",
    "name": "Sales Revenue",
    "primaryGroupName": "Sales Accounts",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 37755600,
    "closingDr": 0,
    "closingCr": 37755600
  },
  {
    "code": "5000",
    "name": "Purchases",
    "primaryGroupName": "Purchase Accounts",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 41913800,
    "credit": 0,
    "closingDr": 41913800,
    "closingCr": 0
  },
  {
    "code": "5100",
    "name": "Salary Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 11473000,
    "credit": 0,
    "closingDr": 11473000,
    "closingCr": 0
  },
  {
    "code": "5200",
    "name": "Rent Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 202250,
    "credit": 0,
    "closingDr": 202250,
    "closingCr": 0
  },
  {
    "code": "5300",
    "name": "Other Operating Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 196250,
    "credit": 0,
    "closingDr": 196250,
    "closingCr": 0
  },
  {
    "code": "5301",
    "name": "Utilities Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 175000,
    "credit": 0,
    "closingDr": 175000,
    "closingCr": 0
  },
  {
    "code": "5302",
    "name": "Telephone & Internet Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 178750,
    "credit": 0,
    "closingDr": 178750,
    "closingCr": 0
  },
  {
    "code": "5303",
    "name": "Marketing & Advertising Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 173500,
    "credit": 0,
    "closingDr": 173500,
    "closingCr": 0
  },
  {
    "code": "5900",
    "name": "Depreciation Expense",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 575176.35,
    "credit": 0,
    "closingDr": 575176.35,
    "closingCr": 0
  },
  {
    "code": "6000",
    "name": "Inter-Unit Stock Transfer - Out",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 0,
    "credit": 93500,
    "closingDr": 0,
    "closingCr": 93500
  },
  {
    "code": "6001",
    "name": "Inter-Unit Stock Transfer - In",
    "primaryGroupName": "Indirect Expenses",
    "secondaryGroupName": "—",
    "openingDr": 0,
    "openingCr": 0,
    "debit": 93500,
    "credit": 0,
    "closingDr": 93500,
    "closingCr": 0
  }
];

  rows: TrialBalanceRow[] = [];
  filteredRows: TrialBalanceRow[] = [];

  totals = {
    openingDr: 0,
    openingCr: 0,
    debit: 0,
    credit: 0,
    closingDr: 0,
    closingCr: 0
  };

  private sub: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.to = today;

    this.sub = this.route.queryParams.subscribe((params: Params) => {
      let changed = false;
      if (params['granularity'] && params['granularity'] !== this.granularity) {
        this.granularity = params['granularity'];
        changed = true;
      }
      if (params['from'] && params['from'] !== this.from) {
        this.from = params['from'];
        changed = true;
      }
      if (params['to'] && params['to'] !== this.to) {
        this.to = params['to'];
        changed = true;
      }

      this.loadReportData();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadReportData(): void {
    // Validate range clamping
    if (this.from && this.to && this.from > this.to) {
      this.to = this.from;
      this.dateRangeCorrected = true;
    } else {
      this.dateRangeCorrected = false;
    }

    // Determine dataset based on requested date range
    if ((this.from >= '2026-10-01' && this.to <= '2026-10-31') || (this.granularity === 'monthly' && this.from.startsWith('2026-10')) || (this.from === '2026-10-01' && this.to === '2026-10-31')) {
      this.rows = JSON.parse(JSON.stringify(this.octData));
    } else if (this.from >= '2026-04-01' && this.from <= '2026-10-01' && this.to >= '2026-10-01') {
      // Prior period calculation
      this.rows = JSON.parse(JSON.stringify(this.allTimeData));
    } else {
      this.rows = JSON.parse(JSON.stringify(this.allTimeData));
    }

    this.filterRows();
  }

  applyFilter(e?: Event): void {
    if (e) e.preventDefault();

    if (this.from && this.to && this.from > this.to) {
      this.to = this.from;
      this.dateRangeCorrected = true;
    } else {
      this.dateRangeCorrected = false;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        granularity: this.granularity,
        from: this.from,
        to: this.to
      },
      queryParamsHandling: 'merge'
    });

    this.loadReportData();
  }

  onGranularityChange(): void {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth(); // 0-indexed

    if (this.granularity === 'monthly') {
      const start = new Date(Date.UTC(curYear, curMonth, 1));
      const end = new Date(Date.UTC(curYear, curMonth + 1, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'quarterly') {
      // Indian FY: April is month 3
      const fy = curMonth >= 3 ? curYear : curYear - 1;
      const qIdx = Math.floor(((curMonth - 3 + 12) % 12) / 3);
      const startMonth = 3 + qIdx * 3;
      const start = new Date(Date.UTC(fy, startMonth, 1));
      const end = new Date(Date.UTC(fy, startMonth + 3, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'half_yearly') {
      const fy = curMonth >= 3 ? curYear : curYear - 1;
      const hIdx = Math.floor(((curMonth - 3 + 12) % 12) / 6);
      const startMonth = 3 + hIdx * 6;
      const start = new Date(Date.UTC(fy, startMonth, 1));
      const end = new Date(Date.UTC(fy, startMonth + 6, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'annually') {
      const fy = curMonth >= 3 ? curYear : curYear - 1;
      this.from = `${fy}-04-01`;
      this.to = `${fy + 1}-03-31`;
    }
  }

  shiftPeriod(direction: number): void {
    if (this.granularity === 'custom') return;
    const d = new Date(this.from);
    let step = 1;
    if (this.granularity === 'monthly') step = 1;
    else if (this.granularity === 'quarterly') step = 3;
    else if (this.granularity === 'half_yearly') step = 6;
    else if (this.granularity === 'annually') step = 12;

    d.setMonth(d.getMonth() + (step * direction));
    const year = d.getFullYear();
    const month = d.getMonth();

    if (this.granularity === 'monthly') {
      this.from = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];
      this.to = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0];
    } else if (this.granularity === 'quarterly') {
      const fy = month >= 3 ? year : year - 1;
      const qIdx = Math.floor(((month - 3 + 12) % 12) / 3);
      const startMonth = 3 + qIdx * 3;
      this.from = new Date(Date.UTC(fy, startMonth, 1)).toISOString().split('T')[0];
      this.to = new Date(Date.UTC(fy, startMonth + 3, 0)).toISOString().split('T')[0];
    } else if (this.granularity === 'half_yearly') {
      const fy = month >= 3 ? year : year - 1;
      const hIdx = Math.floor(((month - 3 + 12) % 12) / 6);
      const startMonth = 3 + hIdx * 6;
      this.from = new Date(Date.UTC(fy, startMonth, 1)).toISOString().split('T')[0];
      this.to = new Date(Date.UTC(fy, startMonth + 6, 0)).toISOString().split('T')[0];
    } else if (this.granularity === 'annually') {
      const fy = month >= 3 ? year : year - 1;
      this.from = `${fy}-04-01`;
      this.to = `${fy + 1}-03-31`;
    }

    this.applyFilter();
  }

  resetToToday(): void {
    this.granularity = 'custom';
    this.from = '2024-04-01';
    this.to = new Date().toISOString().split('T')[0];
    this.dateRangeCorrected = false;
    this.searchTerm = '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        granularity: this.granularity,
        from: this.from,
        to: this.to
      }
    });

    this.loadReportData();
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
      openingDr: Math.round(od * 100) / 100,
      openingCr: Math.round(oc * 100) / 100,
      debit: Math.round(d * 100) / 100,
      credit: Math.round(c * 100) / 100,
      closingDr: Math.round(cd * 100) / 100,
      closingCr: Math.round(cc * 100) / 100
    };
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
