import { Component, OnInit } from '@angular/core';

export interface SectorRow {
  id: number;
  code: string;
  name: string;
  type: string;
  group: string;
  reportLine: string;
  source: string;
}

@Component({
  selector: 'app-sector-mapping',
  template: `
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div>
        <a routerLink="/accounts" class="btn btn-sm btn-outline-secondary mb-2 px-2 py-1" style="font-size: 0.82rem;">&larr; Back</a>
        <h3 class="mb-1 fw-bold text-dark" style="font-size: 1.45rem;">Sector Mapping</h3>
        <div class="text-secondary small" style="line-height: 1.45;">
          Acme Trading Co &middot; Layout: <strong>Standard Trader / Distributor</strong>. Choose the report line each income / expense ledger appears under in Financials (Sector view) and the Schedule III P&amp;L. Net Profit never changes &mdash; only where an amount is shown.
        </div>
      </div>
      <div class="d-flex gap-2 align-items-center mt-2 flex-wrap">
        <a routerLink="/accounts" class="btn btn-sm btn-outline-secondary">&larr; Chart of Accounts</a>
        <a routerLink="/accounts/coa-mapping" class="btn btn-sm btn-outline-secondary">COA Mapping</a>
        <button class="btn btn-sm btn-outline-secondary">Export (Excel)</button>
        <a routerLink="/reports/financials" class="btn btn-sm btn-outline-primary fw-medium">View Financials</a>
      </div>
    </div>

    <div class="d-flex gap-3 flex-wrap mb-4">
      <div class="p-3 rounded border text-start bg-white" style="min-width: 170px;">
        <span class="fs-4 fw-bold d-block text-dark">{{ rows.length }}</span>
        <span class="small text-muted fw-medium">All ledgers</span>
      </div>
      <div class="p-3 rounded border text-start bg-white" style="min-width: 200px;">
        <span class="fs-4 fw-bold d-block text-success">{{ rows.length }}</span>
        <span class="small text-muted fw-medium">Follows its group / your line</span>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr class="small text-muted text-uppercase">
              <th style="width: 100px;">LEDGER ID</th>
              <th>LEDGER NAME</th>
              <th style="width: 100px;">TYPE</th>
              <th>LEDGER GROUP</th>
              <th>REPORT LINE</th>
              <th>SOURCE</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows">
              <td class="fw-semibold text-secondary">{{ r.code }}</td>
              <td class="fw-medium text-dark">{{ r.name }}</td>
              <td><span class="badge" [ngClass]="r.type === 'Income' ? 'text-bg-success' : 'text-bg-warning'">{{ r.type }}</span></td>
              <td>{{ r.group }}</td>
              <td class="fw-semibold text-primary">{{ r.reportLine }}</td>
              <td><span class="badge text-bg-light border text-muted">{{ r.source }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SectorMappingComponent implements OnInit {
  rows: SectorRow[] = [
  {
    "id": 17,
    "code": "4000",
    "name": "Sales Revenue",
    "type": "Income",
    "group": "Sales Accounts",
    "reportLine": "Revenue from Operations",
    "source": "Group default"
  },
  {
    "id": 18,
    "code": "5000",
    "name": "Purchases",
    "type": "Expense",
    "group": "Purchase Accounts",
    "reportLine": "Direct Purchases",
    "source": "Group default"
  },
  {
    "id": 19,
    "code": "5100",
    "name": "Salary Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 20,
    "code": "5200",
    "name": "Rent Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 21,
    "code": "5300",
    "name": "Other Operating Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 27,
    "code": "5301",
    "name": "Utilities Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 28,
    "code": "5302",
    "name": "Telephone & Internet Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 29,
    "code": "5303",
    "name": "Marketing & Advertising Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 25,
    "code": "5900",
    "name": "Depreciation Expense",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 22,
    "code": "6000",
    "name": "Inter-Unit Stock Transfer - Out",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  },
  {
    "id": 23,
    "code": "6001",
    "name": "Inter-Unit Stock Transfer - In",
    "type": "Expense",
    "group": "Indirect Expenses",
    "reportLine": "Operating Overhead / Other Expenses",
    "source": "Group default"
  }
];
  ngOnInit() {}
}
