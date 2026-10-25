import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-financials-schedule3',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Financials (Schedule III)</h3>
        <div class="subtitle text-muted small">
          Audit-ready statutory financial statements &mdash; Schedule III, Companies Act 2013 (Division I), with Notes to Accounts. As of 24-10-2026, for the period 07-09-2026 to 24-10-2026.
        </div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="exportPdf()">Export Full Financials (PDF)</button>
      </div>
    </div>

    <!-- Balance Sheet Section -->
    <div class="card p-4 shadow-sm border-0 bg-white mb-4">
      <h5 class="fw-bold mb-3 border-bottom pb-2">Part I &mdash; Balance Sheet as of 24-10-2026</h5>
      <table class="table table-sm align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Particulars</th>
            <th class="text-center" style="width: 100px;">Note No.</th>
            <th class="text-end" style="width: 180px;">As at 24-10-2026 (₹)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Equity and Liabilities -->
          <tr class="table-light fw-bold"><td colspan="3">I. EQUITY AND LIABILITIES</td></tr>
          <tr class="fw-bold"><td colspan="3" class="ps-3">1. Shareholders' Funds</td></tr>
          <tr><td class="ps-4">(a) Share Capital</td><td class="text-center">1</td><td class="text-end">3,00,000.00</td></tr>
          <tr><td class="ps-4">(b) Reserves and Surplus (P&amp;L)</td><td class="text-center">2</td><td class="text-end">27,000.00</td></tr>
          <tr class="fw-bold"><td colspan="3" class="ps-3">2. Current Liabilities</td></tr>
          <tr><td class="ps-4">(a) Trade Payables</td><td class="text-center">3</td><td class="text-end">0.00</td></tr>
          <tr><td class="ps-4">(b) Other Current Liabilities</td><td class="text-center">4</td><td class="text-end">0.00</td></tr>
          <tr class="fw-bold table-light"><td>TOTAL EQUITY AND LIABILITIES</td><td></td><td class="text-end">3,27,000.00</td></tr>

          <!-- Assets -->
          <tr class="table-light fw-bold"><td colspan="3">II. ASSETS</td></tr>
          <tr class="fw-bold"><td colspan="3" class="ps-3">1. Non-Current Assets</td></tr>
          <tr><td class="ps-4">(a) Property, Plant and Equipment</td><td class="text-center">5</td><td class="text-end">0.00</td></tr>
          <tr class="fw-bold"><td colspan="3" class="ps-3">2. Current Assets</td></tr>
          <tr><td class="ps-4">(a) Trade Receivables</td><td class="text-center">6</td><td class="text-end">45,000.00</td></tr>
          <tr><td class="ps-4">(b) Cash and Bank Balances</td><td class="text-center">7</td><td class="text-end">2,82,000.00</td></tr>
          <tr class="fw-bold table-light"><td>TOTAL ASSETS</td><td></td><td class="text-end">3,27,000.00</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Statement of Profit & Loss -->
    <div class="card p-4 shadow-sm border-0 bg-white">
      <h5 class="fw-bold mb-3 border-bottom pb-2">Part II &mdash; Statement of Profit and Loss for the period ended 24-10-2026</h5>
      <table class="table table-sm align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Particulars</th>
            <th class="text-center" style="width: 100px;">Note No.</th>
            <th class="text-end" style="width: 180px;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="fw-bold"><td colspan="3">I. Revenue from Operations</td></tr>
          <tr><td class="ps-4">Consulting Services Revenue</td><td class="text-center">8</td><td class="text-end">45,000.00</td></tr>
          <tr class="fw-bold table-light"><td>Total Revenue</td><td></td><td class="text-end">45,000.00</td></tr>
          <tr class="fw-bold"><td colspan="3">II. Expenses</td></tr>
          <tr><td class="ps-4">Rent Expense</td><td class="text-center">9</td><td class="text-end">18,000.00</td></tr>
          <tr class="fw-bold table-light"><td>Total Expenses</td><td></td><td class="text-end">18,000.00</td></tr>
          <tr class="fw-bold table-success"><td>III. Profit Before Tax</td><td></td><td class="text-end">27,000.00</td></tr>
          <tr><td class="ps-4">Current Tax Expense</td><td></td><td class="text-end">0.00</td></tr>
          <tr class="fw-bold table-success"><td>IV. Profit for the Period (60% margin)</td><td></td><td class="text-end">27,000.00</td></tr>
        </tbody>
      </table>
    </div>
  `
})
export class FinancialsSchedule3Component implements OnInit {
  ngOnInit() {}
  exportPdf() { window.print(); }
}
