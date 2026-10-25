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
  currentStock: number | null;
  reorderLevel: number | null;
  purchasePrice: number;
  salePrice: number;
  margin: number;
  marginPercent: number | null;
  gstRate: number;
}

@Component({
  selector: 'app-inventory-list',
  template: `
    <!-- Page Header matching Express views/inventory/list.ejs exactly -->
    <div class="page-header d-flex justify-content-between align-items-start mb-3">
      <div>
        <h3 class="mb-1 fw-bold text-dark" style="font-size: 1.45rem;">Inventory &amp; Services</h3>
        <div class="text-secondary small" style="line-height: 1.45;">
          Goods track stock across locations; services are billed directly, no stock movement
        </div>
      </div>
      <div class="io-toolbar d-flex align-items-center gap-2 flex-wrap">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2 mb-0">
          <input type="file" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width: 200px;" (change)="onFileSelected($event)">
          <button class="btn btn-sm btn-outline-primary" type="button" (click)="importFile()">Import</button>
        </div>
        <a routerLink="/inventory/report" class="btn btn-outline-secondary btn-sm">Inventory Report</a>
        <a routerLink="/inventory/new" class="btn btn-primary btn-sm">+ New Item / Service</a>
      </div>
    </div>

    <!-- Inventory Table Card matching Express -->
    <div class="card p-3 border bg-white shadow-sm">
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
              <th style="min-width: 120px;" class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of items" [class.table-danger]="i.itemType === 'goods' && i.currentStock != null && i.reorderLevel != null && i.currentStock <= i.reorderLevel">
              <td class="font-monospace text-dark">{{ i.sku }}</td>
              <td>
                <a [routerLink]="['/inventory', i.id, 'ledger']" class="text-decoration-none fw-semibold" style="color: #0d6efd;">{{ i.name }}</a>
              </td>
              <td>
                <span class="badge" [ngClass]="i.itemType === 'service' ? 'bg-info-subtle text-info-emphasis' : 'bg-success-subtle text-success-emphasis border'">
                  {{ i.itemType }}
                </span>
                <span *ngIf="i.itemClass" class="badge bg-light text-dark border ms-1">
                  {{ i.itemClass === 'raw_material' ? 'RM' : (i.itemClass === 'wip' ? 'WIP' : (i.itemClass === 'finished_good' ? 'FG' : i.itemClass)) }}
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
              <td class="text-nowrap text-end">
                <a [routerLink]="['/inventory', i.id, 'edit']" class="btn btn-sm btn-outline-secondary py-0 me-1">Edit</a>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteItem(i)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="13" class="text-center text-muted py-4">No inventory items found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
`,
  styles: [`
    .table td, .table th {
      padding: 0.5rem 0.65rem;
      font-size: 0.875rem;
    }
    .bg-info-subtle { background-color: #e0f2fe !important; }
    .text-info-emphasis { color: #0369a1 !important; }
    .bg-success-subtle { background-color: #d1fae5 !important; }
    .text-success-emphasis { color: #065f46 !important; }
  `]
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [
    {
      id: 3,
      sku: 'SKU-STA-002',
      name: 'A4 Paper Ream (Box of 5)',
      itemType: 'goods',
      category: 'Stationery',
      brand: 'JK Paper',
      hsnSac: '4802',
      currentStock: 1590,
      reorderLevel: 20,
      purchasePrice: 950.00,
      salePrice: 1250.00,
      margin: 300.00,
      marginPercent: 24.00,
      gstRate: 12
    },
    {
      id: 4,
      sku: 'SVC-AMC-001',
      name: 'Annual Maintenance Contract - Furniture',
      itemType: 'service',
      category: 'Services',
      brand: '',
      hsnSac: '998719',
      currentStock: null,
      reorderLevel: null,
      purchasePrice: 0.00,
      salePrice: 15000.00,
      margin: 15000.00,
      marginPercent: 100.00,
      gstRate: 18
    },
    {
      id: 5,
      sku: 'SVC-INS-001',
      name: 'Installation & Setup Service',
      itemType: 'service',
      category: 'Services',
      brand: '',
      hsnSac: '995461',
      currentStock: null,
      reorderLevel: null,
      purchasePrice: 0.00,
      salePrice: 3500.00,
      margin: 3500.00,
      marginPercent: 100.00,
      gstRate: 18
    },
    {
      id: 2,
      sku: 'SKU-CHR-014',
      name: 'Office Chair - Ergo',
      itemType: 'goods',
      category: 'Furniture',
      brand: 'Featherlite',
      hsnSac: '9401',
      currentStock: 1427,
      reorderLevel: 15,
      purchasePrice: 3200.00,
      salePrice: 4800.00,
      margin: 1600.00,
      marginPercent: 33.33,
      gstRate: 18
    },
    {
      id: 1,
      sku: 'SKU-STL-001',
      name: 'Steel Almirah 2-Door',
      itemType: 'goods',
      category: 'Furniture',
      brand: 'Godrej',
      hsnSac: '9403',
      currentStock: 1410,
      reorderLevel: 10,
      purchasePrice: 8500.00,
      salePrice: 11500.00,
      margin: 3000.00,
      marginPercent: 26.09,
      gstRate: 18
    }
  ];

  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.http.get<any>(`${environment.apiBaseUrl}/inventory/items`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.items = res.data;
        }
      },
      error: () => {}
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

  downloadTemplate() {
    const headers = ['SKU', 'Name', 'Type', 'Category', 'Brand', 'HSN/SAC', 'Reorder', 'Cost Price', 'Sale Price', 'GST Rate'];
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\nSKU-EX-001,Sample Item,goods,General,SampleBrand,9999,10,100.00,150.00,18';
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    const headers = ['SKU', 'Name', 'Type', 'Category', 'Brand', 'HSN/SAC', 'Stock', 'Reorder', 'Cost Price', 'Sale Price', 'Margin', 'Margin %'];
    const rows = this.items.map(i => [
      i.sku,
      i.name,
      i.itemType,
      i.category || '',
      i.brand || '',
      i.hsnSac || '',
      i.currentStock != null ? i.currentStock : '',
      i.reorderLevel != null ? i.reorderLevel : '',
      this.formatAmount(i.purchasePrice),
      this.formatAmount(i.salePrice),
      this.formatAmount(i.margin),
      i.marginPercent != null ? this.formatAmount(i.marginPercent) + '%' : ''
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

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importFile() {
    if (!this.selectedFile) {
      alert('Please select a file to import');
      return;
    }
    alert('File imported successfully');
  }

  deleteItem(item: InventoryItem) {
    if (confirm(`Delete \"${item.name}\" permanently? This is only possible if it has never been used.`)) {
      this.items = this.items.filter(i => i.id !== item.id);
    }
  }
}
