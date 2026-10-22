import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VouchersService } from '../../../../service/accounts/vouchers.service';
import { AccountsService } from '../../../../service/accounts/accounts.service';
import { AccountLedger } from '../../../../api/accounts/account-ledger.model';
import { VoucherRequest } from '../../../../api/accounts/voucher.model';

@Component({
  selector: 'app-voucher-entry',
  template: `
    <!-- Page Header matching Express voucher view -->
    <div class="page-header">
      <div>
        <h3 class="mb-0">New {{ voucherTypeTitle }}</h3>
        <div class="subtitle">Post double-entry balanced transaction to the general ledger</div>
      </div>
      <div class="io-toolbar">
        <a routerLink="/vouchers" class="btn btn-sm btn-outline-secondary">
          &larr; Day Book (All Vouchers)
        </a>
      </div>
    </div>

    <div class="card p-4">
      <!-- Voucher Header Fields -->
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <label class="form-label">Voucher Type *</label>
          <select [(ngModel)]="voucher.voucherType" (change)="onTypeChange()" class="form-select form-select-sm">
            <option value="JOURNAL">Journal (JV)</option>
            <option value="PAYMENT">Payment (PV)</option>
            <option value="RECEIPT">Receipt (RV)</option>
            <option value="CONTRA">Contra (CV)</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Voucher Date *</label>
          <input type="date" [(ngModel)]="voucher.voucherDate" class="form-control form-control-sm" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Reference / Cheque / Invoice No.</label>
          <input type="text" [(ngModel)]="voucher.referenceNo" placeholder="Optional reference" class="form-control form-control-sm" />
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-semibold small text-muted text-uppercase">Accounting Line Entries (Dr / Cr)</span>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addLine()">
            <i class="bi bi-plus-lg me-1"></i>Add Line
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle mb-0">
            <thead>
              <tr>
                <th style="width: 35%">Account Ledger *</th>
                <th style="width: 15%">Type *</th>
                <th style="width: 20%" class="text-end">Amount (₹) *</th>
                <th style="width: 25%">Line Narration</th>
                <th style="width: 5%" class="text-center"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of voucher.items; let i = index">
                <td>
                  <select [(ngModel)]="item.ledgerId" class="form-select form-select-sm">
                    <option *ngFor="let l of ledgers" [value]="l.id">{{ l.code }} - {{ l.name }}</option>
                  </select>
                </td>
                <td>
                  <select [(ngModel)]="item.entryType" (change)="recalculateTotals()" class="form-select form-select-sm fw-bold">
                    <option value="DEBIT">Dr (Debit)</option>
                    <option value="CREDIT">Cr (Credit)</option>
                  </select>
                </td>
                <td>
                  <input type="number"
                         [(ngModel)]="item.amount"
                         (input)="recalculateTotals()"
                         class="form-control form-control-sm text-end font-monospace"
                         placeholder="0.00" />
                </td>
                <td>
                  <input type="text" [(ngModel)]="item.lineNarration" class="form-control form-control-sm" placeholder="Particulars" />
                </td>
                <td class="text-center">
                  <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="removeLine(i)" [disabled]="voucher.items.length <= 2">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- General Narration -->
      <div class="mb-4">
        <label class="form-label">General Narration</label>
        <textarea rows="2" [(ngModel)]="voucher.narration" class="form-control form-control-sm" placeholder="Narration for this transaction"></textarea>
      </div>

      <!-- Totals & Balance Verification Footer -->
      <div class="d-flex flex-wrap justify-content-between align-items-center p-3 rounded mb-3" style="background: var(--bg); border: 1px solid var(--ink-100);">
        <div class="d-flex gap-4">
          <div>
            <span class="small text-muted d-block">Total Debit:</span>
            <span class="font-monospace fw-bold fs-5 text-dark">{{ totalDebit | indianCurrency }}</span>
          </div>
          <div>
            <span class="small text-muted d-block">Total Credit:</span>
            <span class="font-monospace fw-bold fs-5 text-dark">{{ totalCredit | indianCurrency }}</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <span *ngIf="totalDebit === 0 && totalCredit === 0" class="badge bg-secondary text-white px-3 py-2">
            Enter amounts
          </span>

          <span *ngIf="totalDebit > 0 && isBalanced" class="badge badge-status-posted px-3 py-2">
            <i class="bi bi-check-circle me-1"></i>Balanced
          </span>

          <span *ngIf="(totalDebit > 0 || totalCredit > 0) && !isBalanced" class="badge badge-status-rejected px-3 py-2">
            <i class="bi bi-exclamation-triangle me-1"></i>Difference: {{ difference | indianCurrency }}
          </span>

          <button type="button"
                  class="btn btn-primary"
                  [disabled]="!isBalanced || submitting"
                  (click)="submitVoucher()">
            <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
            Post Voucher
          </button>
        </div>
      </div>
    </div>
  `
})
export class VoucherEntryComponent implements OnInit {
  ledgers: AccountLedger[] = [];
  submitting: boolean = false;

  totalDebit: number = 0;
  totalCredit: number = 0;
  isBalanced: boolean = false;
  difference: number = 0;

  voucher: VoucherRequest = {
    voucherType: 'PAYMENT',
    voucherDate: new Date().toISOString().substring(0, 10),
    narration: '',
    referenceNo: '',
    items: []
  };

  constructor(
    private vouchersService: VouchersService,
    private accountsService: AccountsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const type = (params['type'] || '').toUpperCase();
      if (type === 'RECEIPT') this.voucher.voucherType = 'RECEIPT';
      else if (type === 'CONTRA') this.voucher.voucherType = 'CONTRA';
      else if (type === 'JOURNAL') this.voucher.voucherType = 'JOURNAL';
      else if (type === 'PAYMENT') this.voucher.voucherType = 'PAYMENT';
    });

    this.accountsService.getAllActiveLedgers().subscribe({
      next: (res) => {
        this.ledgers = res.data || [];
        if (this.ledgers.length >= 2) {
          this.voucher.items = [
            { ledgerId: this.ledgers[0].id!, entryType: 'DEBIT', amount: 0, lineNarration: '' },
            { ledgerId: this.ledgers[1].id!, entryType: 'CREDIT', amount: 0, lineNarration: '' }
          ];
        }
      }
    });
  }

  get voucherTypeTitle(): string {
    switch (this.voucher.voucherType) {
      case 'RECEIPT': return 'Receipt Voucher';
      case 'PAYMENT': return 'Payment Voucher';
      case 'CONTRA': return 'Contra Voucher';
      default: return 'Journal Voucher';
    }
  }

  onTypeChange() {
    this.recalculateTotals();
  }

  addLine() {
    const defaultLedgerId = this.ledgers.length > 0 ? this.ledgers[0].id! : 1;
    this.voucher.items.push({
      ledgerId: defaultLedgerId,
      entryType: 'DEBIT',
      amount: 0,
      lineNarration: ''
    });
    this.recalculateTotals();
  }

  removeLine(index: number) {
    if (this.voucher.items.length > 2) {
      this.voucher.items.splice(index, 1);
      this.recalculateTotals();
    }
  }

  recalculateTotals() {
    this.totalDebit = 0;
    this.totalCredit = 0;

    for (const item of this.voucher.items) {
      const amt = parseFloat(item.amount as any) || 0;
      if (item.entryType === 'DEBIT') {
        this.totalDebit += amt;
      } else {
        this.totalCredit += amt;
      }
    }

    this.difference = Math.abs(this.totalDebit - this.totalCredit);
    this.isBalanced = this.totalDebit > 0 && this.difference < 0.001;
  }

  submitVoucher() {
    if (!this.isBalanced) {
      alert('Cannot post unbalanced voucher: Total Debit must equal Total Credit');
      return;
    }

    this.submitting = true;
    this.vouchersService.createVoucher(this.voucher).subscribe({
      next: (res) => {
        alert('Voucher posted successfully: ' + (res.data?.voucherNumber || 'Success'));
        this.router.navigate(['/vouchers']);
      },
      error: (err) => {
        this.submitting = false;
        alert(err.message || 'Error posting voucher');
      }
    });
  }
}
