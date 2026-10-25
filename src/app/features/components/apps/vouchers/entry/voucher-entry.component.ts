import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface VoucherLineRow {
  accountId: string;
  debit: number | null;
  credit: number | null;
}

@Component({
  selector: 'app-voucher-entry',
  template: `
    <div class="mb-3">
      <a routerLink="/vouchers" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <h4 class="fw-bold mb-3">{{ pageTitle }}</h4>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <div class="card p-4 border bg-white shadow-sm">
      <form (ngSubmit)="onSubmit()">
        <div class="row mb-3 g-3">
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Date</label>
            <input type="date" [(ngModel)]="voucherDate" name="voucherDate" class="form-control" required />
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-semibold">Voucher Type</label>
            <select [(ngModel)]="voucherType" name="voucherType" (change)="onTypeChange()" class="form-select">
              <option value="receipt">Receipt</option>
              <option value="payment">Payment</option>
              <option value="contra">Contra</option>
              <option value="journal">Journal</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-semibold">Narration</label>
            <input type="text" [(ngModel)]="narration" name="narration" class="form-control" placeholder="Optional notes about this voucher" />
          </div>
        </div>

        <table class="table mb-0" id="lines-table">
          <thead class="table-light">
            <tr>
              <th style="width: 55%;">ACCOUNT</th>
              <th style="width: 20%;">DEBIT</th>
              <th style="width: 20%;">CREDIT</th>
              <th style="width: 5%;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ln of lines; let i = index">
              <td>
                <select [(ngModel)]="ln.accountId" [name]="'acc_' + i" class="form-select">
                  <option value="">-- select --</option>
                  <option *ngFor="let acc of accounts" [value]="acc.id">
                    {{ acc.code }} - {{ acc.name }}
                  </option>
                </select>
              </td>
              <td>
                <input type="number" step="0.01" [(ngModel)]="ln.debit" [name]="'dr_' + i" class="form-control" placeholder="0.00" (input)="onDebitChange(ln)" />
              </td>
              <td>
                <input type="number" step="0.01" [(ngModel)]="ln.credit" [name]="'cr_' + i" class="form-control" placeholder="0.00" (input)="onCreditChange(ln)" />
              </td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="removeRow(i)" title="Remove this row">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-3 mb-3">
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addRow()">+ Add row</button>
        </div>

        <p class="text-muted small mb-4">
          Add debit and credit lines that balance exactly (total debit = total credit). Leave unused rows blank. New vouchers require approval by a different user before they post to the ledger.
        </p>

        <div class="d-flex align-items-center gap-2">
          <button type="submit" class="btn btn-primary" [disabled]="submitting" style="background-color: #00796b; border-color: #00796b;">
            {{ submitting ? 'Submitting...' : 'Submit for approval' }}
          </button>
          <a routerLink="/vouchers" class="btn btn-link text-decoration-none">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class VoucherEntryComponent implements OnInit {
  voucherType: string = 'receipt';
  pageTitle: string = 'New Receipt';
  voucherDate: string = new Date().toISOString().slice(0, 10);
  narration: string = '';

  lines: VoucherLineRow[] = [
    { accountId: '', debit: null, credit: null },
    { accountId: '', debit: null, credit: null },
    { accountId: '', debit: null, credit: null }
  ];

  accounts: any[] = [];
  errorMessage: string = '';
  submitting: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const t = (params['type'] || 'receipt').toLowerCase();
      if (['receipt', 'payment', 'contra', 'journal'].includes(t)) {
        this.voucherType = t;
      }
      this.updateTitle();
    });
    this.loadAccounts();
  }

  updateTitle() {
    switch (this.voucherType) {
      case 'receipt': this.pageTitle = 'New Receipt'; break;
      case 'payment': this.pageTitle = 'New Payment'; break;
      case 'contra': this.pageTitle = 'New Contra'; break;
      case 'journal': this.pageTitle = 'New Journal'; break;
      default: this.pageTitle = 'New Voucher';
    }
  }

  onTypeChange() {
    this.updateTitle();
  }

  loadAccounts() {
    this.http.get<any>(`${environment.apiBaseUrl}/accounts?page=0&size=200`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.content) {
          this.accounts = res.data.content.map((a: any) => ({
            id: a.id,
            code: a.code,
            name: a.name
          }));
        }
      },
      error: () => {}
    });
  }

  onDebitChange(ln: VoucherLineRow) {
    if (ln.debit != null && ln.debit > 0) {
      ln.credit = null;
    }
  }

  onCreditChange(ln: VoucherLineRow) {
    if (ln.credit != null && ln.credit > 0) {
      ln.debit = null;
    }
  }

  addRow() {
    this.lines.push({ accountId: '', debit: null, credit: null });
  }

  removeRow(idx: number) {
    if (this.lines.length > 1) {
      this.lines.splice(idx, 1);
    } else {
      this.lines[0] = { accountId: '', debit: null, credit: null };
    }
  }

  onSubmit() {
    this.errorMessage = '';
    const activeLines = this.lines.filter(l => l.accountId && ((l.debit || 0) > 0 || (l.credit || 0) > 0));

    if (activeLines.length < 2) {
      this.errorMessage = 'Please enter at least two accounting lines (Debit and Credit).';
      return;
    }

    let totalDr = 0;
    let totalCr = 0;
    activeLines.forEach(l => {
      totalDr += Number(l.debit || 0);
      totalCr += Number(l.credit || 0);
    });

    if (Math.abs(totalDr - totalCr) > 0.01 || totalDr === 0) {
      this.errorMessage = `Voucher is not balanced. Total Debit ₹${totalDr.toFixed(2)} must equal Total Credit ₹${totalCr.toFixed(2)}.`;
      return;
    }

    this.submitting = true;
    const items = activeLines.map(l => {
      const isDr = (l.debit || 0) > 0;
      return {
        ledgerId: Number(l.accountId),
        entryType: isDr ? 'DEBIT' : 'CREDIT',
        amount: isDr ? l.debit : l.credit,
        lineNarration: this.narration
      };
    });

    this.http.post<any>(`${environment.apiBaseUrl}/vouchers`, {
      voucherType: this.voucherType.toUpperCase(),
      voucherDate: this.voucherDate,
      narration: this.narration,
      totalAmount: totalDr,
      items
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/vouchers']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to submit voucher.';
      }
    });
  }
}
