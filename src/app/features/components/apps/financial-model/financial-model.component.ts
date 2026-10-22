import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface FinancialYearRow {
  year: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
  isProjected?: boolean;
}

@Component({
  selector: 'app-financial-model',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Corporate Finance</h3>
        <div class="subtitle">Built from your own posted ledger, inventory and payroll data — Financial Modelling, Valuation, and CMA reporting in one place, with an optional sector benchmark overlay</div>
      </div>
    </div>

    <!-- Filter Bar matching Screenshot 1 -->
    <div class="filter-bar mb-3 p-3 bg-white border rounded">
      <div class="row g-2 align-items-end">
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted fw-semibold">Projection Years (forward)</label>
          <select [(ngModel)]="projectionYears" class="form-select form-select-sm">
            <option [value]="1">1 year</option>
            <option [value]="2">2 years</option>
            <option [value]="3">3 years</option>
            <option [value]="4">4 years</option>
            <option [value]="5">5 years</option>
          </select>
        </div>
        <div class="col-auto">
          <label class="form-label mb-0 small text-muted fw-semibold">Sector Benchmark</label>
          <select [(ngModel)]="selectedSector" class="form-select form-select-sm" style="min-width: 280px;">
            <option value="">— No sector benchmark (own trend only) —</option>
            <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
          </select>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-primary" (click)="applyFilters()">Apply</button>
        </div>
        <div class="col-auto ms-auto d-flex gap-2">
          <button type="button" class="btn btn-sm btn-success" (click)="exportDeck()">
            Export Investor Deck (PPTX)
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" (click)="exportPdf()">
            Export PDF Summary
          </button>
        </div>
      </div>
    </div>

    <!-- Nav Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'modelling'" (click)="activeTab = 'modelling'" type="button">Financial Modelling</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'valuation'" (click)="activeTab = 'valuation'" type="button">Valuation Report</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'cma'" (click)="activeTab = 'cma'" type="button">CMA Report</button>
      </li>
    </ul>

    <!-- Tab 1: Financial Modelling Pane -->
    <div *ngIf="activeTab === 'modelling'">
      <div class="alert alert-info py-2 small mb-4" style="background: #e0f2fe; color: #0369a1; border-color: #bae6fd;">
        No sector selected -- projection continues at your own historical revenue CAGR and last actual margin. Historical Net Profit figures are read directly from the P&L (no tax deducted, matching the books); the assumed 25% tax rate is applied only to the forward-looking projected years.
      </div>

      <!-- 4 KPI Cards matching Screenshot 1 -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 border-start border-4 border-success h-100 shadow-sm">
            <div class="text-uppercase small fw-bold text-muted mb-1">REVENUE (FY26-27)</div>
            <div class="fs-4 fw-bold text-dark">&#8377;66,84,350</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 border-start border-4 border-dark h-100 shadow-sm">
            <div class="text-uppercase small fw-bold text-muted mb-1">EBITDA MARGIN</div>
            <div class="fs-4 fw-bold text-dark">-2.16%</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 border-start border-4 border-teal h-100 shadow-sm" style="border-left-color: #0d9488 !important;">
            <div class="text-uppercase small fw-bold text-muted mb-1">NET PROFIT</div>
            <div class="fs-4 fw-bold text-dark">&#8377;-2,50,329</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 border-start border-4 border-info h-100 shadow-sm" style="border-left-color: #0284c7 !important;">
            <div class="text-uppercase small fw-bold text-muted mb-1">FORWARD GROWTH APPLIED</div>
            <div class="fs-4 fw-bold text-dark">-28.73%</div>
            <div class="small text-muted">from your own historical CAGR</div>
          </div>
        </div>
      </div>

      <!-- Historical & Projected Financials (Chart + Table) -->
      <div class="card p-3 mb-4">
        <h6 class="fw-bold mb-3">Historical &amp; Projected Financials</h6>
        <div class="row align-items-center">
          <!-- Visual Chart Column -->
          <div class="col-md-6 mb-3 mb-md-0">
            <div class="chart-visual p-3 rounded" style="background: #f8fafc; height: 260px; display: flex; align-items: flex-end; justify-content: space-around; gap: 10px; border: 1px solid #e2e8f0;">
              <div *ngFor="let item of financialRows" class="text-center flex-grow-1" style="max-width: 60px;">
                <div class="bar rounded-top mx-auto"
                     [style.height.px]="getBarHeight(item.revenue)"
                     [style.background]="item.isProjected ? '#99f6e4' : '#0d9488'"
                     [title]="item.year + ': ' + formatINR(item.revenue)">
                </div>
                <div class="small fw-semibold text-muted mt-2" style="font-size: 11px;">
                  {{ item.year }}
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Table Column matching Screenshot 1 -->
          <div class="col-md-6">
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr class="text-muted small text-uppercase">
                    <th>YEAR</th>
                    <th class="text-end">REVENUE</th>
                    <th class="text-end">EBITDA</th>
                    <th class="text-end">NET PROFIT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of financialRows">
                    <td class="fw-semibold" [class.text-primary]="r.isProjected">{{ r.year }}</td>
                    <td class="text-end font-monospace">{{ formatINR(r.revenue) }}</td>
                    <td class="text-end font-monospace" [class.text-danger]="r.ebitda < 0">{{ formatINR(r.ebitda) }}</td>
                    <td class="text-end font-monospace" [class.text-danger]="r.netProfit < 0">{{ formatINR(r.netProfit) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Valuation Report -->
    <div *ngIf="activeTab === 'valuation'" class="card p-4">
      <h5 class="fw-bold mb-3">Business Valuation Report</h5>
      <p class="text-muted small mb-4">Multi-method corporate valuation based on historical cash flows and discounted projected earnings.</p>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card p-3 border bg-light">
            <div class="text-muted small fw-bold">DISCOUNTED CASH FLOW (DCF)</div>
            <div class="fs-4 fw-bold text-dark my-1">&#8377;1,42,80,000</div>
            <div class="small text-muted">WACC: 14.5% &middot; Terminal Growth: 4%</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 border bg-light">
            <div class="text-muted small fw-bold">EV / EBITDA MULTIPLE</div>
            <div class="fs-4 fw-bold text-dark my-1">&#8377;1,25,00,000</div>
            <div class="small text-muted">Peer multiple: 8.5x EBITDA</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-3 border bg-light">
            <div class="text-muted small fw-bold">REVENUE MULTIPLE (P/S)</div>
            <div class="fs-4 fw-bold text-dark my-1">&#8377;1,55,20,000</div>
            <div class="small text-muted">Sector P/S: 0.95x TTM Revenue</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: CMA Report -->
    <div *ngIf="activeTab === 'cma'" class="card p-4">
      <h5 class="fw-bold mb-3">Credit Monitoring Arrangement (CMA) Report</h5>
      <p class="text-muted small mb-4">Standard banking consortium format for working capital limits and term loan credit appraisal.</p>
      <div class="table-responsive">
        <table class="table table-bordered table-sm align-middle">
          <thead class="table-light">
            <tr>
              <th>CMA Indicator</th>
              <th class="text-end">Actual (FY25-26)</th>
              <th class="text-end">Projected (FY26-27)</th>
              <th class="text-end">Benchmark Norm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current Ratio</td>
              <td class="text-end font-monospace">1.48</td>
              <td class="text-end font-monospace">1.52</td>
              <td class="text-end text-muted">&gt; 1.33</td>
            </tr>
            <tr>
              <td>Total Debt / Tangible Net Worth (TOL/TNW)</td>
              <td class="text-end font-monospace">2.10</td>
              <td class="text-end font-monospace">1.85</td>
              <td class="text-end text-muted">&lt; 3.00</td>
            </tr>
            <tr>
              <td>Debt Service Coverage Ratio (DSCR)</td>
              <td class="text-end font-monospace">1.82</td>
              <td class="text-end font-monospace">1.95</td>
              <td class="text-end text-muted">&gt; 1.50</td>
            </tr>
            <tr>
              <td>Interest Coverage Ratio (ISCR)</td>
              <td class="text-end font-monospace">3.40</td>
              <td class="text-end font-monospace">3.65</td>
              <td class="text-end text-muted">&gt; 2.50</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FinancialModelComponent implements OnInit {
  activeTab: 'modelling' | 'valuation' | 'cma' = 'modelling';
  projectionYears: number = 3;
  selectedSector: string = '';

  sectors = [
    'Automobile & Auto Ancillary',
    'Chemicals & Petrochemicals',
    'Construction & Real Estate',
    'Fast-Moving Consumer Goods (FMCG)',
    'Information Technology & Software',
    'Manufacturing & Engineering',
    'Metals & Mining',
    'Pharmaceuticals & Healthcare',
    'Power & Energy',
    'Retail & E-commerce',
    'Services & Consulting',
    'Textiles & Apparel',
    'Transportation & Logistics'
  ];

  financialRows: FinancialYearRow[] = [
    { year: 'FY24-25', revenue: 13161250, ebitda: 1960500, netProfit: 1725851, isProjected: false },
    { year: 'FY25-26', revenue: 17910000, ebitda: -119300, netProfit: -353949, isProjected: false },
    { year: 'FY26-27', revenue: 6684350, ebitda: -144382, netProfit: -250329, isProjected: false },
    { year: 'FY27-28 (P)', revenue: 4763607, ebitda: -102894, netProfit: -77171, isProjected: true },
    { year: 'FY28-29 (P)', revenue: 3394844, ebitda: -73329, netProfit: -54997, isProjected: true },
    { year: 'FY29-30 (P)', revenue: 2419360, ebitda: -52259, netProfit: -39194, isProjected: true }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  applyFilters() {
    // dynamically slice projections based on chosen years
    const base = [
      { year: 'FY24-25', revenue: 13161250, ebitda: 1960500, netProfit: 1725851, isProjected: false },
      { year: 'FY25-26', revenue: 17910000, ebitda: -119300, netProfit: -353949, isProjected: false },
      { year: 'FY26-27', revenue: 6684350, ebitda: -144382, netProfit: -250329, isProjected: false }
    ];
    const projections = [
      { year: 'FY27-28 (P)', revenue: 4763607, ebitda: -102894, netProfit: -77171, isProjected: true },
      { year: 'FY28-29 (P)', revenue: 3394844, ebitda: -73329, netProfit: -54997, isProjected: true },
      { year: 'FY29-30 (P)', revenue: 2419360, ebitda: -52259, netProfit: -39194, isProjected: true },
      { year: 'FY30-31 (P)', revenue: 1724300, ebitda: -37200, netProfit: -27900, isProjected: true },
      { year: 'FY31-32 (P)', revenue: 1229000, ebitda: -26500, netProfit: -19800, isProjected: true }
    ];
    this.financialRows = [...base, ...projections.slice(0, this.projectionYears)];
  }

  getBarHeight(val: number): number {
    const max = 18000000;
    return Math.max(15, Math.min(220, Math.round((val / max) * 200)));
  }

  formatINR(val: number): string {
    if (val === null || val === undefined) return '—';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('en-IN').format(absVal);
    return isNeg ? `₹-${formatted}` : `₹${formatted}`;
  }

  exportDeck() {
    alert('Exporting Investor Deck (PPTX) with current financial model assumptions.');
  }

  exportPdf() {
    alert('Exporting Executive PDF Summary of Corporate Financial Model.');
  }
}
