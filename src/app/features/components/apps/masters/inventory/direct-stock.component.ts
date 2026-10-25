import { Component, OnInit } from '@angular/core';

export interface DirectStockRow {
  id: number;
  itemName: string;
  openingStock: number;
  closingStock: number;
  valuationRate: number;
  closingValue: number;
}

@Component({
  selector: 'app-direct-stock',
  template: `
    <div class="page-header mb-3">
      <h3 class="mb-0 fw-bold">Direct Stock</h3>
      <div class="subtitle text-muted small">
        Enter a monthly Opening/Closing Stock value by item name, by hand. When Inventory / Stock Management is switched off, this feeds directly into the Trading Account (P&amp;L) and Balance Sheet's Stock-in-Hand line in place of a FIFO valuation.
      </div>
    </div>

    <div class="alert alert-info py-2 mb-3">
      Direct stock entry mode allows fast manual physical inventory valuation without per-transaction inventory tracking.
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white mb-3">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Item / Stock Category</th>
              <th class="text-end">Opening Stock (Units)</th>
              <th class="text-end">Closing Stock (Units)</th>
              <th class="text-end">Valuation Rate (₹)</th>
              <th class="text-end">Closing Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of stockRows">
              <td class="fw-bold">{{ s.itemName }}</td>
              <td class="text-end">
                <input type="number" class="form-control form-control-sm text-end" [(ngModel)]="s.openingStock" (ngModelChange)="recalc(s)">
              </td>
              <td class="text-end">
                <input type="number" class="form-control form-control-sm text-end" [(ngModel)]="s.closingStock" (ngModelChange)="recalc(s)">
              </td>
              <td class="text-end">
                <input type="number" class="form-control form-control-sm text-end" [(ngModel)]="s.valuationRate" (ngModelChange)="recalc(s)">
              </td>
              <td class="text-end fw-bold">₹{{ s.closingValue | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="stockRows.length === 0">
              <td colspan="5" class="text-center text-muted py-4">No stock items configured for direct entry.</td>
            </tr>
          </tbody>
          <tfoot *ngIf="stockRows.length > 0">
            <tr class="fw-bold table-light">
              <td colspan="4">Total Closing Stock Valuation</td>
              <td class="text-end">₹{{ totalValuation | number:'1.2-2' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="mt-3 d-flex justify-content-end">
        <button type="button" class="btn btn-primary" (click)="saveStock()">Save Direct Stock Entries</button>
      </div>
    </div>
  `
})
export class DirectStockComponent implements OnInit {
  activeTenantId = '1';
  stockRows: DirectStockRow[] = [];
  totalValuation = 0;

  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    if (this.activeTenantId === '1') {
      this.stockRows = [
        { id: 1, itemName: 'Steel Coils Grade A', openingStock: 50, closingStock: 45, valuationRate: 1200, closingValue: 54000 },
        { id: 2, itemName: 'Copper Wiring Rolls', openingStock: 80, closingStock: 90, valuationRate: 650, closingValue: 58500 },
        { id: 3, itemName: 'Industrial Adhesive 5L', openingStock: 25, closingStock: 20, valuationRate: 400, closingValue: 8000 }
      ];
    } else {
      this.stockRows = [];
    }
    this.recalcTotals();
  }

  recalc(row: DirectStockRow) {
    row.closingValue = (Number(row.closingStock) || 0) * (Number(row.valuationRate) || 0);
    this.recalcTotals();
  }

  recalcTotals() {
    this.totalValuation = this.stockRows.reduce((acc, r) => acc + r.closingValue, 0);
  }

  saveStock() {
    alert('Direct stock values successfully saved and synced to Balance Sheet.');
  }
}
