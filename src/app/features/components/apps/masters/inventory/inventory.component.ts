import { Component, OnInit } from '@angular/core';

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  itemType: 'goods' | 'service';
  itemClass?: string;
  category?: string;
  brand?: string;
  hsnSac?: string;
  currentStock: number;
  reorderLevel: number;
  purchasePrice: number;
  salePrice: number;
  margin: number;
  marginPercent: number | null;
  gstRate: number;
}

@Component({
  selector: 'app-inventory-list',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Inventory &amp; Services</h3>
        <div class="subtitle text-muted small">Goods track stock across locations; services are billed directly, no stock movement</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-secondary">Inventory Report</button>
        <button type="button" class="btn btn-primary btn-sm">+ New Item / Service</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Brand</th>
              <th>HSN/SAC</th>
              <th class="text-end">Stock</th>
              <th class="text-end">Purchase ₹</th>
              <th class="text-end">Sale ₹</th>
              <th class="text-end">GST %</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td><strong class="text-secondary">{{ item.sku }}</strong></td>
              <td class="fw-medium text-dark">{{ item.name }}</td>
              <td>
                <span class="badge" [ngClass]="item.itemType === 'goods' ? 'text-bg-primary' : 'text-bg-info text-white'">
                  {{ item.itemType }}
                </span>
              </td>
              <td>{{ item.category }}</td>
              <td>{{ item.brand || '—' }}</td>
              <td><code>{{ item.hsnSac }}</code></td>
              <td class="text-end fw-semibold" [ngClass]="item.currentStock > 0 ? 'text-success' : 'text-muted'">
                {{ item.itemType === 'goods' ? item.currentStock : '—' }}
              </td>
              <td class="text-end">₹{{ item.purchasePrice | number:'1.2-2' }}</td>
              <td class="text-end fw-bold">₹{{ item.salePrice | number:'1.2-2' }}</td>
              <td class="text-end">{{ item.gstRate }}%</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger">Del</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [
  {
    "id": 1,
    "sku": "SKU-STL-001",
    "name": "Steel Almirah 2-Door",
    "itemType": "goods",
    "itemClass": "FG",
    "category": "Furniture",
    "brand": "Godrej",
    "hsnSac": "9403",
    "currentStock": 85,
    "reorderLevel": 10,
    "purchasePrice": 8500,
    "salePrice": 11500,
    "margin": 3000,
    "marginPercent": 26.09,
    "gstRate": 18
  },
  {
    "id": 2,
    "sku": "SKU-CHR-014",
    "name": "Office Chair - Ergo",
    "itemType": "goods",
    "itemClass": "FG",
    "category": "Furniture",
    "brand": "Featherlite",
    "hsnSac": "9401",
    "currentStock": 120,
    "reorderLevel": 15,
    "purchasePrice": 3200,
    "salePrice": 4800,
    "margin": 1600,
    "marginPercent": 33.33,
    "gstRate": 18
  },
  {
    "id": 3,
    "sku": "SKU-STA-002",
    "name": "A4 Paper Ream (Box of 5)",
    "itemType": "goods",
    "itemClass": "RM",
    "category": "Stationery",
    "brand": "JK Paper",
    "hsnSac": "4802",
    "currentStock": 350,
    "reorderLevel": 20,
    "purchasePrice": 950,
    "salePrice": 1250,
    "margin": 300,
    "marginPercent": 24,
    "gstRate": 12
  },
  {
    "id": 4,
    "sku": "SVC-AMC-001",
    "name": "Annual Maintenance Contract - Furniture",
    "itemType": "service",
    "itemClass": "SVC",
    "category": "Services",
    "brand": "Acme Care",
    "hsnSac": "998719",
    "currentStock": 0,
    "reorderLevel": 0,
    "purchasePrice": 0,
    "salePrice": 15000,
    "margin": 15000,
    "marginPercent": 100,
    "gstRate": 18
  },
  {
    "id": 5,
    "sku": "SVC-INS-001",
    "name": "Installation & Setup Service",
    "itemType": "service",
    "itemClass": "SVC",
    "category": "Services",
    "brand": "Acme Care",
    "hsnSac": "995461",
    "currentStock": 0,
    "reorderLevel": 0,
    "purchasePrice": 0,
    "salePrice": 3500,
    "margin": 3500,
    "marginPercent": 100,
    "gstRate": 18
  }
];
  ngOnInit() {}
}
