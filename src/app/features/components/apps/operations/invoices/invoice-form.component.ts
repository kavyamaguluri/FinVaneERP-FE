import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface InvLine {
  itemId: string;
  qty: number | null;
  rate: number | null;
}

@Component({
  selector: 'app-invoice-form',
  template: `
    <div class="mb-3">
      <a [routerLink]="['/invoices']" [queryParams]="{type: invoiceType}" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">{{ invoiceType === 'sales' ? 'New Sales Invoice' : 'New Purchase Invoice' }}</h4>
      <a *ngIf="invoiceType === 'sales'" routerLink="/quotations" class="btn btn-sm btn-outline-primary">
        Create from a Sales Quotation
      </a>
    </div>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">{{ invoiceType === 'sales' ? 'Customer' : 'Vendor' }} *</label>
            <div class="d-flex gap-1">
              <select [(ngModel)]="invoice.partyId" name="partyId" class="form-select form-select-sm" required>
                <option value="">-- select --</option>
                <option *ngFor="let p of parties" [value]="p.id">{{ p.name }} ({{ p.stateCode || 'NA' }})</option>
              </select>
              <button type="button" class="btn btn-sm btn-outline-primary px-2" (click)="showQuickAdd = true" [title]="'Add ' + (invoiceType === 'sales' ? 'Customer' : 'Vendor')">+</button>
            </div>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Location (for goods lines)</label>
            <select [(ngModel)]="invoice.locationId" name="locationId" class="form-select form-select-sm">
              <option value="">-- select if goods involved --</option>
              <option *ngFor="let l of locations" [value]="l.id">{{ l.code }} - {{ l.name }}</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Invoice Date *</label>
            <input type="date" [(ngModel)]="invoice.invoiceDate" name="invoiceDate" class="form-control form-control-sm" required>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Due Date</label>
            <input type="date" [(ngModel)]="invoice.dueDate" name="dueDate" class="form-control form-control-sm">
            <div class="form-text text-muted" style="font-size:0.75rem;">Blank = due on the invoice date.</div>
          </div>
        </div>
      </div>

      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 50%;">Item / Service</th>
                <th style="width: 20%;">Qty</th>
                <th style="width: 25%;">Rate</th>
                <th style="width: 5%;"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ln of invoice.lines; let i = index">
                <td>
                  <select [(ngModel)]="ln.itemId" [name]="'item_' + i" class="form-select form-select-sm" (change)="onItemSelect(ln)">
                    <option value="">-- select --</option>
                    <option *ngFor="let it of items" [value]="it.id">
                      {{ it.name }} [{{ it.itemType }}] {{ it.gstRate ? '(GST ' + it.gstRate + '%)' : '' }}
                    </option>
                  </select>
                </td>
                <td>
                  <input type="number" step="0.01" [(ngModel)]="ln.qty" [name]="'qty_' + i" class="form-control form-control-sm" placeholder="1.00">
                </td>
                <td>
                  <input type="number" step="0.01" [(ngModel)]="ln.rate" [name]="'rate_' + i" class="form-control form-control-sm" placeholder="0.00">
                </td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="removeLine(i)">&times;</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 mb-2">
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addLine()">+ Add row</button>
        </div>

        <p class="text-muted small mb-0">
          GST is split automatically as CGST+SGST (intra-state) or IGST (inter-state) based on the party's state. Goods lines move stock at the selected location and require it to be set; service lines don't need a location.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button type="submit" class="btn btn-primary" [disabled]="submitting" style="background-color: #00796b; border-color: #00796b;">
          {{ submitting ? 'Creating...' : 'Create Invoice' }}
        </button>
        <a [routerLink]="['/invoices']" [queryParams]="{type: invoiceType}" class="btn btn-link text-decoration-none">Cancel</a>
      </div>
    </form>

    <!-- Quick Add Party Modal -->
    <div *ngIf="showQuickAdd" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add {{ invoiceType === 'sales' ? 'Customer' : 'Vendor' }}</h5>
            <button type="button" class="btn-close" (click)="showQuickAdd = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2">
              <div class="col-12">
                <label class="form-label small fw-semibold">Name *</label>
                <input [(ngModel)]="newParty.name" class="form-control form-control-sm" placeholder="Business or personal name" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">GSTIN</label>
                <input [(ngModel)]="newParty.gstin" class="form-control form-control-sm text-uppercase" placeholder="15-char GSTIN">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">State Code</label>
                <input [(ngModel)]="newParty.stateCode" class="form-control form-control-sm" placeholder="e.g. 27">
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Address</label>
                <input [(ngModel)]="newParty.address" class="form-control form-control-sm" placeholder="Billing address">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showQuickAdd = false">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" (click)="saveQuickParty()">Save &amp; Select</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceFormComponent implements OnInit {
  invoiceType: string = 'sales';

  invoice = {
    partyId: '',
    locationId: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    lines: [
      { itemId: '', qty: 1, rate: null },
      { itemId: '', qty: null, rate: null },
      { itemId: '', qty: null, rate: null }
    ] as InvLine[]
  };

  parties: any[] = [];
  locations: any[] = [];
  items: any[] = [];

  showQuickAdd: boolean = false;
  newParty = { name: '', gstin: '', stateCode: '27', address: '' };

  errorMessage: string = '';
  submitting: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.invoiceType = params['type'] === 'purchase' ? 'purchase' : 'sales';
      this.loadMasterData();
    });
  }

  loadMasterData() {
    const pType = this.invoiceType === 'sales' ? 'customer' : 'vendor';
    this.http.get<any>(`${environment.apiBaseUrl}/parties?type=${pType}`).subscribe({
      next: (res) => { if (res && res.data) this.parties = res.data; },
      error: () => {}
    });

    this.http.get<any>(`${environment.apiBaseUrl}/locations`).subscribe({
      next: (res) => { if (res && res.data) this.locations = res.data; },
      error: () => {}
    });

    this.http.get<any>(`${environment.apiBaseUrl}/inventory`).subscribe({
      next: (res) => { if (res && res.data) this.items = res.data; },
      error: () => {}
    });
  }

  onItemSelect(ln: InvLine) {
    const it = this.items.find(x => String(x.id) === String(ln.itemId));
    if (it) {
      if (!ln.qty) ln.qty = 1;
      if (this.invoiceType === 'sales') {
        ln.rate = it.salePrice || it.rate || 0;
      } else {
        ln.rate = it.costPrice || it.rate || 0;
      }
    }
  }

  addLine() {
    this.invoice.lines.push({ itemId: '', qty: 1, rate: null });
  }

  removeLine(i: number) {
    if (this.invoice.lines.length > 1) {
      this.invoice.lines.splice(i, 1);
    } else {
      this.invoice.lines[0] = { itemId: '', qty: null, rate: null };
    }
  }

  saveQuickParty() {
    if (!this.newParty.name) {
      alert('Please enter party name.');
      return;
    }
    const pType = this.invoiceType === 'sales' ? 'customer' : 'vendor';
    this.http.post<any>(`${environment.apiBaseUrl}/parties`, {
      name: this.newParty.name,
      partyType: pType,
      gstin: this.newParty.gstin,
      stateCode: this.newParty.stateCode,
      address: this.newParty.address
    }).subscribe({
      next: (res) => {
        this.showQuickAdd = false;
        const created = res.data || { id: Date.now(), name: this.newParty.name, stateCode: this.newParty.stateCode };
        this.parties.push(created);
        this.invoice.partyId = String(created.id);
        this.newParty = { name: '', gstin: '', stateCode: '27', address: '' };
      },
      error: () => {
        this.showQuickAdd = false;
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.invoice.partyId) {
      this.errorMessage = 'Please select ' + (this.invoiceType === 'sales' ? 'customer' : 'vendor') + '.';
      return;
    }
    const validLines = this.invoice.lines.filter(l => l.itemId && (l.qty || 0) > 0);
    if (!validLines.length) {
      this.errorMessage = 'Please add at least one line with valid item and quantity.';
      return;
    }

    this.submitting = true;
    this.http.post<any>(`${environment.apiBaseUrl}/invoices`, {
      invoiceType: this.invoiceType,
      partyId: Number(this.invoice.partyId),
      locationId: this.invoice.locationId ? Number(this.invoice.locationId) : null,
      invoiceDate: this.invoice.invoiceDate,
      dueDate: this.invoice.dueDate,
      lines: validLines.map(l => ({
        itemId: Number(l.itemId),
        qty: l.qty,
        rate: l.rate || 0
      }))
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/invoices'], { queryParams: { type: this.invoiceType } });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create invoice.';
      }
    });
  }
}
