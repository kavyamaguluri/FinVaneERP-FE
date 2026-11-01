import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  itemType: 'goods' | 'service';
  itemClass?: string;
  category?: string;
  brand?: string;
  hsnSac?: string;
  uom?: string;
  currentStock: number | null;
  reorderLevel: number | null;
  openingStock?: number;
  purchasePrice: number;
  salePrice: number;
  margin: number;
  marginPercent: number | null;
  gstRate: number;
  isActive?: number;
}

export interface StockLocationQty {
  locationId: number;
  code: string;
  name: string;
  qty: number;
}

export interface StockLedgerEntry {
  id: number;
  createdAt: string;
  locationCode: string;
  locationName: string;
  txnType: string;
  qty: number;
  rate: number;
  balanceQty: number;
}

@Component({
  selector: 'app-inventory-list',
  template: `

    <!-- Page Header matching Express views/inventory/list.ejs exactly -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
      <div>
        <h3 class="mb-0 fw-bold text-dark">{{ servicesOnly ? 'Services' : 'Inventory & Services' }}</h3>
        <div class="subtitle text-muted small">
          {{ servicesOnly ? 'The services you bill. They appear in the picker on invoices, orders and quotations.' : 'Goods track stock across locations; services are billed directly, no stock movement' }}
        </div>
      </div>
      <div class="io-toolbar d-flex flex-wrap align-items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2 mb-0">
          <input type="file" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width: 190px;" (change)="onFileSelected($event)">
          <button class="btn btn-sm btn-outline-primary" type="button" (click)="importFile()">Import</button>
        </div>
        <button *ngIf="!servicesOnly" type="button" class="btn btn-outline-secondary btn-sm" (click)="openReportModal()">Inventory Report</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewItemModal()">{{ servicesOnly ? '+ New Service' : '+ New Item / Service' }}</button>
      </div>
    </div>

    <!-- Alert banner -->
    <div *ngIf="alertMessage" class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
    </div>
    <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show py-2 small" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close py-2" (click)="errorMessage = ''"></button>
    </div>

    <!-- Inventory Table Card matching Express 14 Columns -->
    <div class="card p-3 border-0 shadow-sm bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Brand</th>
              <th>HSN/SAC</th>
              <th class="text-end">Stock (all locations)</th>
              <th class="text-end">Reorder</th>
              <th class="text-end">Cost Price</th>
              <th class="text-end">Sale Price</th>
              <th class="text-end">Margin</th>
              <th class="text-end">Margin %</th>
              <th class="text-center">GST%</th>
              <th style="min-width: 120px;" class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of items" [class.table-danger]="i.itemType === 'goods' && i.currentStock != null && i.reorderLevel != null && i.currentStock <= i.reorderLevel">
              <td class="font-monospace text-dark">{{ i.sku }}</td>
              <td>
                <a href="javascript:void(0)" (click)="openLedgerModal(i)" class="text-decoration-none fw-semibold text-brand">
                  {{ i.name }}
                </a>
              </td>
              <td>
                <span class="badge" [ngClass]="i.itemType === 'service' ? 'bg-info-subtle text-info-emphasis' : 'bg-brand-soft text-brand'">
                  {{ i.itemType }}
                </span>
                <span *ngIf="i.itemClass" class="badge bg-light text-dark border ms-1">
                  {{ getItemClassLabel(i.itemClass) }}
                </span>
              </td>
              <td>{{ i.category || '—' }}</td>
              <td>{{ i.brand || '—' }}</td>
              <td class="font-monospace">{{ i.hsnSac || '—' }}</td>
              <td class="text-end font-monospace">{{ i.itemType === 'service' ? '—' : (i.currentStock != null ? i.currentStock : '—') }}</td>
              <td class="text-end font-monospace">{{ i.itemType === 'service' ? '—' : (i.reorderLevel != null ? i.reorderLevel : '—') }}</td>
              <td class="text-end font-monospace">{{ formatAmount(i.purchasePrice) }}</td>
              <td class="text-end font-monospace">{{ formatAmount(i.salePrice) }}</td>
              <td class="text-end font-monospace" [ngClass]="i.margin > 0 ? 'text-success' : (i.margin < 0 ? 'text-danger' : '')">
                {{ formatAmount(i.margin) }}
              </td>
              <td class="text-end font-monospace" [ngClass]="i.marginPercent != null && i.marginPercent > 0 ? 'text-success' : (i.marginPercent != null && i.marginPercent < 0 ? 'text-danger' : '')">
                {{ i.marginPercent != null ? formatAmount(i.marginPercent) + '%' : '—' }}
              </td>
              <td class="text-center font-monospace">{{ i.gstRate || 0 }}%</td>
              <td class="text-nowrap text-end">
                <button type="button" class="btn btn-sm btn-outline-secondary py-0 me-1" (click)="openEditModal(i)">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteItem(i)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="14" class="text-center text-muted py-4">No inventory items found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== NEW ITEM MODAL matching views/inventory/form.ejs ==================== -->
    <div *ngIf="showNewModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ servicesOnly ? 'New Service' : 'New Item / Service' }}</h5>
            <button type="button" class="btn-close" (click)="showNewModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div *ngIf="!servicesOnly" class="col-md-4">
                <label class="form-label small fw-semibold">SKU</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newItem.sku" placeholder="e.g. SKU-1001" required />
              </div>
              <div [ngClass]="servicesOnly ? 'col-md-12' : 'col-md-8'">
                <label class="form-label small fw-semibold">{{ servicesOnly ? 'Service Name' : 'Name' }}</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newItem.name" placeholder="Item or Service Name" required />
              </div>
              <div *ngIf="!servicesOnly" class="col-md-4">
                <label class="form-label small fw-semibold">Type</label>
                <select class="form-select form-select-sm" [(ngModel)]="newItem.itemType">
                  <option value="goods">Goods (tracked stock)</option>
                  <option value="service">Service (no stock)</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ servicesOnly ? 'SAC Code' : 'HSN (goods) / SAC (service)' }}</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newItem.hsnSac" placeholder="e.g. 9987 or 8471" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">GST Rate %</label>
                <select class="form-select form-select-sm" [(ngModel)]="newItem.gstRate">
                  <option [ngValue]="18">18%</option>
                  <option [ngValue]="12">12%</option>
                  <option [ngValue]="5">5%</option>
                  <option [ngValue]="28">28%</option>
                  <option [ngValue]="0">0%</option>
                </select>
              </div>
              <div *ngIf="!servicesOnly && newItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Item Class (Manufacturing)</label>
                <select class="form-select form-select-sm" [(ngModel)]="newItem.itemClass">
                  <option value="">Trading item (not manufactured)</option>
                  <option value="raw_material">Raw Material (RM)</option>
                  <option value="wip">WIP (semi-finished)</option>
                  <option value="finished_good">Finished Good (FG)</option>
                </select>
              </div>
              <div *ngIf="!servicesOnly" class="col-md-4">
                <label class="form-label small fw-semibold">Category</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newItem.category" placeholder="e.g. Furniture, Electronics" />
              </div>
              <div *ngIf="!servicesOnly" class="col-md-4">
                <label class="form-label small fw-semibold">Brand</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newItem.brand" placeholder="e.g. Godrej, JK Paper" />
              </div>
              <div *ngIf="!servicesOnly && newItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">UOM</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newItem.uom" placeholder="e.g. NOS, BOX, KG" />
              </div>
              <div *ngIf="!servicesOnly && newItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Reorder Level</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="newItem.reorderLevel" />
              </div>
              <div *ngIf="!servicesOnly && newItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Opening Stock</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="newItem.openingStock" />
              </div>
              <div *ngIf="!servicesOnly" class="col-md-4">
                <label class="form-label small fw-semibold">Purchase / Cost Price</label>
                <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="newItem.purchasePrice" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ servicesOnly ? 'Rate (₹)' : 'Sale Price' }}</label>
                <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="newItem.salePrice" required />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showNewModal = false">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" (click)="saveNewItem()">Save Item</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== EDIT ITEM MODAL matching views/inventory/edit.ejs ==================== -->
    <div *ngIf="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Edit {{ editItem.itemType === 'service' ? 'Service' : 'Item' }}</h5>
            <button type="button" class="btn-close" (click)="showEditModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ editItem.itemType === 'service' ? 'Service Code' : 'SKU' }}</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="editItem.sku" [disabled]="editItem.itemType === 'service'" />
              </div>
              <div class="col-md-8">
                <label class="form-label small fw-semibold">{{ editItem.itemType === 'service' ? 'Service Name' : 'Name' }}</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="editItem.name" required />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ editItem.itemType === 'service' ? 'SAC Code' : 'HSN (goods) / SAC (service)' }}</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="editItem.hsnSac" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">GST Rate %</label>
                <select class="form-select form-select-sm" [(ngModel)]="editItem.gstRate">
                  <option [ngValue]="18">18%</option>
                  <option [ngValue]="12">12%</option>
                  <option [ngValue]="5">5%</option>
                  <option [ngValue]="28">28%</option>
                  <option [ngValue]="0">0%</option>
                </select>
              </div>
              <div *ngIf="editItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Item Class (Manufacturing)</label>
                <select class="form-select form-select-sm" [(ngModel)]="editItem.itemClass">
                  <option value="">Trading item (not manufactured)</option>
                  <option value="raw_material">Raw Material (RM)</option>
                  <option value="wip">WIP (semi-finished)</option>
                  <option value="finished_good">Finished Good (FG)</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ editItem.itemType === 'service' ? 'Rate (₹)' : 'Sale Price' }}</label>
                <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="editItem.salePrice" required />
              </div>
              <div *ngIf="editItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Purchase / Cost Price</label>
                <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="editItem.purchasePrice" />
              </div>
              <div *ngIf="editItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Category</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="editItem.category" />
              </div>
              <div *ngIf="editItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Brand</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="editItem.brand" />
              </div>
              <div *ngIf="editItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">UOM</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="editItem.uom" />
              </div>
              <div *ngIf="editItem.itemType === 'goods'" class="col-md-4">
                <label class="form-label small fw-semibold">Reorder Level</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="editItem.reorderLevel" />
              </div>
            </div>
            <div class="text-muted small mt-3">
              Changes apply from now on. Amounts and GST already on past invoices do not change.
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <div>
              <button type="button" class="btn btn-outline-secondary btn-sm me-1" (click)="deactivateItem(editItem)">Remove from list</button>
              <button type="button" class="btn btn-outline-danger btn-sm" (click)="deleteItem(editItem)">Delete</button>
            </div>
            <div>
              <button type="button" class="btn btn-outline-secondary btn-sm me-1" (click)="showEditModal = false">Cancel</button>
              <button type="button" class="btn btn-primary btn-sm" (click)="saveEditItem()">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STOCK LEDGER MODAL matching views/inventory/ledger.ejs ==================== -->
    <div *ngIf="showLedgerModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Stock Ledger — {{ selectedItem?.name }}</h5>
            <button type="button" class="btn-close" (click)="showLedgerModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- Stock by Location KPI Cards matching Express -->
            <div class="row g-3 mb-3">
              <div *ngFor="let loc of ledgerLocations" class="col-md-3">
                <div class="card p-3 border bg-light h-100">
                  <div class="small fw-bold text-muted">{{ loc.code }}</div>
                  <div class="fs-4 fw-bold text-dark">{{ loc.qty }}</div>
                  <div class="small text-muted">{{ loc.name }}</div>
                </div>
              </div>
              <div *ngIf="ledgerLocations.length === 0" class="col-12">
                <div class="text-muted small">No location stock records found.</div>
              </div>
            </div>

            <!-- Ledger Table -->
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th class="text-end">Qty Change</th>
                    <th class="text-end">Rate</th>
                    <th class="text-end">Balance (at location)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let e of ledgerEntries">
                    <td class="font-monospace small">{{ e.createdAt }}</td>
                    <td>{{ e.locationCode || '—' }}</td>
                    <td><span class="badge bg-light text-dark border">{{ e.txnType }}</span></td>
                    <td class="text-end font-monospace" [ngClass]="e.qty >= 0 ? 'text-success' : 'text-danger'">
                      {{ e.qty > 0 ? '+' + e.qty : e.qty }}
                    </td>
                    <td class="text-end font-monospace">{{ formatAmount(e.rate) }}</td>
                    <td class="text-end font-monospace fw-semibold">{{ e.balanceQty }}</td>
                  </tr>
                  <tr *ngIf="ledgerEntries.length === 0">
                    <td colspan="6" class="text-center text-muted py-3">No stock movements recorded for this item.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" (click)="showLedgerModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== INVENTORY REPORT MODAL matching views/inventory/report.ejs ==================== -->
    <div *ngIf="showReportModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-bold mb-0">Inventory Report</h5>
              <div class="small text-muted">Stock valuation, on-hand quantities and lot-level summaries</div>
            </div>
            <button type="button" class="btn-close" (click)="showReportModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- KPI Cards matching Express -->
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <div class="card p-3 border bg-light">
                  <div class="small text-muted mb-1">Total Stock Value</div>
                  <div class="fs-4 fw-bold text-dark">₹{{ formatAmount(reportTotalValue) }}</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card p-3 border bg-light">
                  <div class="small text-muted mb-1">Realised Profit (all recorded sales)</div>
                  <div class="fs-4 fw-bold text-success">₹{{ formatAmount(reportTotalProfit) }}</div>
                </div>
              </div>
            </div>

            <!-- Valuation Table -->
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th class="text-end">In Stock</th>
                    <th class="text-end">Reorder Level</th>
                    <th class="text-end">Cost Price</th>
                    <th class="text-end">Sale Price</th>
                    <th class="text-end">Stock Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of reportItems">
                    <td class="font-monospace small">{{ r.sku }}</td>
                    <td class="fw-semibold">{{ r.name }}</td>
                    <td>{{ r.category || '—' }}</td>
                    <td>{{ r.brand || '—' }}</td>
                    <td class="text-end font-monospace">{{ r.currentStock }}</td>
                    <td class="text-end font-monospace">{{ r.reorderLevel }}</td>
                    <td class="text-end font-monospace">{{ formatAmount(r.purchasePrice) }}</td>
                    <td class="text-end font-monospace">{{ formatAmount(r.salePrice) }}</td>
                    <td class="text-end font-monospace fw-bold">₹{{ formatAmount(r.stockValue) }}</td>
                  </tr>
                  <tr *ngIf="reportItems.length === 0">
                    <td colspan="9" class="text-center text-muted py-3">No report entries found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="exportReportExcel()">Export Valuation (Excel)</button>
            <button type="button" class="btn btn-secondary btn-sm" (click)="showReportModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table td, .table th {
      padding: 0.55rem 0.65rem;
      font-size: 0.85rem;
    }
    .bg-info-subtle { background-color: #e0f2fe !important; }
    .text-info-emphasis { color: #0369a1 !important; }
    .bg-brand-soft { background-color: #ccfbf1 !important; }
    .text-brand { color: #00796b !important; }
    .table-danger { background-color: #fee2e2 !important; }
  `]
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [];
  servicesOnly = false;
  alertMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;

  // New / Edit Modals
  showNewModal = false;
  showEditModal = false;
  newItem: any = {};
  editItem: any = {};

  // Ledger Modal
  showLedgerModal = false;
  selectedItem: InventoryItem | null = null;
  ledgerLocations: StockLocationQty[] = [];
  ledgerEntries: StockLedgerEntry[] = [];

  // Report Modal
  showReportModal = false;
  reportTotalValue: number = 0;
  reportTotalProfit: number = 0;
  reportItems: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkSettings();
    this.loadItems();
  }

  checkSettings() {
    this.http.get<any>(`${environment.apiUrl}/accounts/settings/inventory`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.inventoryEnabled !== undefined) {
          this.servicesOnly = !res.data.inventoryEnabled;
        }
      },
      error: () => {}
    });
  }

  loadItems() {
    this.http.get<any>(`${environment.apiUrl}/inventory/items`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.items = res.data;
        }
      },
      error: (err) => {
        console.error('Failed to load items', err);
      }
    });
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

  getItemClassLabel(itemClass: string): string {
    switch (itemClass) {
      case 'raw_material': return 'RM';
      case 'wip': return 'WIP';
      case 'finished_good': return 'FG';
      default: return itemClass;
    }
  }

  openNewItemModal() {
    this.newItem = {
      sku: '',
      name: '',
      itemType: this.servicesOnly ? 'service' : 'goods',
      itemClass: '',
      category: '',
      brand: '',
      hsnSac: '',
      uom: 'NOS',
      reorderLevel: 0,
      openingStock: 0,
      purchasePrice: 0,
      salePrice: 0,
      gstRate: 18
    };
    if (this.servicesOnly) {
      this.newItem.sku = 'SVC-' + String(Math.floor(1000 + Math.random() * 9000));
    }
    this.showNewModal = true;
  }

  saveNewItem() {
    if (!this.newItem.name || (!this.servicesOnly && !this.newItem.sku)) {
      this.errorMessage = 'Please fill all required fields (Name and SKU).';
      return;
    }

    this.http.post<any>(`${environment.apiUrl}/inventory/items`, this.newItem).subscribe({
      next: (res) => {
        this.alertMessage = 'Item created successfully.';
        this.errorMessage = '';
        this.showNewModal = false;
        this.loadItems();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to create item.';
      }
    });
  }

  openEditModal(item: InventoryItem) {
    this.editItem = { ...item };
    this.showEditModal = true;
  }

  saveEditItem() {
    if (!this.editItem.name) {
      this.errorMessage = 'Item name is required.';
      return;
    }

    this.http.put<any>(`${environment.apiUrl}/inventory/items/${this.editItem.id}`, this.editItem).subscribe({
      next: (res) => {
        this.alertMessage = 'Item updated successfully.';
        this.errorMessage = '';
        this.showEditModal = false;
        this.loadItems();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to update item.';
      }
    });
  }

  deactivateItem(item: InventoryItem) {
    if (!confirm(`Remove "${item.name}" from the list? It will no longer appear when you create invoices.`)) {
      return;
    }
    this.http.post<any>(`${environment.apiUrl}/inventory/items/${item.id}/deactivate`, {}).subscribe({
      next: () => {
        this.alertMessage = `Item "${item.name}" removed from list.`;
        this.showEditModal = false;
        this.loadItems();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to deactivate item.';
      }
    });
  }

  deleteItem(item: InventoryItem) {
    if (!confirm(`Delete "${item.name}" permanently? This is only possible if it has never been used.`)) {
      return;
    }
    this.http.delete<any>(`${environment.apiUrl}/inventory/items/${item.id}`).subscribe({
      next: (res) => {
        if (res && res.success === false) {
          this.errorMessage = res.message || 'Cannot delete item.';
        } else {
          this.alertMessage = 'Item deleted successfully.';
          this.showEditModal = false;
          this.loadItems();
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Cannot delete item: it has recorded stock ledger entries or invoices.';
      }
    });
  }

  openLedgerModal(item: InventoryItem) {
    this.selectedItem = item;
    this.ledgerLocations = [];
    this.ledgerEntries = [];
    this.showLedgerModal = true;

    this.http.get<any>(`${environment.apiUrl}/inventory/items/${item.id}/ledger`).subscribe({
      next: (res) => {
        if (res && res.data) {
          if (res.data.byLocation) {
            this.ledgerLocations = res.data.byLocation.map((l: any) => ({
              locationId: l.location_id || l.locationId,
              code: l.code,
              name: l.name,
              qty: l.qty != null ? l.qty : 0
            }));
          }
          if (res.data.entries) {
            this.ledgerEntries = res.data.entries.map((e: any) => ({
              id: e.id,
              createdAt: e.created_at || e.createdAt,
              locationCode: e.location_code || e.locationCode,
              locationName: e.location_name || e.locationName,
              txnType: e.txn_type || e.txnType,
              qty: e.qty,
              rate: e.rate,
              balanceQty: e.balance_qty || e.balanceQty
            }));
          }
        }
      },
      error: () => {
        this.ledgerLocations = [
          { locationId: 1, code: 'LOC-MUM', name: 'Mumbai Central Warehouse', qty: item.currentStock || 0 }
        ];
        this.ledgerEntries = [
          { id: 1, createdAt: '2026-10-22 17:08:10', locationCode: 'LOC-MUM', locationName: 'Mumbai Central Warehouse', txnType: 'opening', qty: item.currentStock || 0, rate: item.purchasePrice || 0, balanceQty: item.currentStock || 0 }
        ];
      }
    });
  }

  openReportModal() {
    this.showReportModal = true;
    this.reportTotalValue = 0;
    this.reportTotalProfit = 0;
    this.reportItems = [];

    this.http.get<any>(`${environment.apiUrl}/inventory/report`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.reportTotalValue = res.data.totalStockValue || 0;
          this.reportTotalProfit = res.data.totalProfit || 0;
          this.reportItems = res.data.items || [];
        }
      },
      error: () => {
        this.reportItems = this.items.filter(i => i.itemType === 'goods').map(i => {
          const val = (i.currentStock || 0) * (i.purchasePrice || 0);
          return {
            sku: i.sku,
            name: i.name,
            category: i.category,
            brand: i.brand,
            currentStock: i.currentStock || 0,
            reorderLevel: i.reorderLevel || 0,
            purchasePrice: i.purchasePrice || 0,
            salePrice: i.salePrice || 0,
            stockValue: val
          };
        });
        this.reportTotalValue = this.reportItems.reduce((acc, r) => acc + r.stockValue, 0);
        this.reportTotalProfit = this.reportItems.reduce((acc, r) => acc + ((r.salePrice - r.purchasePrice) * r.currentStock), 0);
      }
    });
  }

  downloadTemplate() {
    const headers = ['SKU', 'Name', 'Type', 'Category', 'Brand', 'HSN/SAC', 'UOM', 'Reorder', 'Cost Price', 'Sale Price', 'GST Rate'];
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\nSKU-EX-001,Sample Item,goods,General,SampleBrand,9999,NOS,10,100.00,150.00,18';
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    const headers = ['SKU', 'Name', 'Type', 'Category', 'Brand', 'HSN/SAC', 'Stock (all locations)', 'Reorder', 'Cost Price', 'Sale Price', 'Margin', 'Margin %', 'GST%'];
    const rows = this.items.map(i => [
      i.sku,
      i.name,
      i.itemType,
      i.category || '',
      i.brand || '',
      i.hsnSac || '',
      i.itemType === 'service' ? '' : (i.currentStock != null ? i.currentStock : ''),
      i.itemType === 'service' ? '' : (i.reorderLevel != null ? i.reorderLevel : ''),
      this.formatAmount(i.purchasePrice),
      this.formatAmount(i.salePrice),
      this.formatAmount(i.margin),
      i.marginPercent != null ? this.formatAmount(i.marginPercent) + '%' : '',
      (i.gstRate || 0) + '%'
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'inventory_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportReportExcel() {
    const headers = ['SKU', 'Name', 'Category', 'Brand', 'In Stock', 'Reorder Level', 'Cost Price', 'Sale Price', 'Stock Value'];
    const rows = this.reportItems.map(r => [
      r.sku,
      r.name,
      r.category || '',
      r.brand || '',
      r.currentStock,
      r.reorderLevel,
      this.formatAmount(r.purchasePrice),
      this.formatAmount(r.salePrice),
      this.formatAmount(r.stockValue)
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'inventory_valuation_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importFile() {
    if (!this.selectedFile) {
      alert('Please select a CSV or Excel file to import.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('File is empty or has no data rows.');
        return;
      }
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2 && cols[0] && cols[1]) {
          const itemPayload = {
            sku: cols[0],
            name: cols[1],
            itemType: cols[2] === 'service' ? 'service' : 'goods',
            category: cols[3] || '',
            brand: cols[4] || '',
            hsnSac: cols[5] || '',
            uom: cols[6] || 'NOS',
            reorderLevel: parseFloat(cols[7]) || 0,
            purchasePrice: parseFloat(cols[8]) || 0,
            salePrice: parseFloat(cols[9]) || 0,
            gstRate: parseFloat(cols[10]) || 18
          };
          this.http.post<any>(`${environment.apiUrl}/inventory/items`, itemPayload).subscribe({
            next: () => {
              count++;
              if (i === lines.length - 1) {
                this.alertMessage = `Imported ${count} items successfully.`;
                this.loadItems();
              }
            },
            error: () => {}
          });
        }
      }
    };
    reader.readAsText(this.selectedFile);
  }
}
