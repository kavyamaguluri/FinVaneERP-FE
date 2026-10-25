import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface DirectStockEntry {
  id?: number;
  itemName: string;
  month: number;
  year: number;
  openingQty?: number;
  openingValue: number;
  closingQty?: number;
  closingValue: number;
  notes?: string;
}

export interface MonthGroup {
  periodMonth: number;
  periodYear: number;
  openingTotal: number;
  closingTotal: number;
  items: DirectStockEntry[];
}

@Component({
  selector: 'app-direct-stock',
  template: `
    <!-- Page Header matching Express views/inventory/direct_stock.ejs exactly -->
    <div class="page-header mb-3">
      <div>
        <h3 class="mb-0 fw-bold text-dark" style="font-size: 1.45rem;">Direct Stock</h3>
        <div class="text-secondary small" style="line-height: 1.45;">
          Enter a monthly Opening/Closing Stock value by item name, by hand. When Inventory / Stock Management is switched off, this feeds directly into the Trading Account (P&amp;L) and Balance Sheet's Stock-in-Hand line in place of a FIFO valuation.
        </div>
      </div>
    </div>

    <!-- Alert banner matching Express -->
    <div class="alert alert-warning py-2 mb-3" style="background-color: #fff3cd; border-color: #ffecb5; color: #664d03; font-size: 0.875rem;">
      <i class="bi bi-exclamation-triangle me-1"></i>
      Inventory / Stock Management is currently <strong>on</strong> for this business, so the entries below are kept for reference only -- the Trading Account and Balance Sheet use item-transaction-based stock values instead, not these figures. Turn Inventory off on <a routerLink="/accounts" class="alert-link text-decoration-underline">Chart of Accounts</a> if you want these monthly entries to drive the Stock-in-Hand figure in reports.
    </div>

    <!-- Add an Entry Card matching Express -->
    <div class="card p-3 mb-3 border bg-white shadow-sm">
      <h6 class="fw-semibold text-dark mb-2" style="font-size: 0.95rem;">Add an Entry</h6>
      <form class="row g-2 align-items-end" (ngSubmit)="addEntry()">
        <div class="col-md-3">
          <label class="form-label small mb-1">Item Name *</label>
          <input type="text" [(ngModel)]="newEntry.itemName" name="itemName" class="form-control form-control-sm" required>
        </div>
        <div class="col-md-2">
          <label class="form-label small mb-1">Month *</label>
          <select [(ngModel)]="newEntry.month" name="month" class="form-select form-select-sm" required>
            <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
          </select>
        </div>
        <div class="col-md-1">
          <label class="form-label small mb-1">Year *</label>
          <input type="number" [(ngModel)]="newEntry.year" name="year" class="form-control form-control-sm" required>
        </div>
        <div class="col-md-1">
          <label class="form-label small mb-1">Opening Qty</label>
          <input type="number" step="0.01" [(ngModel)]="newEntry.openingQty" name="openingQty" class="form-control form-control-sm">
        </div>
        <div class="col-md-2">
          <label class="form-label small mb-1">Opening Value (₹) *</label>
          <input type="number" step="0.01" [(ngModel)]="newEntry.openingValue" name="openingValue" class="form-control form-control-sm" required>
        </div>
        <div class="col-md-1">
          <label class="form-label small mb-1">Closing Qty</label>
          <input type="number" step="0.01" [(ngModel)]="newEntry.closingQty" name="closingQty" class="form-control form-control-sm">
        </div>
        <div class="col-md-2">
          <label class="form-label small mb-1">Closing Value (₹) *</label>
          <input type="number" step="0.01" [(ngModel)]="newEntry.closingValue" name="closingValue" class="form-control form-control-sm" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small mb-1">Notes</label>
          <input type="text" [(ngModel)]="newEntry.notes" name="notes" class="form-control form-control-sm" placeholder="Optional">
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-sm btn-primary w-100" style="background-color: #00796b; border-color: #00796b;">Add Entry</button>
        </div>
      </form>
    </div>

    <!-- Month Group Cards (if any) -->
    <div *ngFor="let g of monthGroups" class="card p-3 mb-3 border bg-white shadow-sm">
      <h6 class="fw-semibold text-dark mb-2">
        {{ months[g.periodMonth - 1] }} {{ g.periodYear }}
        <span class="text-muted small">— Opening: {{ formatAmount(g.openingTotal) }} &nbsp; Closing: {{ formatAmount(g.closingTotal) }}</span>
      </h6>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Item Name</th>
              <th class="text-end">Opening Qty</th>
              <th class="text-end">Opening Value</th>
              <th class="text-end">Closing Qty</th>
              <th class="text-end">Closing Value</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of g.items">
              <td>{{ e.itemName }}</td>
              <td class="text-end font-monospace">{{ e.openingQty != null ? e.openingQty : '—' }}</td>
              <td class="text-end font-monospace">{{ formatAmount(e.openingValue) }}</td>
              <td class="text-end font-monospace">{{ e.closingQty != null ? e.closingQty : '—' }}</td>
              <td class="text-end font-monospace">{{ formatAmount(e.closingValue) }}</td>
              <td class="text-muted small">{{ e.notes || '' }}</td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteEntry(e.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state matching Express exactly -->
    <div *ngIf="monthGroups.length === 0" class="alert alert-info py-2" style="background-color: #cff4fc; border-color: #b6effb; color: #055160; font-size: 0.875rem;">
      No Direct Stock entries yet. Add one above for each month you want reflected in the Trading Account and Balance Sheet.
    </div>
`,
  styles: [`
    .table td, .table th {
      padding: 0.45rem 0.6rem;
      font-size: 0.875rem;
    }
  `]
})
export class DirectStockComponent implements OnInit {
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthGroups: MonthGroup[] = [];

  newEntry: DirectStockEntry = {
    itemName: '',
    month: 1,
    year: 2026,
    openingQty: undefined,
    openingValue: 0,
    closingQty: undefined,
    closingValue: 0,
    notes: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    // Initialized empty matching Express ground truth
    this.monthGroups = [];
  }

  addEntry() {
    if (!this.newEntry.itemName || !this.newEntry.openingValue || !this.newEntry.closingValue) {
      alert('Please fill all required fields');
      return;
    }
    let grp = this.monthGroups.find(g => g.periodMonth === this.newEntry.month && g.periodYear === this.newEntry.year);
    if (!grp) {
      grp = {
        periodMonth: this.newEntry.month,
        periodYear: this.newEntry.year,
        openingTotal: 0,
        closingTotal: 0,
        items: []
      };
      this.monthGroups.push(grp);
    }
    grp.items.push({ ...this.newEntry, id: Date.now() });
    grp.openingTotal += Number(this.newEntry.openingValue || 0);
    grp.closingTotal += Number(this.newEntry.closingValue || 0);
    this.newEntry.itemName = '';
    this.newEntry.notes = '';
  }

  deleteEntry(id?: number) {
    for (const g of this.monthGroups) {
      g.items = g.items.filter(i => i.id !== id);
    }
    this.monthGroups = this.monthGroups.filter(g => g.items.length > 0);
  }

  formatAmount(val: number | null | undefined): string {
    if (val == null || isNaN(val)) return '0.00';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const parts = absVal.toFixed(2).split('.');
    let intPart = parts[0];
    const decPart = parts[1];
    if (intPart.length > 3) {
      const last3 = intPart.substring(intPart.length - 3);
      const rest = intPart.substring(0, intPart.length - 3);
      intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    }
    return (isNeg ? '-' : '') + intPart + '.' + decPart;
  }
}
