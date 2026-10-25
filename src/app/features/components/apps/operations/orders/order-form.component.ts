import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface OrderLineItem {
  itemId: string;
  qty: number | null;
  rate: number | null;
}

@Component({
  selector: 'app-order-form',
  template: `
    <div class="mb-3">
      <a [routerLink]="['/orders']" [queryParams]="{type: orderType}" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <h4 class="fw-bold mb-3">{{ orderType === 'purchase' ? 'New Purchase Order' : 'New Sales Order' }}</h4>

    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
      {{ errorMessage }}
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">{{ orderType === 'purchase' ? 'Vendor' : 'Customer' }} *</label>
            <select [(ngModel)]="order.partyId" name="partyId" class="form-select form-select-sm" required>
              <option value="">-- select --</option>
              <option *ngFor="let p of parties" [value]="p.id">{{ p.name }} ({{ p.stateCode || 'NA' }})</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Location (for goods lines)</label>
            <select [(ngModel)]="order.locationId" name="locationId" class="form-select form-select-sm">
              <option value="">-- select if goods involved --</option>
              <option *ngFor="let l of locations" [value]="l.id">{{ l.code }} - {{ l.name }}</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Order Date *</label>
            <input type="date" [(ngModel)]="order.orderDate" name="orderDate" class="form-control form-control-sm" required>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Expected Date</label>
            <input type="date" [(ngModel)]="order.expectedDate" name="expectedDate" class="form-control form-control-sm">
          </div>
        </div>
      </div>

      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 50%;">ITEM / SERVICE</th>
                <th style="width: 20%;">QTY</th>
                <th style="width: 25%;">RATE</th>
                <th style="width: 5%;"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ln of order.lines; let i = index">
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
          Orders don't post to the ledger or move stock — they're a commitment only. Use "Convert to Invoice" on the order once goods/services are actually delivered/received.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button type="submit" class="btn btn-primary" [disabled]="submitting" style="background-color: #00796b; border-color: #00796b;">
          {{ submitting ? 'Creating...' : 'Create Order' }}
        </button>
        <a [routerLink]="['/orders']" [queryParams]="{type: orderType}" class="btn btn-link text-decoration-none">Cancel</a>
      </div>
    </form>
  `
})
export class OrderFormComponent implements OnInit {
  orderType: string = 'purchase';

  order = {
    partyId: '',
    locationId: '',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDate: '',
    lines: [
      { itemId: '', qty: null, rate: null },
      { itemId: '', qty: null, rate: null },
      { itemId: '', qty: null, rate: null }
    ] as OrderLineItem[]
  };

  parties: any[] = [];
  locations: any[] = [];
  items: any[] = [];

  errorMessage: string = '';
  submitting: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderType = params['type'] === 'sales' ? 'sales' : 'purchase';
      this.loadMasterData();
    });
  }

  loadMasterData() {
    const pType = this.orderType === 'sales' ? 'customer' : 'vendor';
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

  onItemSelect(ln: OrderLineItem) {
    const it = this.items.find(x => String(x.id) === String(ln.itemId));
    if (it) {
      if (!ln.qty) ln.qty = 1;
      if (this.orderType === 'sales') {
        ln.rate = it.salePrice || it.rate || 0;
      } else {
        ln.rate = it.costPrice || it.rate || 0;
      }
    }
  }

  addLine() {
    this.order.lines.push({ itemId: '', qty: 1, rate: null });
  }

  removeLine(i: number) {
    if (this.order.lines.length > 1) {
      this.order.lines.splice(i, 1);
    } else {
      this.order.lines[0] = { itemId: '', qty: null, rate: null };
    }
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.order.partyId) {
      this.errorMessage = 'Please select ' + (this.orderType === 'sales' ? 'customer' : 'vendor') + '.';
      return;
    }
    const validLines = this.order.lines.filter(l => l.itemId && (l.qty || 0) > 0);
    if (!validLines.length) {
      this.errorMessage = 'Please add at least one line with item and quantity.';
      return;
    }

    this.submitting = true;
    this.http.post<any>(`${environment.apiBaseUrl}/orders`, {
      orderType: this.orderType,
      partyId: Number(this.order.partyId),
      locationId: this.order.locationId ? Number(this.order.locationId) : null,
      orderDate: this.order.orderDate,
      expectedDate: this.order.expectedDate,
      lines: validLines.map(l => ({
        itemId: Number(l.itemId),
        qty: l.qty,
        rate: l.rate || 0
      }))
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/orders'], { queryParams: { type: this.orderType } });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create order.';
      }
    });
  }
}
