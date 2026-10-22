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
    <div class="page-header">
      <div>
        <h3 class="mb-0">Inventory &amp; Services</h3>
        <div class="subtitle">Goods track stock across locations; services are billed directly, no stock movement</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-secondary">Inventory Report</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="openAddModal()">+ New Item / Service</button>
      </div>
    </div>

    <div class="card p-3">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr class="text-uppercase small fw-bold">
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
              <th>GST%</th>
              <th style="min-width: 120px;" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of items" [class.table-danger]="i.itemType === 'goods' && i.currentStock <= i.reorderLevel">
              <td class="font-monospace small fw-bold">{{ i.sku }}</td>
              <td>
                <span class="fw-semibold text-teal" style="color: #0f766e;">{{ i.name }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="i.itemType === 'service' ? 'bg-info-subtle text-info-emphasis' : 'bg-success-subtle text-success-emphasis'">
                  {{ i.itemType }}
                </span>
                <span *ngIf="i.itemClass" class="badge bg-light text-dark border ms-1">{{ i.itemClass }}</span>
              </td>
              <td class="small">{{ i.category || '—' }}</td>
              <td class="small">{{ i.brand || '—' }}</td>
              <td class="font-monospace small">{{ i.hsnSac || '—' }}</td>
              <td class="text-end font-monospace">{{ i.itemType === 'service' ? '—' : i.currentStock }}</td>
              <td class="text-end font-monospace">{{ i.itemType === 'service' ? '—' : i.reorderLevel }}</td>
              <td class="text-end font-monospace">&#8377;{{ i.purchasePrice | number:'1.2-2' }}</td>
              <td class="text-end font-monospace">&#8377;{{ i.salePrice | number:'1.2-2' }}</td>
              <td class="text-end font-monospace" [ngClass]="i.margin > 0 ? 'text-success' : (i.margin < 0 ? 'text-danger' : '')">
                &#8377;{{ i.margin | number:'1.2-2' }}
              </td>
              <td class="text-end font-monospace" [ngClass]="i.marginPercent && i.marginPercent > 0 ? 'text-success' : (i.marginPercent && i.marginPercent < 0 ? 'text-danger' : '')">
                {{ i.marginPercent === null ? '—' : (i.marginPercent | number:'1.2-2') + '%' }}
              </td>
              <td class="small font-monospace">{{ i.gstRate }}%</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary py-0 me-1" (click)="editItem(i)">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteItem(i)">Delete</button>
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
      id: 1,
      sku: 'SKU-001',
      name: 'Steel Bracket 4in',
      itemType: 'goods',
      itemClass: 'FG',
      category: 'Hardware',
      brand: 'Tata Steel',
      hsnSac: '73089090',
      currentStock: 100,
      reorderLevel: 20,
      purchasePrice: 150.00,
      salePrice: 220.00,
      margin: 70.00,
      marginPercent: 31.82,
      gstRate: 18
    },
    {
      id: 2,
      sku: 'SKU-002',
      name: 'Consulting Hour',
      itemType: 'service',
      category: 'Services',
      brand: 'FinVane Advisory',
      hsnSac: '998311',
      currentStock: 0,
      reorderLevel: 0,
      purchasePrice: 0.00,
      salePrice: 1500.00,
      margin: 1500.00,
      marginPercent: 100.00,
      gstRate: 18
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  openAddModal() {
    alert('Create Item/Service form');
  }

  editItem(i: InventoryItem) {
    alert(`Editing item: ${i.name}`);
  }

  deleteItem(i: InventoryItem) {
    if (confirm(`Delete "${i.name}" permanently?`)) {
      this.items = this.items.filter(x => x.id !== i.id);
    }
  }

  exportExcel() {
    alert('Exporting inventory stock to Excel.');
  }
}
