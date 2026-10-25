import { Component, OnInit } from '@angular/core';

export interface QuotationRow {
  id: number;
  quotationNo: string;
  quotationDate: string;
  customerName: string;
  validUntil: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';
}

@Component({
  selector: 'app-quotations',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Sales Quotations</h3>
        <div class="subtitle text-muted small">Priced offers to customers. A quotation is not a tax invoice and posts nothing to your books until it is converted.</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-primary btn-sm" (click)="showNewModal = true">+ New Quotation</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Quotation No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Valid until</th>
              <th class="text-end">Total</th>
              <th>Status</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let q of quotations">
              <td class="fw-bold font-monospace text-brand">{{ q.quotationNo }}</td>
              <td>{{ q.quotationDate }}</td>
              <td>{{ q.customerName }}</td>
              <td>{{ q.validUntil }}</td>
              <td class="text-end fw-semibold">₹{{ q.totalAmount | number:'1.2-2' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'bg-success-subtle text-success-emphasis': q.status === 'accepted' || q.status === 'converted',
                  'bg-warning-subtle text-warning-emphasis': q.status === 'draft',
                  'bg-info-subtle text-info-emphasis': q.status === 'sent',
                  'bg-danger-subtle text-danger-emphasis': q.status === 'declined'
                }">
                  {{ q.status | titlecase }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">View</button>
                <button type="button" class="btn btn-sm btn-outline-primary me-1">Convert to Invoice</button>
              </td>
            </tr>
            <tr *ngIf="quotations.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No quotations recorded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for New Quotation -->
    <p-dialog header="New Quotation" [(visible)]="showNewModal" [modal]="true" [style]="{width: '500px'}">
      <div class="mb-3">
        <label class="form-label small fw-semibold text-muted">Customer</label>
        <input type="text" class="form-control" [(ngModel)]="newQuotation.customerName" placeholder="Customer Name">
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold text-muted">Valid Until</label>
        <input type="date" class="form-control" [(ngModel)]="newQuotation.validUntil">
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold text-muted">Estimated Total (₹)</label>
        <input type="number" class="form-control" [(ngModel)]="newQuotation.totalAmount" placeholder="0.00">
      </div>
      <ng-template pTemplate="footer">
        <button class="btn btn-outline-secondary btn-sm" (click)="showNewModal = false">Cancel</button>
        <button class="btn btn-primary btn-sm" (click)="saveQuotation()">Save Quotation</button>
      </ng-template>
    </p-dialog>
  `
})
export class QuotationsComponent implements OnInit {
  activeTenantId = '1';
  quotations: QuotationRow[] = [];
  showNewModal = false;
  newQuotation: Partial<QuotationRow> = {};

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '1') {
      this.quotations = [
        { id: 1, quotationNo: 'QT-2026-001', quotationDate: '2026-10-10', customerName: 'Zenith Retailers', validUntil: '2026-11-10', totalAmount: 85000, status: 'sent' },
        { id: 2, quotationNo: 'QT-2026-002', quotationDate: '2026-10-15', customerName: 'Apex Distributors', validUntil: '2026-11-15', totalAmount: 142000, status: 'accepted' }
      ];
    } else {
      this.quotations = [];
    }
  }

  saveQuotation() {
    if (!this.newQuotation.customerName) return;
    this.quotations.push({
      id: Date.now(),
      quotationNo: `QT-2026-${String(this.quotations.length + 1).padStart(3, '0')}`,
      quotationDate: new Date().toISOString().slice(0, 10),
      customerName: this.newQuotation.customerName,
      validUntil: this.newQuotation.validUntil || '2026-11-30',
      totalAmount: this.newQuotation.totalAmount || 0,
      status: 'draft'
    });
    this.showNewModal = false;
    this.newQuotation = {};
  }
}
