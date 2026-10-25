import { Component, OnInit } from '@angular/core';

export interface OrderRow {
  id: number;
  orderNo: string;
  orderDate: string;
  partyName: string;
  expectedDate: string;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';
  orderType: 'sales' | 'purchase';
}

@Component({
  selector: 'app-orders',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">{{ orderType === 'sales' ? 'Sales Orders' : 'Purchase Orders' }}</h3>
        <div class="subtitle text-muted small">
          {{ orderType === 'sales' ? 'Customer orders awaiting fulfillment and invoicing' : 'Vendor purchase orders awaiting receipt and bills' }}
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          [class.active]="orderType === 'sales'"
          (click)="setOrderType('sales')"
        >
          Sales Orders
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          [class.active]="orderType === 'purchase'"
          (click)="setOrderType('purchase')"
        >
          Purchase Orders
        </button>
        <a [routerLink]="['/orders/new']" [queryParams]="{type: orderType}" class="btn btn-primary btn-sm" style="background-color: #00796b; border-color: #00796b;">+ New {{ orderType === 'sales' ? 'Sales Order' : 'PO' }}</a>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Date</th>
              <th>{{ orderType === 'sales' ? 'Customer' : 'Vendor' }}</th>
              <th>Expected Date</th>
              <th class="text-end">Total</th>
              <th>Status</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of filteredOrders">
              <td class="fw-bold font-monospace text-brand">{{ o.orderNo }}</td>
              <td>{{ o.orderDate }}</td>
              <td>{{ o.partyName }}</td>
              <td>{{ o.expectedDate }}</td>
              <td class="text-end fw-semibold">₹{{ o.totalAmount | number:'1.2-2' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'bg-success-subtle text-success-emphasis': o.status === 'confirmed' || o.status === 'fulfilled',
                  'bg-warning-subtle text-warning-emphasis': o.status === 'draft',
                  'bg-danger-subtle text-danger-emphasis': o.status === 'cancelled'
                }">
                  {{ o.status | titlecase }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">View</button>
                <button *ngIf="o.status === 'confirmed'" type="button" class="btn btn-sm btn-outline-primary">Generate Invoice</button>
              </td>
            </tr>
            <tr *ngIf="filteredOrders.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No orders recorded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for New Order -->
    <p-dialog [header]="'New ' + (orderType === 'sales' ? 'Sales Order' : 'Purchase Order')" [(visible)]="showNewModal" [modal]="true" [style]="{width: '500px'}">
      <div class="mb-3">
        <label class="form-label small fw-semibold text-muted">{{ orderType === 'sales' ? 'Customer' : 'Vendor' }}</label>
        <input type="text" class="form-control" [(ngModel)]="newOrder.partyName" placeholder="Party Name">
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold text-muted">Expected Delivery Date</label>
        <input type="date" class="form-control" [(ngModel)]="newOrder.expectedDate">
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold text-muted">Total Amount (₹)</label>
        <input type="number" class="form-control" [(ngModel)]="newOrder.totalAmount" placeholder="0.00">
      </div>
      <ng-template pTemplate="footer">
        <button class="btn btn-outline-secondary btn-sm" (click)="showNewModal = false">Cancel</button>
        <button class="btn btn-primary btn-sm" (click)="saveOrder()">Save Order</button>
      </ng-template>
    </p-dialog>
  `
})
export class OrdersComponent implements OnInit {
  orderType: 'sales' | 'purchase' = 'sales';
  activeTenantId = '1';
  orders: OrderRow[] = [];
  showNewModal = false;
  newOrder: Partial<OrderRow> = {};

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '1') {
      this.orders = [
        { id: 1, orderNo: 'SO-2026-001', orderDate: '2026-10-12', partyName: 'Metro Enterprise', expectedDate: '2026-10-28', totalAmount: 125000, status: 'confirmed', orderType: 'sales' },
        { id: 2, orderNo: 'PO-2026-001', orderDate: '2026-10-14', partyName: 'Bharat Raw Materials', expectedDate: '2026-10-25', totalAmount: 76000, status: 'confirmed', orderType: 'purchase' }
      ];
    } else {
      this.orders = [];
    }
  }

  get filteredOrders(): OrderRow[] {
    return this.orders.filter(o => o.orderType === this.orderType);
  }

  setOrderType(t: 'sales' | 'purchase') {
    this.orderType = t;
  }

  saveOrder() {
    if (!this.newOrder.partyName) return;
    this.orders.push({
      id: Date.now(),
      orderNo: `${this.orderType === 'sales' ? 'SO' : 'PO'}-2026-${String(this.orders.length + 1).padStart(3, '0')}`,
      orderDate: new Date().toISOString().slice(0, 10),
      partyName: this.newOrder.partyName,
      expectedDate: this.newOrder.expectedDate || '2026-11-15',
      totalAmount: this.newOrder.totalAmount || 0,
      status: 'confirmed',
      orderType: this.orderType
    });
    this.showNewModal = false;
    this.newOrder = {};
  }
}
