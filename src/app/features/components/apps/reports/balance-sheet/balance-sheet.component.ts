import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-balance-sheet',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Balance Sheet</h3>
        <div class="subtitle">Statement of financial position — Equity, Non-Current &amp; Current Liabilities, and Assets</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-danger">Export PDF</button>
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="toggleFormat()">
          {{ scheduleIII ? 'Back to Standard Format' : 'Convert to Sch III Format' }}
        </button>
      </div>
    </div>

    <!-- Period Filter Bar -->
    <div class="filter-bar p-3 bg-white border rounded mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted">As of Date</label>
          <input type="date" [(ngModel)]="asOfDate" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-primary btn-sm">Apply</button>
        </div>
      </div>
    </div>

    <!-- Balance Sheet Content -->
    <div class="row g-3">
      <!-- Liabilities Side -->
      <div class="col-md-6">
        <div class="card p-3 h-100">
          <h5 class="fw-bold mb-3 text-dark border-bottom pb-2">EQUITY &amp; LIABILITIES</h5>
          
          <h6 class="fw-bold text-muted small text-uppercase">1. Shareholders' Funds / Capital</h6>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Share Capital</span>
            <span class="font-monospace fw-semibold">&#8377;50,00,000.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small mb-3">
            <span>Reserves &amp; Surplus (P&amp;L)</span>
            <span class="font-monospace fw-semibold">&#8377;12,45,820.00</span>
          </div>

          <h6 class="fw-bold text-muted small text-uppercase">2. Non-Current Liabilities</h6>
          <div class="d-flex justify-content-between py-1 border-bottom small mb-3">
            <span>Long-term Borrowings</span>
            <span class="font-monospace fw-semibold">&#8377;25,00,000.00</span>
          </div>

          <h6 class="fw-bold text-muted small text-uppercase">3. Current Liabilities</h6>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Sundry Creditors (Trade Payables)</span>
            <span class="font-monospace fw-semibold">&#8377;8,35,400.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Duties &amp; Taxes Payable</span>
            <span class="font-monospace fw-semibold">&#8377;1,24,150.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Payroll Payables (PF, ESIC, PT)</span>
            <span class="font-monospace fw-semibold">&#8377;5,53,000.00</span>
          </div>

          <div class="d-flex justify-content-between mt-auto pt-3 border-top border-2 border-dark fw-bold fs-6">
            <span>TOTAL LIABILITIES</span>
            <span class="font-monospace">&#8377;1,02,58,370.00</span>
          </div>
        </div>
      </div>

      <!-- Assets Side -->
      <div class="col-md-6">
        <div class="card p-3 h-100">
          <h5 class="fw-bold mb-3 text-dark border-bottom pb-2">ASSETS</h5>

          <h6 class="fw-bold text-muted small text-uppercase">1. Non-Current Assets</h6>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Property, Plant &amp; Equipment (Gross Block)</span>
            <span class="font-monospace fw-semibold">&#8377;42,00,000.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small mb-3">
            <span>Less: Accumulated Depreciation</span>
            <span class="font-monospace text-danger fw-semibold">(&#8377;6,50,000.00)</span>
          </div>

          <h6 class="fw-bold text-muted small text-uppercase">2. Current Assets</h6>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Inventories (Stock in Hand)</span>
            <span class="font-monospace fw-semibold">&#8377;18,25,000.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Sundry Debtors (Trade Receivables)</span>
            <span class="font-monospace fw-semibold">&#8377;24,18,500.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Cash and Bank Balances (HDFC Operating)</span>
            <span class="font-monospace fw-semibold">&#8377;21,44,870.00</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom small">
            <span>Input GST Credit Balance</span>
            <span class="font-monospace fw-semibold">&#8377;3,20,000.00</span>
          </div>

          <div class="d-flex justify-content-between mt-auto pt-3 border-top border-2 border-dark fw-bold fs-6">
            <span>TOTAL ASSETS</span>
            <span class="font-monospace text-teal" style="color: #0f766e;">&#8377;1,02,58,370.00</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BalanceSheetComponent implements OnInit {
  asOfDate: string = '2026-10-22';
  scheduleIII = false;
  toggleFormat() { this.scheduleIII = !this.scheduleIII; }
  ngOnInit() {}
}
