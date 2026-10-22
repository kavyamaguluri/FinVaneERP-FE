import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profit-loss',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Profit &amp; Loss</h3>
        <div class="subtitle">Trading Account (Gross Profit) and P&amp;L Account (Net Profit), grouped by primary/secondary group</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-danger">Export PDF</button>
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="toggleFormat()">
          {{ scheduleIII ? 'Back to Standard Format' : 'Convert to Sch III Format' }}
        </button>
      </div>
    </div>

    <!-- P&L Content Card -->
    <div class="card p-3">
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 70%;">Particulars</th>
              <th style="width: 30%;" class="text-end">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="table-light fw-bold"><td colspan="2">I. REVENUE FROM OPERATIONS</td></tr>
            <tr>
              <td class="ps-4">Sales Revenue (Goods &amp; Services)</td>
              <td class="text-end font-monospace">&#8377;1,79,10,000.00</td>
            </tr>
            <tr>
              <td class="ps-4">Other Operating Income</td>
              <td class="text-end font-monospace">&#8377;45,000.00</td>
            </tr>
            <tr class="fw-bold border-bottom">
              <td>Total Revenue (A)</td>
              <td class="text-end font-monospace text-teal" style="color: #0f766e;">&#8377;1,79,55,000.00</td>
            </tr>

            <tr class="table-light fw-bold"><td colspan="2">II. EXPENSES</td></tr>
            <tr>
              <td class="ps-4">Cost of Materials Consumed / Purchases</td>
              <td class="text-end font-monospace">&#8377;1,12,40,000.00</td>
            </tr>
            <tr>
              <td class="ps-4">Employee Benefit Expenses (Payroll &amp; CTC)</td>
              <td class="text-end font-monospace">&#8377;42,15,000.00</td>
            </tr>
            <tr>
              <td class="ps-4">Finance Costs (Bank Interest &amp; Processing)</td>
              <td class="text-end font-monospace">&#8377;3,20,000.00</td>
            </tr>
            <tr>
              <td class="ps-4">Depreciation &amp; Amortization Expense</td>
              <td class="text-end font-monospace">&#8377;4,10,000.00</td>
            </tr>
            <tr>
              <td class="ps-4">Other Operating Expenses (Rent, Utilities, Admin)</td>
              <td class="text-end font-monospace">&#8377;21,23,949.00</td>
            </tr>
            <tr class="fw-bold border-bottom">
              <td>Total Expenses (B)</td>
              <td class="text-end font-monospace">&#8377;1,83,08,949.00</td>
            </tr>

            <tr class="table-warning fw-bold fs-6">
              <td>III. PROFIT / (LOSS) BEFORE TAX (A - B)</td>
              <td class="text-end font-monospace text-danger">&#8377;-3,53,949.00</td>
            </tr>
            <tr>
              <td class="ps-4">Tax Expense (Current &amp; Deferred)</td>
              <td class="text-end font-monospace">&#8377;0.00</td>
            </tr>
            <tr class="table-success fw-bold fs-5">
              <td>IV. PROFIT / (LOSS) FOR THE PERIOD</td>
              <td class="text-end font-monospace text-danger">&#8377;-3,53,949.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ProfitLossComponent implements OnInit {
  scheduleIII = false;
  toggleFormat() { this.scheduleIII = !this.scheduleIII; }
  ngOnInit() {}
}
