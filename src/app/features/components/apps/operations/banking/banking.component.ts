import { Component, OnInit } from '@angular/core';

export interface BankTxn {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  reconciled: boolean;
}

@Component({
  selector: 'app-banking',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Banking &amp; Reconciliation</h3>
        <div class="subtitle text-muted small">Manage bank accounts, import OFX/CSV statements, and perform reconciliation</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary">Import Statement (CSV)</button>
        <button class="btn btn-sm btn-outline-secondary">Export Statement</button>
        <button class="btn btn-primary btn-sm">+ New Transaction</button>
      </div>
    </div>

    <!-- Bank Account Summary Card -->
    <div class="row g-3 mb-4">
      <div class="col-md-6 col-lg-4">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge text-bg-primary">Primary Account</span>
            <span class="small text-muted">HDFC0000123</span>
          </div>
          <h5 class="fw-bold text-dark mb-1">HDFC Current Account</h5>
          <div class="text-secondary small mb-3">A/C: <code>50200012345678</code></div>
          <div class="fs-4 fw-bold text-success mb-1">₹14,25,800.00</div>
          <div class="small text-muted">Reconciled Book Balance</div>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold mb-0">Bank Transactions ({{ transactions.length }} entries)</h6>
        <span class="small text-muted">Showing latest 50 posted entries</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th class="text-end">Withdrawal (Dr)</th>
              <th class="text-end">Deposit (Cr)</th>
              <th>Status</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of transactions">
              <td class="small">{{ t.date }}</td>
              <td class="fw-medium text-dark">{{ t.description }}</td>
              <td class="text-end text-danger">{{ t.debit ? ('₹' + (t.debit | number:'1.2-2')) : '—' }}</td>
              <td class="text-end text-success fw-semibold">{{ t.credit ? ('₹' + (t.credit | number:'1.2-2')) : '—' }}</td>
              <td>
                <span class="badge" [ngClass]="t.reconciled ? 'text-bg-success' : 'text-bg-warning'">
                  {{ t.reconciled ? 'Reconciled' : 'Unreconciled' }}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size: 0.78rem;">Match</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class BankingComponent implements OnInit {
  transactions: BankTxn[] = [
  {
    "id": 147,
    "date": "2026-08-23",
    "description": "Bulk demo bank txn 145",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 146,
    "date": "2026-08-18",
    "description": "Bulk demo bank txn 144",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 145,
    "date": "2026-08-13",
    "description": "Bulk demo bank txn 143",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 144,
    "date": "2026-08-08",
    "description": "Bulk demo bank txn 142",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 143,
    "date": "2026-08-03",
    "description": "Bulk demo bank txn 141",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 2,
    "date": "2026-07-30",
    "description": "Office rent - July",
    "debit": 25000,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 142,
    "date": "2026-07-23",
    "description": "Bulk demo bank txn 140",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 141,
    "date": "2026-07-18",
    "description": "Bulk demo bank txn 139",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 140,
    "date": "2026-07-13",
    "description": "Bulk demo bank txn 138",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 139,
    "date": "2026-07-08",
    "description": "Bulk demo bank txn 137",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 138,
    "date": "2026-07-03",
    "description": "Bulk demo bank txn 136",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 1,
    "date": "2026-07-01",
    "description": "Opening capital deposit",
    "debit": 0,
    "credit": 500000,
    "reconciled": true
  },
  {
    "id": 137,
    "date": "2026-06-23",
    "description": "Bulk demo bank txn 135",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 136,
    "date": "2026-06-18",
    "description": "Bulk demo bank txn 134",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 135,
    "date": "2026-06-13",
    "description": "Bulk demo bank txn 133",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 134,
    "date": "2026-06-08",
    "description": "Bulk demo bank txn 132",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 133,
    "date": "2026-06-03",
    "description": "Bulk demo bank txn 131",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 132,
    "date": "2026-05-23",
    "description": "Bulk demo bank txn 130",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 131,
    "date": "2026-05-18",
    "description": "Bulk demo bank txn 129",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 130,
    "date": "2026-05-13",
    "description": "Bulk demo bank txn 128",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 129,
    "date": "2026-05-08",
    "description": "Bulk demo bank txn 127",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 128,
    "date": "2026-05-03",
    "description": "Bulk demo bank txn 126",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 127,
    "date": "2026-04-23",
    "description": "Bulk demo bank txn 125",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 126,
    "date": "2026-04-18",
    "description": "Bulk demo bank txn 124",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 125,
    "date": "2026-04-13",
    "description": "Bulk demo bank txn 123",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 124,
    "date": "2026-04-08",
    "description": "Bulk demo bank txn 122",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 123,
    "date": "2026-04-03",
    "description": "Bulk demo bank txn 121",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 122,
    "date": "2026-03-23",
    "description": "Bulk demo bank txn 120",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 121,
    "date": "2026-03-18",
    "description": "Bulk demo bank txn 119",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 120,
    "date": "2026-03-13",
    "description": "Bulk demo bank txn 118",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 119,
    "date": "2026-03-08",
    "description": "Bulk demo bank txn 117",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 118,
    "date": "2026-03-03",
    "description": "Bulk demo bank txn 116",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 117,
    "date": "2026-02-23",
    "description": "Bulk demo bank txn 115",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 116,
    "date": "2026-02-18",
    "description": "Bulk demo bank txn 114",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 115,
    "date": "2026-02-13",
    "description": "Bulk demo bank txn 113",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 114,
    "date": "2026-02-08",
    "description": "Bulk demo bank txn 112",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 113,
    "date": "2026-02-03",
    "description": "Bulk demo bank txn 111",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 112,
    "date": "2026-01-23",
    "description": "Bulk demo bank txn 110",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 111,
    "date": "2026-01-18",
    "description": "Bulk demo bank txn 109",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 110,
    "date": "2026-01-13",
    "description": "Bulk demo bank txn 108",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 109,
    "date": "2026-01-08",
    "description": "Bulk demo bank txn 107",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 108,
    "date": "2026-01-03",
    "description": "Bulk demo bank txn 106",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 107,
    "date": "2025-12-23",
    "description": "Bulk demo bank txn 105",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 106,
    "date": "2025-12-18",
    "description": "Bulk demo bank txn 104",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 105,
    "date": "2025-12-13",
    "description": "Bulk demo bank txn 103",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 104,
    "date": "2025-12-08",
    "description": "Bulk demo bank txn 102",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 103,
    "date": "2025-12-03",
    "description": "Bulk demo bank txn 101",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 102,
    "date": "2025-11-23",
    "description": "Bulk demo bank txn 100",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 101,
    "date": "2025-11-18",
    "description": "Bulk demo bank txn 99",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 100,
    "date": "2025-11-13",
    "description": "Bulk demo bank txn 98",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  }
];
  ngOnInit() {}
}
