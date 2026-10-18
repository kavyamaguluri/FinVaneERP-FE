import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VouchersService } from '../../../../service/accounts/vouchers.service';
import { AccountsService } from '../../../../service/accounts/accounts.service';
import { AccountLedger } from '../../../../api/accounts/account-ledger.model';
import { VoucherRequest } from '../../../../api/accounts/voucher.model';

@Component({
  selector: 'app-voucher-entry',
  template: `
    <div class="p-card p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-xl font-bold text-900 m-0">Accounting > Double-Entry Voucher</h2>
          <span class="text-sm text-500">Post balanced Journal, Payment, Receipt, or Contra entries</span>
        </div>
        <button pButton label="Back to Register" icon="pi pi-arrow-left" class="p-button-outlined p-button-sm" routerLink="/vouchers"></button>
      </div>

      <!-- Voucher Header Fields -->
      <div class="grid mb-3">
        <div class="col-12 md:col-3">
          <label class="font-semibold text-sm block mb-1">Voucher Type *</label>
          <select [(ngModel)]="voucher.voucherType" class="w-full p-2 border-1 surface-border border-round text-sm">
            <option value="JOURNAL">Journal Voucher (JV)</option>
            <option value="PAYMENT">Payment Voucher (PV)</option>
            <option value="RECEIPT">Receipt Voucher (RV)</option>
            <option value="CONTRA">Contra Voucher (CV)</option>
          </select>
        </div>

        <div class="col-12 md:col-3">
          <label class="font-semibold text-sm block mb-1">Voucher Date *</label>
          <input type="date" [(ngModel)]="voucher.voucherDate" class="w-full p-2 border-1 surface-border border-round text-sm" />
        </div>

        <div class="col-12 md:col-6">
          <label class="font-semibold text-sm block mb-1">Reference / Cheque / Inv No.</label>
          <input type="text" pInputText [(ngModel)]="voucher.referenceNo" placeholder="Optional reference" class="w-full" />
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="mb-4">
        <div class="flex justify-content-between align-items-center mb-2">
          <span class="font-semibold text-sm text-700">Accounting Entries (Dr / Cr)</span>
          <button pButton label="Add Line" icon="pi pi-plus" class="p-button-text p-button-sm" (click)="addLine()"></button>
        </div>

        <p-table [value]="voucher.items" styleClass="p-datatable-sm p-datatable-gridlines">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 35%">Account Ledger *</th>
              <th style="width: 15%">Type *</th>
              <th style="width: 20%" class="text-right">Amount (₹) *</th>
              <th style="width: 25%">Line Narration</th>
              <th style="width: 5%"></th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item let-i="rowIndex">
            <tr>
              <td>
                <select [(ngModel)]="item.ledgerId" class="w-full p-2 border-1 surface-border border-round text-sm">
                  <option *ngFor="let l of ledgers" [value]="l.id">{{ l.code }} - {{ l.name }}</option>
                </select>
              </td>
              <td>
                <select [(ngModel)]="item.entryType" (change)="recalculateTotals()" class="w-full p-2 border-1 surface-border border-round text-sm font-semibold">
                  <option value="DEBIT">Dr (Debit)</option>
                  <option value="CREDIT">Cr (Credit)</option>
                </select>
              </td>
              <td>
                <input type="number" pInputText [(ngModel)]="item.amount" (input)="recalculateTotals()" class="w-full text-right font-mono" placeholder="0.00" />
              </td>
              <td>
                <input type="text" pInputText [(ngModel)]="item.lineNarration" class="w-full" placeholder="Particulars" />
              </td>
              <td class="text-center">
                <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="removeLine(i)" [disabled]="voucher.items.length <= 2"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Master Narration -->
      <div class="mb-4">
        <label class="font-semibold text-sm block mb-1">General Narration</label>
        <textarea rows="2" [(ngModel)]="voucher.narration" class="w-full p-2 border-1 surface-border border-round text-sm" placeholder="Narration for this transaction"></textarea>
      </div>

      <!-- Totals & Balance Verification Footer -->
      <div class="flex flex-wrap justify-content-between align-items-center surface-ground p-3 border-round border-1 surface-border mb-4">
        <div class="flex gap-4">
          <div>
            <span class="text-xs text-500 block">Total Debit:</span>
            <span class="font-mono font-bold text-lg text-900">{{ totalDebit | indianCurrency }}</span>
          </div>
          <div>
            <span class="text-xs text-500 block">Total Credit:</span>
            <span class="font-mono font-bold text-lg text-900">{{ totalCredit | indianCurrency }}</span>
          </div>
        </div>

        <div class="flex align-items-center gap-3">
          <!-- Neutral state when no amounts are entered yet -->
          <span *ngIf="totalDebit === 0 && totalCredit === 0" class="p-badge font-semibold px-3 py-2 text-sm surface-200 text-700">
            <i class="pi pi-info-circle mr-1"></i>Enter amounts
          </span>

          <!-- Balanced state when amounts match -->
          <span *ngIf="totalDebit > 0 && isBalanced" class="p-badge p-badge-success font-semibold px-3 py-2 text-sm">
            <i class="pi pi-check mr-1"></i>Balanced
          </span>

          <!-- Unbalanced state with non-zero difference -->
          <span *ngIf="(totalDebit > 0 || totalCredit > 0) && !isBalanced" class="p-badge p-badge-danger font-semibold px-3 py-2 text-sm">
            <i class="pi pi-exclamation-triangle mr-1"></i>Difference: {{ difference | indianCurrency }}
          </span>

          <button pButton label="Post Voucher" icon="pi pi-check" class="p-button-sm" [disabled]="!isBalanced || submitting" (click)="submitVoucher()"></button>
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
    private router: Router
  ) {}

  ngOnInit() {
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
        this.router.navigate(['/statutory/trial-balance']);
      },
      error: (err) => {
        this.submitting = false;
        alert(err.message || 'Error posting voucher');
      }
    });
  }
}
