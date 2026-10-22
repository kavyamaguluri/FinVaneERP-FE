import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface InvoiceRow {
  invoiceNo: string;
  date: string;
  party: string;
  location: string;
  taxable: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-invoices',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">{{ invoiceType === 'sales' ? 'Sales Invoices' : 'Purchase Invoices' }}</h3>
      </div>
      <div class="io-toolbar d-flex gap-2 align-items-center">
        <button type="button" class="btn btn-sm btn-outline-secondary" [class.active]="invoiceType === 'sales'" (click)="setType('sales')">Sales</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" [class.active]="invoiceType === 'purchase'" (click)="setType('purchase')">Purchase</button>
        <button *ngIf="invoiceType === 'purchase'" type="button" class="btn btn-sm btn-success">Upload Purchase Bills (Excel)</button>
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-primary btn-sm">+ New</button>
      </div>
    </div>

    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ currentList.length }} invoices</span>
        <button type="button" class="btn btn-outline-danger btn-sm">Delete All (this view)</button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr class="text-uppercase small fw-bold">
              <th>Invoice No.</th>
              <th>Date</th>
              <th>Party</th>
              <th>Location</th>
              <th class="text-end">Taxable</th>
              <th class="text-end">Tax</th>
              <th class="text-end">Total</th>
              <th>Status</th>
              <th>Date of Creation</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of currentList">
              <td class="fw-bold font-monospace text-teal" style="color: #0f766e;">{{ inv.invoiceNo }}</td>
              <td class="font-monospace small">{{ inv.date }}</td>
              <td class="fw-semibold">{{ inv.party }}</td>
              <td class="small">{{ inv.location }}</td>
              <td class="text-end font-monospace">&#8377;{{ inv.taxable | number:'1.2-2' }}</td>
              <td class="text-end font-monospace">&#8377;{{ inv.tax | number:'1.2-2' }}</td>
              <td class="text-end font-monospace fw-bold">&#8377;{{ inv.total | number:'1.2-2' }}</td>
              <td><span class="badge bg-success-subtle text-success-emphasis">{{ inv.status }}</span></td>
              <td class="small text-muted font-monospace">{{ inv.createdAt }}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary py-0">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InvoicesComponent implements OnInit {
  invoiceType: 'sales' | 'purchase' = 'sales';

  salesList: InvoiceRow[] = [
    { invoiceNo: 'INV-2026-001', date: '20-10-2026', party: 'Acme Retail Pvt Ltd', location: 'Mumbai Main Warehouse', taxable: 120000.00, tax: 21600.00, total: 141600.00, status: 'Posted', createdAt: '20-10-2026 14:30' },
    { invoiceNo: 'INV-2026-002', date: '21-10-2026', party: 'Acme Retail Pvt Ltd', location: 'Mumbai Main Warehouse', taxable: 45000.00, tax: 8100.00, total: 53100.00, status: 'Posted', createdAt: '21-10-2026 11:15' }
  ];

  purchaseList: InvoiceRow[] = [
    { invoiceNo: 'PB-2026-001', date: '18-10-2026', party: 'Bright Supplies Co', location: 'Mumbai Main Warehouse', taxable: 85000.00, tax: 15300.00, total: 100300.00, status: 'Posted', createdAt: '18-10-2026 16:45' }
  ];

  get currentList(): InvoiceRow[] {
    return this.invoiceType === 'sales' ? this.salesList : this.purchaseList;
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'purchase') {
        this.invoiceType = 'purchase';
      } else {
        this.invoiceType = 'sales';
      }
    });
  }

  setType(t: 'sales' | 'purchase') {
    this.invoiceType = t;
  }
}
