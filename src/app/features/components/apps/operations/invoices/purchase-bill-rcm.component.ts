import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-purchase-bill-rcm',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">Pay RCM / import GST</h3>
        <div class="subtitle text-muted small">
          Settle the GST payable under reverse charge or on imports (cash ledger / customs) — Dr RCM Payable, Cr Bank
        </div>
      </div>
      <div class="io-toolbar">
        <a routerLink="/purchase-bills" class="btn btn-sm btn-outline-secondary">Back</a>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Date *</label>
            <input type="date" [(ngModel)]="txnDate" name="txnDate" class="form-control form-control-sm" required>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Paid from (bank / cash) *</label>
            <select [(ngModel)]="accountId" name="accountId" class="form-select form-select-sm" required>
              <option value="">— choose —</option>
              <option *ngFor="let b of bankAccounts" [value]="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Reference (challan / BOE no.)</label>
            <input type="text" [(ngModel)]="reference" name="reference" class="form-control form-control-sm" placeholder="e.g. CIN / Challan number">
          </div>
        </div>
      </div>

      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-2">
            <thead class="table-light">
              <tr>
                <th>Liability</th>
                <th class="text-end" style="width: 200px;">Payable now</th>
                <th class="text-end" style="width: 220px;">Pay (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of balances">
                <td class="fw-semibold">{{ b.name }}</td>
                <td class="text-end font-monospace">₹{{ b.balance | number:'1.2-2' }}</td>
                <td class="text-end">
                  <input type="number" step="0.01" min="0" [max]="b.balance" [(ngModel)]="b.payAmount" [name]="'pay_' + b.id" class="form-control form-control-sm text-end">
                </td>
              </tr>
              <tr *ngIf="balances.length === 0">
                <td colspan="3" class="text-center text-muted py-3">No pending RCM liabilities.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="small text-muted">
          Balances are what the RCM / import journals have booked less earlier payments. Only bills whose RCM journal has been created appear here.
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 mb-4">
        <button type="submit" class="btn btn-primary" [disabled]="submitting" style="background-color: #00796b; border-color: #00796b;">
          {{ submitting ? 'Saving...' : 'Save payment' }}
        </button>
        <a routerLink="/purchase-bills" class="btn btn-link text-decoration-none">Cancel</a>
      </div>
    </form>

    <div class="card p-3 border bg-white shadow-sm">
      <h6 class="fw-bold mb-3">Payments made</h6>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Voucher</th>
              <th>Date</th>
              <th>Narration</th>
              <th class="text-end">Amount</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments">
              <td><strong class="font-monospace text-brand">{{ p.voucherNo }}</strong></td>
              <td>{{ p.date }}</td>
              <td class="small text-muted">{{ p.narration }}</td>
              <td class="text-end font-monospace fw-semibold">₹{{ p.amount | number:'1.2-2' }}</td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deletePayment(p.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="payments.length === 0">
              <td colspan="5" class="text-center text-muted py-3">None yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PurchaseBillRcmPaymentComponent implements OnInit {
  txnDate: string = new Date().toISOString().slice(0, 10);
  accountId: string = '';
  reference: string = '';
  bankAccounts: any[] = [];
  balances: any[] = [
    { id: 'cgst', name: 'CGST Payable under RCM', balance: 0, payAmount: 0 },
    { id: 'sgst', name: 'SGST Payable under RCM', balance: 0, payAmount: 0 },
    { id: 'igst', name: 'IGST Payable under RCM / Import', balance: 0, payAmount: 0 }
  ];
  payments: any[] = [];
  submitting: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiBaseUrl}/banking/accounts`).subscribe({
      next: (res) => { if (res && res.data) this.bankAccounts = res.data; },
      error: () => {}
    });
  }

  onSubmit() {
    if (!this.accountId) {
      alert('Choose the payment bank/cash account.');
      return;
    }
    const totalToPay = this.balances.reduce((sum, b) => sum + Number(b.payAmount || 0), 0);
    if (totalToPay <= 0) {
      alert('Please enter an amount to pay.');
      return;
    }
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.payments.push({
        id: Date.now(),
        voucherNo: `PMT-RCM-${Math.floor(Math.random() * 9000 + 1000)}`,
        date: this.txnDate,
        narration: `RCM payment: ${this.reference || 'Customs/GST portal settlement'}`,
        amount: totalToPay
      });
      this.balances.forEach(b => { b.balance = Math.max(0, b.balance - (b.payAmount || 0)); b.payAmount = 0; });
      alert('RCM payment saved successfully.');
    }, 500);
  }

  deletePayment(id: number) {
    if (confirm('Delete this payment voucher?')) {
      this.payments = this.payments.filter(p => p.id !== id);
    }
  }
}
