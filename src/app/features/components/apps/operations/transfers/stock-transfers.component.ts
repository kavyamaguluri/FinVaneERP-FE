import { Component, OnInit } from '@angular/core';

export interface TransferRow {
  id: number;
  transferNo: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  status: string;
}

@Component({
  selector: 'app-stock-transfers',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Stock Transfers</h3>
        <div class="subtitle text-muted small">Inter-warehouse and branch transit stock movement</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button class="btn btn-primary btn-sm">+ New Transfer</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Transfer No</th>
              <th>Date</th>
              <th>Source Location</th>
              <th>Destination Location</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of transfers">
              <td><strong class="text-primary">{{ t.transferNo }}</strong></td>
              <td>{{ t.date }}</td>
              <td><span class="badge text-bg-light border">{{ t.fromLocation }}</span></td>
              <td><span class="badge text-bg-light border">{{ t.toLocation }}</span></td>
              <td><span class="badge text-bg-success">{{ t.status }}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StockTransfersComponent implements OnInit {
  transfers: TransferRow[] = [
  {
    "id": 2,
    "transferNo": "ST-00002",
    "date": "2026-07-22",
    "fromLocation": "Mumbai Central Warehouse",
    "toLocation": "Bengaluru Retail Store",
    "status": "Completed"
  },
  {
    "id": 1,
    "transferNo": "ST-00001",
    "date": "2026-07-20",
    "fromLocation": "Mumbai Central Warehouse",
    "toLocation": "Pune Regional Warehouse",
    "status": "Completed"
  },
  {
    "id": 6,
    "transferNo": "ST-FY2526-02",
    "date": "2025-07-15",
    "fromLocation": "Mumbai Central Warehouse",
    "toLocation": "Bengaluru Retail Store",
    "status": "Completed"
  },
  {
    "id": 5,
    "transferNo": "ST-FY2526-01",
    "date": "2025-07-10",
    "fromLocation": "Mumbai Central Warehouse",
    "toLocation": "Pune Regional Warehouse",
    "status": "Completed"
  },
  {
    "id": 4,
    "transferNo": "ST-FY2425-02",
    "date": "2024-07-15",
    "fromLocation": "Mumbai Central Warehouse",
    "toLocation": "Bengaluru Retail Store",
    "status": "Completed"
  },
  {
    "id": 3,
    "transferNo": "ST-FY2425-01",
    "date": "2024-07-10",
    "fromLocation": "Mumbai Central Warehouse",
    "toLocation": "Pune Regional Warehouse",
    "status": "Completed"
  }
];
  ngOnInit() {}
}
