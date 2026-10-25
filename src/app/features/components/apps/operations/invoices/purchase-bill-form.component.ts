import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface BillLine {
  desc: string;
  hsn: string;
  qty: number | null;
  rate: number | null;
  discount: number;
  gstPct: number;
  gstLedger: string;
  ledgerName: string;
  rcm: string;
  isImport: string;
  itc: string;
}

@Component({
  selector: 'app-purchase-bill-form',
  template: `
    <div class="mb-3">
      <a routerLink="/purchase-bills" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <h4 class="fw-bold mb-3">New purchase bill</h4>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Vendor *</label>
            <select [(ngModel)]="bill.partyId" name="partyId" class="form-select form-select-sm" required>
              <option value="">-- select vendor --</option>
              <option *ngFor="let v of vendors" [value]="v.id">{{ v.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Bill No *</label>
            <input type="text" [(ngModel)]="bill.billNo" name="billNo" class="form-control form-control-sm" placeholder="e.g. INV-9821" required>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Bill Date *</label>
            <input type="date" [(ngModel)]="bill.billDate" name="billDate" class="form-control form-control-sm" required>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Due Date</label>
            <input type="date" [(ngModel)]="bill.dueDate" name="dueDate" class="form-control form-control-sm">
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Narration</label>
            <input type="text" [(ngModel)]="bill.narration" name="narration" class="form-control form-control-sm" placeholder="Optional notes about this bill">
          </div>
        </div>
      </div>

      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="table-responsive" style="overflow-x:auto;">
          <table class="table table-sm align-middle" style="min-width:1400px">
            <thead class="table-light">
              <tr>
                <th style="min-width:200px">Description</th>
                <th style="width:100px">HSN/SAC</th>
                <th style="width:90px">Qty</th>
                <th style="width:120px">Rate</th>
                <th style="width:110px">Discount ₹</th>
                <th style="width:85px">GST %</th>
                <th style="width:180px">GST Ledger</th>
                <th style="width:230px">Expense / Asset Ledger</th>
                <th style="width:90px">RCM</th>
                <th style="width:90px">Import</th>
                <th style="width:220px">ITC Eligibility</th>
                <th style="width:40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of bill.lines; let i = index">
                <td><input [(ngModel)]="l.desc" [name]="'desc_' + i" class="form-control form-control-sm" placeholder="Line description"></td>
                <td><input [(ngModel)]="l.hsn" [name]="'hsn_' + i" class="form-control form-control-sm" placeholder="e.g. 9983"></td>
                <td><input type="number" step="0.01" [(ngModel)]="l.qty" [name]="'qty_' + i" class="form-control form-control-sm"></td>
                <td><input type="number" step="0.01" [(ngModel)]="l.rate" [name]="'rate_' + i" class="form-control form-control-sm"></td>
                <td><input type="number" step="0.01" [(ngModel)]="l.discount" [name]="'disc_' + i" class="form-control form-control-sm"></td>
                <td>
                  <select [(ngModel)]="l.gstPct" [name]="'gst_' + i" class="form-select form-select-sm">
                    <option *ngFor="let g of gstRates" [value]="g">{{ g }}%</option>
                  </select>
                </td>
                <td>
                  <select [(ngModel)]="l.gstLedger" [name]="'gl_' + i" class="form-select form-select-sm">
                    <option *ngFor="let o of gstOptions" [value]="o">{{ o }}</option>
                  </select>
                </td>
                <td>
                  <select [(ngModel)]="l.ledgerName" [name]="'ledger_' + i" class="form-select form-select-sm">
                    <option value="">Choose…</option>
                    <option *ngFor="let x of ledgers" [value]="x.name">{{ x.name }}</option>
                  </select>
                </td>
                <td>
                  <select [(ngModel)]="l.rcm" [name]="'rcm_' + i" class="form-select form-select-sm">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>
                <td>
                  <select [(ngModel)]="l.isImport" [name]="'imp_' + i" class="form-select form-select-sm">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>
                <td>
                  <select [(ngModel)]="l.itc" [name]="'itc_' + i" class="form-select form-select-sm">
                    <option *ngFor="let o of itcOptions" [value]="o">{{ o }}</option>
                  </select>
                </td>
                <td class="text-center">
                  <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="removeRow(i)" title="Remove this row">&times;</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-2 mb-3">
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addRow()">+ Add row</button>
        </div>

        <div class="small text-muted" style="line-height: 1.6;">
          <b>RCM = Yes</b>: you pay the GST under reverse charge — the vendor is credited only the taxable value and the GST goes to "… Payable under RCM". <b>Import = Yes</b>: IGST applies and goes to "IGST Payable under RCM / Import". <b>ITC Ineligible</b>: the bill posts normally; then use "Create ITC journal" on the bill page to move the GST to the expense / asset. Choose a Fixed Asset ledger for capital purchases.
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button type="submit" class="btn btn-primary" [disabled]="submitting" style="background-color: #00796b; border-color: #00796b;">
          {{ submitting ? 'Posting...' : 'Post bill' }}
        </button>
        <a routerLink="/purchase-bills" class="btn btn-link text-decoration-none">Cancel</a>
      </div>
    </form>
  `
})
export class PurchaseBillFormComponent implements OnInit {
  bill: {
    partyId: string;
    billNo: string;
    billDate: string;
    dueDate: string;
    narration: string;
    lines: BillLine[];
  } = {
    partyId: '',
    billNo: '',
    billDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    narration: '',
    lines: [
      { desc: '', hsn: '', qty: 1, rate: null, discount: 0, gstPct: 18, gstLedger: 'Auto (by vendor state)', ledgerName: '', rcm: 'No', isImport: 'No', itc: 'Eligible' }
    ]
  };

  vendors: any[] = [];
  ledgers: any[] = [];
  gstRates: number[] = [0, 0.1, 0.25, 1.5, 3, 5, 12, 18, 28];
  gstOptions: string[] = ['Auto (by vendor state)', 'Input CGST + SGST', 'Input IGST', 'No GST / Exempt'];
  itcOptions: string[] = [
    'Eligible',
    'Ineligible - Sec 17(5) blocked credit',
    'Ineligible - exempt / non-business use',
    'Ineligible - other'
  ];

  errorMessage: string = '';
  submitting: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiBaseUrl}/purchase-bills/meta`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.vendors = res.data.vendors || [];
          this.ledgers = res.data.ledgers || [];
        }
      },
      error: () => {}
    });
  }

  addRow() {
    this.bill.lines.push({
      desc: '', hsn: '', qty: 1, rate: null, discount: 0, gstPct: 18,
      gstLedger: 'Auto (by vendor state)', ledgerName: '', rcm: 'No', isImport: 'No', itc: 'Eligible'
    });
  }

  removeRow(idx: number) {
    if (this.bill.lines.length > 1) {
      this.bill.lines.splice(idx, 1);
    } else {
      this.bill.lines[0] = {
        desc: '', hsn: '', qty: 1, rate: null, discount: 0, gstPct: 18,
        gstLedger: 'Auto (by vendor state)', ledgerName: '', rcm: 'No', isImport: 'No', itc: 'Eligible'
      };
    }
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.bill.partyId) {
      this.errorMessage = 'Choose the vendor.';
      return;
    }
    if (!this.bill.billNo || !this.bill.billDate) {
      this.errorMessage = 'Bill No and Bill Date are required.';
      return;
    }
    const validLines = this.bill.lines.filter(l => (l.qty || 0) > 0 || (l.rate || 0) > 0);
    if (!validLines.length) {
      this.errorMessage = 'Add at least one line with quantity and rate.';
      return;
    }

    this.submitting = true;
    this.http.post<any>(`${environment.apiBaseUrl}/purchase-bills`, {
      partyId: Number(this.bill.partyId),
      billNo: this.bill.billNo,
      billDate: this.bill.billDate,
      dueDate: this.bill.dueDate,
      narration: this.bill.narration,
      lines: validLines
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/invoices'], { queryParams: { type: 'purchase' } });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to post purchase bill.';
      }
    });
  }
}
