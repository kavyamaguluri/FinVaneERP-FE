import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cash-flow',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Cash Flow</h3>
        <div class="subtitle">
          {{ method === 'direct' ? 'Actual cash receipts and payments, classified by the account on the other side of each entry' : 'Starts from Net Profit, adjusts for working-capital movement and non-operating activity' }}
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-sm btn-outline-danger">Export PDF</button>
      </div>
    </div>

    <!-- Nav Pills matching Express exactly -->
    <ul class="nav nav-pills mb-3">
      <li class="nav-item">
        <button type="button" class="nav-link" [class.active]="method === 'indirect'" (click)="method = 'indirect'">Indirect Method</button>
      </li>
      <li class="nav-item">
        <button type="button" class="nav-link" [class.active]="method === 'direct'" (click)="method = 'direct'">Direct Method</button>
      </li>
    </ul>

    <!-- Direct Method View -->
    <div *ngIf="method === 'direct'">
      <div class="card p-3 mb-3 d-flex flex-row justify-content-between align-items-center bg-light">
        <div><span class="text-muted small">Opening Cash &amp; Bank Balance (as on 01-04-2026)</span></div>
        <div class="fw-bold font-monospace fs-5">&#8377;15,40,000.00</div>
      </div>

      <!-- Operating Activities -->
      <div class="card p-3 mb-3">
        <h6 class="fw-bold text-dark">Operating Activities</h6>
        <div class="d-flex justify-content-between py-1 border-bottom small">
          <span>Cash received from Customers</span>
          <span class="font-monospace text-success fw-semibold">&#8377;1,45,20,000.00</span>
        </div>
        <div class="d-flex justify-content-between py-1 border-bottom small">
          <span>Cash paid to Suppliers &amp; Vendors</span>
          <span class="font-monospace text-danger fw-semibold">(&#8377;98,40,000.00)</span>
        </div>
        <div class="d-flex justify-content-between py-1 border-bottom small">
          <span>Salaries &amp; Employee Benefits Paid</span>
          <span class="font-monospace text-danger fw-semibold">(&#8377;35,50,000.00)</span>
        </div>
        <div class="d-flex justify-content-between py-2 border-top fw-bold">
          <span>Net Cash from Operating Activities</span>
          <span class="font-monospace text-success">&#8377;11,30,000.00</span>
        </div>
      </div>

      <!-- Investing Activities -->
      <div class="card p-3 mb-3">
        <h6 class="fw-bold text-dark">Investing Activities</h6>
        <div class="d-flex justify-content-between py-1 border-bottom small">
          <span>Purchase of Fixed Assets (Plant &amp; Hardware)</span>
          <span class="font-monospace text-danger fw-semibold">(&#8377;4,50,000.00)</span>
        </div>
        <div class="d-flex justify-content-between py-2 border-top fw-bold">
          <span>Net Cash from Investing Activities</span>
          <span class="font-monospace text-danger">(&#8377;4,50,000.00)</span>
        </div>
      </div>

      <!-- Financing Activities -->
      <div class="card p-3 mb-3">
        <h6 class="fw-bold text-dark">Financing Activities</h6>
        <div class="d-flex justify-content-between py-1 border-bottom small">
          <span>Repayment of Long-Term Loan</span>
          <span class="font-monospace text-danger fw-semibold">(&#8377;2,00,000.00)</span>
        </div>
        <div class="d-flex justify-content-between py-1 border-bottom small">
          <span>Finance Charges / Interest Paid</span>
          <span class="font-monospace text-danger fw-semibold">(&#8377;75,130.00)</span>
        </div>
        <div class="d-flex justify-content-between py-2 border-top fw-bold">
          <span>Net Cash from Financing Activities</span>
          <span class="font-monospace text-danger">(&#8377;2,75,130.00)</span>
        </div>
      </div>

      <!-- Closing Balance -->
      <div class="card p-3 d-flex flex-row justify-content-between align-items-center bg-brand-soft border-teal" style="border-color: #0d9488 !important;">
        <div><span class="fw-bold text-dark">Closing Cash &amp; Bank Balance (as on 22-10-2026)</span></div>
        <div class="fw-bold font-monospace fs-4 text-teal" style="color: #0f766e;">&#8377;19,44,870.00</div>
      </div>
    </div>

    <!-- Indirect Method View -->
    <div *ngIf="method === 'indirect'" class="card p-3">
      <h6 class="fw-bold text-dark mb-3">Cash Flow from Operating Activities (Indirect Method)</h6>
      <div class="d-flex justify-content-between py-1 border-bottom small">
        <span>Net Profit / (Loss) Before Tax</span>
        <span class="font-monospace text-danger fw-semibold">(&#8377;3,53,949.00)</span>
      </div>
      <div class="d-flex justify-content-between py-1 border-bottom small">
        <span>Adjustment for Depreciation</span>
        <span class="font-monospace text-success fw-semibold">&#8377;4,10,000.00</span>
      </div>
      <div class="d-flex justify-content-between py-1 border-bottom small">
        <span>Adjustment for Finance Cost</span>
        <span class="font-monospace text-success fw-semibold">&#8377;3,20,000.00</span>
      </div>
      <div class="d-flex justify-content-between py-1 border-bottom small">
        <span>Working Capital Changes (Receivables, Payables, Inventories)</span>
        <span class="font-monospace text-success fw-semibold">&#8377;7,53,949.00</span>
      </div>
      <div class="d-flex justify-content-between py-2 border-top fw-bold">
        <span>Net Operating Cash Flow</span>
        <span class="font-monospace text-success">&#8377;11,30,000.00</span>
      </div>
    </div>
  `
})
export class CashFlowComponent implements OnInit {
  method: 'direct' | 'indirect' = 'direct';
  ngOnInit() {}
}
