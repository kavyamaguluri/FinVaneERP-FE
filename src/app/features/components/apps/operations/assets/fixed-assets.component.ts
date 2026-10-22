import { Component, OnInit } from '@angular/core';

export interface FixedAssetItem {
  id: number;
  code: string;
  name: string;
  category: string;
  department: string;
  purchaseDate: string;
  cost: number;
  accumDep: number;
  netBookValue: number;
  status: string;
}

@Component({
  selector: 'app-fixed-assets',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Fixed Asset Register</h3>
        <div class="subtitle text-muted small">Asset acquisition, Companies Act / IT Act depreciation, and disposals</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary">Depreciation Schedule</button>
        <button class="btn btn-sm btn-success">Run Monthly Depreciation</button>
        <button class="btn btn-primary btn-sm">+ New Asset</button>
      </div>
    </div>

    <!-- Asset Summary Cards -->
    <div class="d-flex gap-3 flex-wrap mb-4">
      <div class="p-3 rounded border text-start bg-white" style="min-width: 170px;">
        <span class="fs-4 fw-bold d-block text-dark">{{ assets.length }}</span>
        <span class="small text-muted fw-medium">Active Assets</span>
      </div>
      <div class="p-3 rounded border text-start bg-white" style="min-width: 200px;">
        <span class="fs-4 fw-bold d-block text-primary">₹{{ totalCost | number:'1.2-2' }}</span>
        <span class="small text-muted fw-medium">Gross Block</span>
      </div>
      <div class="p-3 rounded border text-start bg-white" style="min-width: 200px;">
        <span class="fs-4 fw-bold d-block text-danger">₹{{ totalDep | number:'1.2-2' }}</span>
        <span class="small text-muted fw-medium">Accumulated Dep.</span>
      </div>
      <div class="p-3 rounded border text-start bg-white" style="min-width: 200px;">
        <span class="fs-4 fw-bold d-block text-success">₹{{ (totalCost - totalDep) | number:'1.2-2' }}</span>
        <span class="small text-muted fw-medium">Net Book Value</span>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Asset Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Department</th>
              <th>Put to Use</th>
              <th class="text-end">Cost</th>
              <th class="text-end">Accum. Dep</th>
              <th class="text-end">Net Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of assets">
              <td><strong class="text-secondary">{{ a.code }}</strong></td>
              <td class="fw-semibold text-dark">{{ a.name }}</td>
              <td>{{ a.category }}</td>
              <td>{{ a.department }}</td>
              <td>{{ a.purchaseDate }}</td>
              <td class="text-end">₹{{ a.cost | number:'1.2-2' }}</td>
              <td class="text-end text-danger">₹{{ a.accumDep | number:'1.2-2' }}</td>
              <td class="text-end fw-bold text-success">₹{{ a.netBookValue | number:'1.2-2' }}</td>
              <td><span class="badge text-bg-success">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FixedAssetsComponent implements OnInit {
  assets: FixedAssetItem[] = [
  {
    "id": 1,
    "code": "FA-001",
    "name": "Office Laptop - Dell Latitude",
    "category": "IT Equipment",
    "department": "Administration",
    "purchaseDate": "2024-04-01",
    "cost": 65000,
    "accumDep": 49743.11999999998,
    "netBookValue": 15256.88000000002,
    "status": "Active"
  },
  {
    "id": 2,
    "code": "FA-002",
    "name": "Warehouse Racking System",
    "category": "Warehouse Equipment",
    "department": "Operations",
    "purchaseDate": "2024-06-15",
    "cost": 45000,
    "accumDep": 6412.5,
    "netBookValue": 38587.5,
    "status": "Active"
  },
  {
    "id": 3,
    "code": "FA-003",
    "name": "Delivery Two-Wheeler",
    "category": "Vehicles",
    "department": "Logistics",
    "purchaseDate": "2024-08-20",
    "cost": 85000,
    "accumDep": 18168.839999999997,
    "netBookValue": 66831.16,
    "status": "Active"
  },
  {
    "id": 4,
    "code": "FA-004",
    "name": "Office Furniture Set",
    "category": "Furniture & Fixtures",
    "department": "Administration",
    "purchaseDate": "2024-11-10",
    "cost": 62000,
    "accumDep": 13252.41,
    "netBookValue": 48747.59,
    "status": "Active"
  },
  {
    "id": 5,
    "code": "FA-005",
    "name": "Desktop Computers (Batch of 5)",
    "category": "IT Equipment",
    "department": "Administration",
    "purchaseDate": "2025-02-05",
    "cost": 175000,
    "accumDep": 124687.61999999997,
    "netBookValue": 50312.380000000034,
    "status": "Active"
  },
  {
    "id": 6,
    "code": "FA-006",
    "name": "Delivery Van",
    "category": "Vehicles",
    "department": "Logistics",
    "purchaseDate": "2025-05-12",
    "cost": 650000,
    "accumDep": 173671.83,
    "netBookValue": 476328.17000000004,
    "status": "Active"
  },
  {
    "id": 7,
    "code": "FA-007",
    "name": "Split AC Units - Office",
    "category": "Electrical Installations",
    "department": "Administration",
    "purchaseDate": "2025-08-18",
    "cost": 128000,
    "accumDep": 27359.910000000018,
    "netBookValue": 100640.08999999998,
    "status": "Active"
  },
  {
    "id": 8,
    "code": "FA-008",
    "name": "Retail Display Racks",
    "category": "Furniture & Fixtures",
    "department": "Sales",
    "purchaseDate": "2025-11-22",
    "cost": 54000,
    "accumDep": 11542.5,
    "netBookValue": 42457.5,
    "status": "Active"
  },
  {
    "id": 9,
    "code": "FA-009",
    "name": "Laptops (Batch of 3)",
    "category": "IT Equipment",
    "department": "Sales",
    "purchaseDate": "2026-02-10",
    "cost": 135000,
    "accumDep": 96187.5,
    "netBookValue": 38812.5,
    "status": "Active"
  },
  {
    "id": 10,
    "code": "FA-010",
    "name": "Forklift - Warehouse",
    "category": "Plant & Machinery",
    "department": "Operations",
    "purchaseDate": "2026-05-15",
    "cost": 380000,
    "accumDep": 54150.11999999998,
    "netBookValue": 325849.88,
    "status": "Active"
  }
];

  get totalCost(): number {
    return this.assets.reduce((sum, a) => sum + a.cost, 0);
  }

  get totalDep(): number {
    return this.assets.reduce((sum, a) => sum + a.accumDep, 0);
  }

  ngOnInit() {}
}
