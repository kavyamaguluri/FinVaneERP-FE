import { Component, OnInit } from '@angular/core';

export interface ProductionOrder {
  id: number;
  orderNo: string;
  productName: string;
  qtyTarget: number;
  qtyCompleted: number;
  startDate: string;
  status: 'planned' | 'in_progress' | 'completed';
}

@Component({
  selector: 'app-production',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Production</h3>
        <div class="subtitle text-muted small">Raw material &rarr; WIP &rarr; Finished goods, costed at every step</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm">Raw Materials</button>
        <button type="button" class="btn btn-outline-secondary btn-sm">Bills of Material</button>
        <button type="button" class="btn btn-outline-secondary btn-sm">Product Profitability</button>
        <button type="button" class="btn btn-primary btn-sm">+ New Production Order</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Finished Product</th>
              <th class="text-end">Target Qty</th>
              <th class="text-end">Completed Qty</th>
              <th>Start Date</th>
              <th>Status</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of productionOrders">
              <td class="fw-bold font-monospace text-brand">{{ p.orderNo }}</td>
              <td>{{ p.productName }}</td>
              <td class="text-end">{{ p.qtyTarget }}</td>
              <td class="text-end fw-semibold">{{ p.qtyCompleted }}</td>
              <td>{{ p.startDate }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'bg-success-subtle text-success-emphasis': p.status === 'completed',
                  'bg-info-subtle text-info-emphasis': p.status === 'in_progress',
                  'bg-secondary-subtle text-secondary-emphasis': p.status === 'planned'
                }">
                  {{ p.status === 'in_progress' ? 'In Progress' : (p.status | titlecase) }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">View Run</button>
                <button *ngIf="p.status === 'in_progress'" type="button" class="btn btn-sm btn-outline-success">Complete Batch</button>
              </td>
            </tr>
            <tr *ngIf="productionOrders.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No production orders recorded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ProductionComponent implements OnInit {
  activeTenantId = '1';
  productionOrders: ProductionOrder[] = [];

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '1') {
      this.productionOrders = [
        { id: 1, orderNo: 'PRD-2026-001', productName: 'Electric Motor Assembly 5HP', qtyTarget: 50, qtyCompleted: 50, startDate: '2026-10-05', status: 'completed' },
        { id: 2, orderNo: 'PRD-2026-002', productName: 'Submersible Pump Unit 2HP', qtyTarget: 30, qtyCompleted: 18, startDate: '2026-10-18', status: 'in_progress' }
      ];
    } else {
      this.productionOrders = [];
    }
  }
}
