import { Component, OnInit } from '@angular/core';
import { LedgerReportService } from '../../../../service/accounts/ledger.service';
import { TrialBalanceReport } from '../../../../api/accounts/trial-balance.model';

@Component({
  selector: 'app-trial-balance',
  template: `
    <!-- Page Header matching Express report view -->
    <div class="page-header no-print">
      <div>
        <h3 class="mb-0">Trial Balance</h3>
        <div class="subtitle">Summary of all debit and credit balances across ledger accounts</div>
      </div>
      <div class="io-toolbar">
        <div class="d-flex align-items-center gap-2">
          <label class="small fw-semibold text-muted mb-0">As of:</label>
          <input type="date" [(ngModel)]="asOfDate" (change)="loadReport()" class="form-control form-control-sm" style="width: auto;" />
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="printReport()">
          <i class="bi bi-printer me-1"></i>Print / Save PDF
        </button>
      </div>
    </div>

    <div class="card p-4">
      <!-- Printable Report Header -->
      <div class="text-center mb-4">
        <div class="text-muted small text-uppercase fw-bold letter-spacing-1">FinVane ERP</div>
        <h4 class="fw-bold mb-1 text-dark">TRIAL BALANCE</h4>
        <p class="text-muted small mb-0">As of: {{ asOfDate }} · Currency: INR (₹)</p>
      </div>

      <!-- Trial Balance Table -->
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 15%">Account Code</th>
              <th style="width: 35%">Ledger Particulars</th>
              <th style="width: 20%">Account Group</th>
              <th style="width: 15%" class="text-end">Debit Balance (₹)</th>
              <th style="width: 15%" class="text-end">Credit Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of report?.rows || []">
              <td class="font-monospace small text-brand">{{ row.ledgerCode }}</td>
              <td class="fw-semibold text-dark">{{ row.ledgerName }}</td>
              <td class="small text-muted">{{ row.groupName }}</td>
              <td class="text-end font-monospace fw-semibold">
                <span *ngIf="row.closingDebit > 0">{{ row.closingDebit | indianCurrency }}</span>
                <span *ngIf="!row.closingDebit || row.closingDebit === 0" class="text-muted">-</span>
              </td>
              <td class="text-end font-monospace fw-semibold">
                <span *ngIf="row.closingCredit > 0">{{ row.closingCredit | indianCurrency }}</span>
                <span *ngIf="!row.closingCredit || row.closingCredit === 0" class="text-muted">-</span>
              </td>
            </tr>
            <tr *ngIf="!report?.rows || report?.rows?.length === 0">
              <td colspan="5" class="text-center p-4 text-muted">No transactions recorded for this period.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold" style="background: var(--brand-50); border-top: 2px solid var(--brand-100);">
              <td colspan="3" class="text-end text-uppercase text-brand">Grand Total:</td>
              <td class="text-end font-monospace fs-6 text-brand">{{ report?.totalDebit || 0 | indianCurrency }}</td>
              <td class="text-end font-monospace fs-6 text-brand">{{ report?.totalCredit || 0 | indianCurrency }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Balance Verification Alert -->
      <div class="mt-4 p-3 rounded no-print d-flex justify-content-between align-items-center"
           [ngClass]="{'bg-brand-soft border border-teal-200': (report?.isBalanced ?? report?.balanced), 'alert-danger': !(report?.isBalanced ?? report?.balanced)}">
        <div class="d-flex align-items-center gap-2">
          <i [class]="(report?.isBalanced ?? report?.balanced) ? 'bi bi-check-circle-fill text-success fs-5' : 'bi bi-exclamation-triangle-fill text-danger fs-5'"></i>
          <span class="fw-semibold small" [ngClass]="{'text-brand': (report?.isBalanced ?? report?.balanced), 'text-danger': !(report?.isBalanced ?? report?.balanced)}">
            {{ (report?.isBalanced ?? report?.balanced) ? 'The Trial Balance is strictly balanced (Total Debits = Total Credits).' : 'Warning: Imbalance detected in General Ledger postings.' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class TrialBalanceComponent implements OnInit {
  asOfDate: string = new Date().toISOString().substring(0, 10);
  report: TrialBalanceReport | null = null;
  loading: boolean = false;

  constructor(private ledgerService: LedgerReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.ledgerService.getTrialBalance(this.asOfDate).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.report = {
            ...res.data,
            isBalanced: res.data.balanced ?? res.data.isBalanced
          };
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  printReport() {
    window.print();
  }
}
