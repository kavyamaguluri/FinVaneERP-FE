import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface SectorOption {
  key: string;
  label: string;
}

export interface FinancialYear {
  startYear: number;
  label: string;
  from: string;
  to: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  indirectIncomeTotal: number;
  indirectExpenseTotal: number;
  depreciation: number;
  ebitda: number;
  ebit: number;
  tax: number;
  netProfit: number;
  totalAssets: number;
  equity: number;
  debt: number;
  currentAssets: number;
  currentLiabilities: number;
  salesInvoiceCount: number;
  purchaseTotal: number;
  isProjected?: boolean;
  ratios: {
    grossMarginPct?: number;
    ebitdaMarginPct?: number;
    netMarginPct?: number;
    currentRatio?: number;
    quickRatio?: number;
    debtEquity?: number;
    roe?: number;
    roce?: number;
    assetTurnover?: number;
    dso?: number;
    dpo?: number;
    dio?: number;
    c2c?: number;
  };
}

@Component({
  selector: 'app-financial-model',
  template: `
    <!-- Page Header matching Express -->
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Corporate Finance</h3>
        <div class="subtitle text-muted small">
          Built from your own posted ledger, inventory and payroll data &mdash; Financial Modelling, Valuation, and CMA reporting in one place, with an optional sector benchmark overlay
        </div>
      </div>
    </div>

    <!-- Filter Bar matching Express partials -->
    <div class="filter-bar mb-3 p-3 bg-white border rounded shadow-sm">
      <div class="row g-2 align-items-end">
        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold text-muted">Projection Years (forward)</label>
          <select [(ngModel)]="projectionYears" class="form-select form-select-sm" (change)="loadData()">
            <option [value]="1">1 year</option>
            <option [value]="2">2 years</option>
            <option [value]="3">3 years</option>
            <option [value]="4">4 years</option>
            <option [value]="5">5 years</option>
          </select>
        </div>

        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold text-muted">Sector Benchmark</label>
          <select [(ngModel)]="selectedSector" class="form-select form-select-sm" style="min-width: 280px;" (change)="loadData()">
            <option value="">&mdash; No sector benchmark (own trend only) &mdash;</option>
            <option *ngFor="let s of sectors" [value]="s.key">{{ s.label }}</option>
          </select>
        </div>

        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-primary" (click)="loadData()" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
            Apply
          </button>
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

    <!-- Loading State -->
    <div *ngIf="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <div class="text-muted small mt-2">Computing Corporate Finance models...</div>
    </div>

    <!-- No Data Warning -->
    <div *ngIf="!loading && (!data?.model?.hasData)" class="alert alert-warning">
      No posted financial history yet &mdash; once vouchers and invoices are posted, a financial model can be built from FY-wise actuals.
    </div>

    <!-- Main Content when Data Available -->
    <div *ngIf="!loading && data?.model?.hasData">
      <!-- Nav Tabs matching Express id="cf-tabs" -->
      <ul class="nav nav-tabs mb-3" id="cf-tabs">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'modelling'" (click)="activeTab = 'modelling'" type="button">
            Financial Modelling
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'valuation'" (click)="activeTab = 'valuation'" type="button">
            Valuation Report
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'cma'" (click)="activeTab = 'cma'" type="button">
            CMA Report
          </button>
        </li>
      </ul>

      <!-- ===================== TAB 1: FINANCIAL MODELLING PANE ===================== -->
      <div *ngIf="activeTab === 'modelling'">
        <div class="alert alert-info py-2 small mb-4" style="background: #e0f2fe; color: #0369a1; border-color: #bae6fd;">
          {{ data.model.assumptions?.note }}
        </div>

        <!-- 4 Top KPI Cards -->
        <div class="row g-3 mb-4" *ngIf="latestFY">
          <div class="col-md-3">
            <div class="card p-3 kpi-card">
              <div class="kpi-label">Revenue ({{ latestFY.label }})</div>
              <div class="kpi-value">{{ (latestFY.revenue || 0) | indianCurrency:0 }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 kpi-card">
              <div class="kpi-label">EBITDA Margin</div>
              <div class="kpi-value">{{ latestFY.ratios.ebitdaMarginPct !== null && latestFY.ratios.ebitdaMarginPct !== undefined ? latestFY.ratios.ebitdaMarginPct + '%' : '&mdash;' }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 kpi-card">
              <div class="kpi-label">Net Profit</div>
              <div class="kpi-value" [ngClass]="latestFY.netProfit >= 0 ? 'text-success' : 'text-danger'">
                {{ (latestFY.netProfit || 0) | indianCurrency:0 }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 kpi-card">
              <div class="kpi-label">Forward Growth Applied</div>
              <div class="kpi-value">{{ data.model.growthRateUsedPct }}%</div>
              <div class="kpi-sub">{{ data.model.usedSectorGrowth ? 'from sector benchmark' : 'from your own historical CAGR' }}</div>
            </div>
          </div>
        </div>

        <!-- Historical & Projected Financials: Chart + Table -->
        <div class="card p-3 mb-4">
          <h6 class="fw-bold mb-3 text-dark">Historical &amp; Projected Financials</h6>
          <div class="row align-items-center">
            <div class="col-md-7">
              <div class="chart-box" style="height: 270px;">
                <p-chart type="bar" [data]="revenueChartData" [options]="revenueChartOptions" height="260px"></p-chart>
              </div>
            </div>
            <div class="col-md-5">
              <div class="table-responsive">
                <table class="table table-sm mb-0 mt-2">
                  <thead>
                    <tr class="text-muted small">
                      <th>Year</th>
                      <th class="text-end">Revenue</th>
                      <th class="text-end">EBITDA</th>
                      <th class="text-end">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let f of allFYs" [ngClass]="f.isProjected ? 'table-light text-muted fst-italic' : ''">
                      <td class="fw-semibold">{{ f.label }}</td>
                      <td class="text-end font-monospace">{{ (f.revenue || 0) | indianCurrency:0 }}</td>
                      <td class="text-end font-monospace" [class.text-danger]="f.ebitda < 0">{{ (f.ebitda || 0) | indianCurrency:0 }}</td>
                      <td class="text-end font-monospace" [class.text-danger]="f.netProfit < 0">{{ (f.netProfit || 0) | indianCurrency:0 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Row: Unit Economics & Segment Revenue -->
        <div class="row g-3 mb-4" *ngIf="latestFY">
          <!-- Unit Economics Card -->
          <div class="col-md-6">
            <div class="card p-3 h-100">
              <h6 class="fw-bold mb-3 text-dark">
                Unit Economics <span class="text-muted small fw-normal">({{ latestFY.label }})</span>
              </h6>
              <div class="table-responsive" *ngIf="data.model.unitEconomics as ue">
                <table class="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <td>Revenue per Employee</td>
                      <td class="text-end font-monospace">{{ ue.revenuePerEmployee ? (ue.revenuePerEmployee | indianCurrency:0) : '&mdash;' }}</td>
                    </tr>
                    <tr>
                      <td>Payroll Cost % of Revenue</td>
                      <td class="text-end font-monospace">{{ ue.payrollCostPctOfRevenue !== null && ue.payrollCostPctOfRevenue !== undefined ? ue.payrollCostPctOfRevenue + '%' : '&mdash;' }}</td>
                    </tr>
                    <tr>
                      <td>Average Order Value</td>
                      <td class="text-end font-monospace">{{ ue.averageOrderValue ? (ue.averageOrderValue | indianCurrency:0) : '&mdash;' }}</td>
                    </tr>
                    <tr>
                      <td>Revenue per Unit Sold</td>
                      <td class="text-end font-monospace">{{ ue.revenuePerUnit ? (ue.revenuePerUnit | indianCurrency:0) : '&mdash;' }}</td>
                    </tr>
                    <tr>
                      <td>Gross Margin per Unit</td>
                      <td class="text-end font-monospace">{{ ue.grossMarginPerUnit ? (ue.grossMarginPerUnit | indianCurrency:0) : '&mdash;' }}</td>
                    </tr>
                    <tr>
                      <td>Revenue per Customer</td>
                      <td class="text-end font-monospace">{{ ue.revenuePerCustomer ? (ue.revenuePerCustomer | indianCurrency:0) : '&mdash;' }}</td>
                    </tr>
                    <tr>
                      <td>Distinct Customers Served</td>
                      <td class="text-end font-monospace">{{ ue.distinctCustomers || 0 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p *ngIf="data.model.sector" class="small text-muted mt-3 mb-0">
                <strong>Sector context:</strong> {{ data.model.sector.unitEconomicsNote }} Metrics most relevant to {{ data.model.sector.label }} are highlighted above.
              </p>
              <p *ngIf="!data.model.sector" class="small text-muted mt-3 mb-0">
                Select a sector benchmark above to highlight the unit economics that matter most for that kind of business (e.g. Revenue per Employee for IT/ITES or SaaS, Average Order Value for E-commerce or Retail).
              </p>
            </div>
          </div>

          <!-- Segment Revenue (by Category) -->
          <div class="col-md-6">
            <div class="card p-3 h-100">
              <h6 class="fw-bold mb-3 text-dark">
                Segment Revenue <span class="text-muted small fw-normal">by category</span>
              </h6>
              <div class="row align-items-center">
                <div class="col-md-6" style="height: 190px;">
                  <p-chart type="doughnut" [data]="segmentChartData" [options]="segmentChartOptions" height="180px"></p-chart>
                </div>
                <div class="col-md-6">
                  <div class="table-responsive">
                    <table class="table table-sm mb-0">
                      <tbody>
                        <tr *ngFor="let seg of data.model.segments?.byCategory" style="cursor: pointer;" (click)="openSegmentBreakdown(seg.segment)">
                          <td>
                            <a href="javascript:void(0)" class="text-brand fw-semibold">{{ seg.segment }}</a>
                          </td>
                          <td class="text-end font-monospace">{{ (seg.revenue || 0) | indianCurrency:0 }}</td>
                          <td class="text-end text-muted small">{{ seg.sharePct }}%</td>
                        </tr>
                        <tr *ngIf="!data.model.segments?.byCategory || data.model.segments.byCategory.length === 0">
                          <td colspan="3" class="text-muted small text-center py-2">No category segments recorded.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row: Key Ratios & Benchmark Comparison -->
        <div class="row g-3 mb-4" *ngIf="latestFY">
          <!-- Key Ratios Table -->
          <div [ngClass]="data.model.benchmarkComparison ? 'col-md-6' : 'col-md-12'">
            <div class="card p-3 h-100">
              <h6 class="fw-bold mb-3 text-dark">
                Key Ratios <span class="text-muted small fw-normal">({{ latestFY.label }})</span>
              </h6>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <tbody>
                    <tr><td>Gross Margin</td><td class="text-end font-monospace">{{ latestFY.ratios.grossMarginPct !== null && latestFY.ratios.grossMarginPct !== undefined ? latestFY.ratios.grossMarginPct + '%' : '&mdash;' }}</td></tr>
                    <tr><td>EBITDA Margin</td><td class="text-end font-monospace">{{ latestFY.ratios.ebitdaMarginPct !== null && latestFY.ratios.ebitdaMarginPct !== undefined ? latestFY.ratios.ebitdaMarginPct + '%' : '&mdash;' }}</td></tr>
                    <tr><td>Net Profit Margin</td><td class="text-end font-monospace">{{ latestFY.ratios.netMarginPct !== null && latestFY.ratios.netMarginPct !== undefined ? latestFY.ratios.netMarginPct + '%' : '&mdash;' }}</td></tr>
                    <tr><td>Current Ratio</td><td class="text-end font-monospace">{{ latestFY.ratios.currentRatio !== null && latestFY.ratios.currentRatio !== undefined ? latestFY.ratios.currentRatio : '&mdash;' }}</td></tr>
                    <tr><td>Quick Ratio</td><td class="text-end font-monospace">{{ latestFY.ratios.quickRatio !== null && latestFY.ratios.quickRatio !== undefined ? latestFY.ratios.quickRatio : '&mdash;' }}</td></tr>
                    <tr><td>Debt / Equity</td><td class="text-end font-monospace">{{ latestFY.ratios.debtEquity !== null && latestFY.ratios.debtEquity !== undefined ? latestFY.ratios.debtEquity : '&mdash;' }}</td></tr>
                    <tr><td>Return on Equity (ROE)</td><td class="text-end font-monospace">{{ latestFY.ratios.roe !== null && latestFY.ratios.roe !== undefined ? latestFY.ratios.roe + '%' : '&mdash;' }}</td></tr>
                    <tr><td>Return on Capital Employed (ROCE)</td><td class="text-end font-monospace">{{ latestFY.ratios.roce !== null && latestFY.ratios.roce !== undefined ? latestFY.ratios.roce + '%' : '&mdash;' }}</td></tr>
                    <tr><td>Asset Turnover</td><td class="text-end font-monospace">{{ latestFY.ratios.assetTurnover !== null && latestFY.ratios.assetTurnover !== undefined ? latestFY.ratios.assetTurnover : '&mdash;' }}</td></tr>
                    <tr><td>DSO (Days Sales Outstanding)</td><td class="text-end font-monospace">{{ latestFY.ratios.dso !== null && latestFY.ratios.dso !== undefined ? latestFY.ratios.dso + ' days' : '&mdash;' }}</td></tr>
                    <tr><td>DPO (Days Payable Outstanding)</td><td class="text-end font-monospace">{{ latestFY.ratios.dpo !== null && latestFY.ratios.dpo !== undefined ? latestFY.ratios.dpo + ' days' : '&mdash;' }}</td></tr>
                    <tr><td>DIO (Days Inventory Outstanding)</td><td class="text-end font-monospace">{{ latestFY.ratios.dio !== null && latestFY.ratios.dio !== undefined ? latestFY.ratios.dio + ' days' : '&mdash;' }}</td></tr>
                    <tr><td>Cash Conversion Cycle (C2C)</td><td class="text-end font-monospace">{{ latestFY.ratios.c2c !== null && latestFY.ratios.c2c !== undefined ? latestFY.ratios.c2c + ' days' : '&mdash;' }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Benchmark Comparison Table (when sector selected) -->
          <div class="col-md-6" *ngIf="data.model.benchmarkComparison as bc">
            <div class="card p-3 h-100">
              <h6 class="fw-bold mb-3 text-dark">
                Benchmark Comparison <span class="text-muted small fw-normal">vs {{ bc.sectorLabel }}</span>
              </h6>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead>
                    <tr class="text-muted small">
                      <th>Metric</th>
                      <th class="text-end">Actual</th>
                      <th class="text-end">Benchmark Band</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Gross Margin</td>
                      <td class="text-end font-monospace">{{ bc.grossMargin.value !== null ? bc.grossMargin.value + '%' : '&mdash;' }}</td>
                      <td class="text-end font-monospace">{{ bc.grossMargin.band?.low }}% &ndash; {{ bc.grossMargin.band?.high }}%</td>
                      <td>
                        <span class="badge" [ngClass]="bc.grossMargin.status === 'within' || bc.grossMargin.status === 'above' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                          {{ bc.grossMargin.status === 'within' ? 'Within range' : (bc.grossMargin.status === 'above' ? 'Above range' : 'Below range') }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>EBITDA Margin</td>
                      <td class="text-end font-monospace">{{ bc.ebitdaMargin.value !== null ? bc.ebitdaMargin.value + '%' : '&mdash;' }}</td>
                      <td class="text-end font-monospace">{{ bc.ebitdaMargin.band?.low }}% &ndash; {{ bc.ebitdaMargin.band?.high }}%</td>
                      <td>
                        <span class="badge" [ngClass]="bc.ebitdaMargin.status === 'within' || bc.ebitdaMargin.status === 'above' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                          {{ bc.ebitdaMargin.status === 'within' ? 'Within range' : (bc.ebitdaMargin.status === 'above' ? 'Above range' : 'Below range') }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Net Margin</td>
                      <td class="text-end font-monospace">{{ bc.netMargin.value !== null ? bc.netMargin.value + '%' : '&mdash;' }}</td>
                      <td class="text-end font-monospace">{{ bc.netMargin.band?.low }}% &ndash; {{ bc.netMargin.band?.high }}%</td>
                      <td>
                        <span class="badge" [ngClass]="bc.netMargin.status === 'within' || bc.netMargin.status === 'above' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                          {{ bc.netMargin.status === 'within' ? 'Within range' : (bc.netMargin.status === 'above' ? 'Above range' : 'Below range') }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>DSO</td>
                      <td class="text-end font-monospace">{{ bc.dso.value !== null ? bc.dso.value + ' days' : '&mdash;' }}</td>
                      <td class="text-end font-monospace">&le; {{ bc.dso.band?.high }} days</td>
                      <td>
                        <span class="badge" [ngClass]="bc.dso.status === 'within' || bc.dso.status === 'below' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                          {{ bc.dso.status === 'within' || bc.dso.status === 'below' ? 'Within range' : 'Above range' }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>DIO</td>
                      <td class="text-end font-monospace">{{ bc.dio.value !== null ? bc.dio.value + ' days' : '&mdash;' }}</td>
                      <td class="text-end font-monospace">&le; {{ bc.dio.band?.high }} days</td>
                      <td>
                        <span class="badge" [ngClass]="bc.dio.status === 'within' || bc.dio.status === 'below' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                          {{ bc.dio.status === 'within' || bc.dio.status === 'below' ? 'Within range' : 'Above range' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <p class="text-muted small">
          Sector benchmark ranges are indicative industry figures for directional comparison, not a live market data feed. This model is a decision-support prototype, not a statutory financial statement or audited projection.
        </p>
      </div>

      <!-- ===================== TAB 2: VALUATION REPORT PANE ===================== -->
      <div *ngIf="activeTab === 'valuation'">
        <div *ngIf="!data.valuation?.hasData" class="alert alert-warning">
          No posted financial history yet to value the business from.
        </div>

        <div *ngIf="data.valuation?.hasData">
          <!-- 4 Valuation KPI Cards matching Express -->
          <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Estimated Equity Value &mdash; Low</div>
                <div class="kpi-value">{{ data.valuation.range?.low !== null && data.valuation.range?.low !== undefined ? (data.valuation.range.low | indianCurrency:0) : '&mdash;' }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Estimated Equity Value &mdash; Mid</div>
                <div class="kpi-value">{{ data.valuation.range?.mid !== null && data.valuation.range?.mid !== undefined ? (data.valuation.range.mid | indianCurrency:0) : '&mdash;' }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Estimated Equity Value &mdash; High</div>
                <div class="kpi-value">{{ data.valuation.range?.high !== null && data.valuation.range?.high !== undefined ? (data.valuation.range.high | indianCurrency:0) : '&mdash;' }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card p-3 kpi-card">
                <div class="kpi-label">Book Value (Net Worth)</div>
                <div class="kpi-value">{{ (data.valuation.bookValue?.equityValue || 0) | indianCurrency:0 }}</div>
                <div class="kpi-sub">as of {{ data.valuation.bookValue?.basisFY }}</div>
              </div>
            </div>
          </div>

          <!-- 1. DCF Section -->
          <div class="card p-3 mb-4" *ngIf="data.valuation.dcf as dcf">
            <h6 class="fw-bold mb-1 text-dark">1. Discounted Cash Flow (DCF)</h6>
            <p class="small text-muted mb-3">
              Free Cash Flow approximated as Net Profit + Depreciation for each projected year, discounted at an assumed WACC of {{ dcf.wacc }}%, with a terminal value applying {{ dcf.terminalGrowth }}% perpetuity growth beyond the projection horizon.
            </p>
            <div class="table-responsive mb-3">
              <table class="table table-sm mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Year</th>
                    <th class="text-end">Projected FCF</th>
                    <th class="text-end">Discount Factor</th>
                    <th class="text-end">Present Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of dcf.rows">
                    <td>{{ r.label }}</td>
                    <td class="text-end font-monospace">{{ (r.fcf || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ r.discountFactor }}</td>
                    <td class="text-end font-monospace">{{ (r.pvFcf || 0) | indianCurrency:0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <tbody>
                  <tr><td>Sum of PV of FCF</td><td class="text-end font-monospace">{{ (dcf.sumPvFcf || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Terminal Value <span class="text-muted small">(undiscounted)</span></td><td class="text-end font-monospace">{{ dcf.terminalValue !== null ? (dcf.terminalValue | indianCurrency:0) : 'Not computed' }}</td></tr>
                  <tr><td>PV of Terminal Value</td><td class="text-end font-monospace">{{ (dcf.pvTerminalValue || 0) | indianCurrency:0 }}</td></tr>
                  <tr class="fw-semibold"><td>Enterprise Value</td><td class="text-end font-monospace">{{ (dcf.enterpriseValue || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Less: Total Debt</td><td class="text-end font-monospace">({{ (dcf.netDebt || 0) | indianCurrency:0 }})</td></tr>
                  <tr class="fw-semibold table-light"><td>Equity Value (DCF)</td><td class="text-end font-monospace">{{ (dcf.equityValue || 0) | indianCurrency:0 }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. Comparable Multiples Section -->
          <div class="card p-3 mb-4" *ngIf="data.valuation.comparables as comp">
            <h6 class="fw-bold mb-1 text-dark">2. Comparable Multiples</h6>
            <p class="small text-muted mb-3">
              Based on {{ comp.basisFY }} actuals (EBITDA {{ (comp.ebitda || 0) | indianCurrency:0 }}, Net Profit {{ (comp.netProfit || 0) | indianCurrency:0 }}).
              <span *ngIf="comp.usedSector">Multiples from the selected sector benchmark.</span>
              <span *ngIf="!comp.usedSector">No sector selected &mdash; using default illustrative multiples (8x EV/EBITDA, 15x P/E).</span>
            </p>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Method</th>
                    <th class="text-end">Low</th>
                    <th class="text-end">Mid</th>
                    <th class="text-end">High</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>EV / EBITDA ({{ comp.evEbitdaMultiple?.low }}x &ndash; {{ comp.evEbitdaMultiple?.high }}x) &rarr; Enterprise Value</td>
                    <td class="text-end font-monospace">{{ (comp.evEbitdaValuation?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.evEbitdaValuation?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.evEbitdaValuation?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr>
                    <td class="ps-3 text-muted">&bull; Equity Value (less Total Debt)</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromEvEbitda?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromEvEbitda?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromEvEbitda?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr>
                    <td>P/E ({{ comp.peRatio?.low }}x &ndash; {{ comp.peRatio?.high }}x) &rarr; Equity Value</td>
                    <td class="text-end font-monospace">{{ (comp.peValuation?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.peValuation?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.peValuation?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr>
                    <td>Times-Revenue ({{ comp.revenueMultiple?.low }}x &ndash; {{ comp.revenueMultiple?.high }}x of Revenue {{ (comp.revenue || 0) | indianCurrency:0 }}) &rarr; Enterprise Value</td>
                    <td class="text-end font-monospace">{{ (comp.evRevenueValuation?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.evRevenueValuation?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.evRevenueValuation?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr>
                    <td class="ps-3 text-muted">&bull; Equity Value (less Total Debt)</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromRevenue?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromRevenue?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromRevenue?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr>
                    <td>Comparable Sales &mdash; Precedent Transactions (EV/EBITDA {{ comp.transactionMultiple?.low }}x &ndash; {{ comp.transactionMultiple?.high }}x, incl. {{ comp.controlPremiumPct }}% control premium) &rarr; Enterprise Value</td>
                    <td class="text-end font-monospace">{{ (comp.evTransactionValuation?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.evTransactionValuation?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.evTransactionValuation?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr>
                    <td class="ps-3 text-muted">&bull; Equity Value (less Total Debt)</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromTransaction?.low || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromTransaction?.mid || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (comp.equityFromTransaction?.high || 0) | indianCurrency:0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-muted small mt-3 mb-0">
              Times-Revenue derives an implied revenue multiple from the same EV/EBITDA band scaled by this FY's EBITDA margin -- useful when EBITDA is thin or negative. Comparable Sales applies an illustrative {{ comp.controlPremiumPct }}% control premium over the trading EV/EBITDA band.
            </p>
          </div>

          <!-- 3. Book Value Section -->
          <div class="card p-3 mb-4" *ngIf="data.valuation.bookValue as bv">
            <h6 class="fw-bold mb-2 text-dark">3. Book Value</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td>Net Worth (Equity) as of {{ bv.basisFY }}</td>
                    <td class="text-end font-monospace fw-semibold">{{ (bv.equityValue || 0) | indianCurrency:0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p class="text-muted small">
            This valuation is a decision-support illustration built from your own posted financials and standard textbook methods (DCF, market multiples, book value). It is not a certified valuation opinion, fairness opinion, or substitute for a qualified valuer / merchant banker.
          </p>
        </div>
      </div>

      <!-- ===================== TAB 3: CMA REPORT PANE ===================== -->
      <div *ngIf="activeTab === 'cma'">
        <div *ngIf="!data.cma?.hasData" class="alert alert-warning">
          No posted financial history yet to build a CMA report from.
        </div>

        <div *ngIf="data.cma?.hasData">
          <!-- 1. Operating Statement -->
          <div class="card p-3 mb-4">
            <h6 class="fw-bold mb-3 text-dark">Operating Statement</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Particulars</th>
                    <th *ngFor="let col of data.cma.operatingStatement" class="text-end">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Revenue</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace">{{ (col.revenue || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Total Expenses</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace">{{ (col.totalExpenses || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>EBITDA</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace" [class.text-danger]="col.ebitda < 0">{{ (col.ebitda || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Depreciation</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace">{{ (col.depreciation || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Profit Before Tax (PBT)</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace" [class.text-danger]="col.pbt < 0">{{ (col.pbt || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Tax</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace">{{ (col.tax || 0) | indianCurrency:0 }}</td></tr>
                  <tr class="fw-semibold"><td>Profit After Tax (PAT)</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace" [class.text-danger]="col.pat < 0">{{ (col.pat || 0) | indianCurrency:0 }}</td></tr>
                  <tr class="table-light"><td>Cash Accruals (PAT + Depreciation)</td><td *ngFor="let col of data.cma.operatingStatement" class="text-end font-monospace" [class.text-danger]="col.cashAccruals < 0">{{ (col.cashAccruals || 0) | indianCurrency:0 }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. Balance Sheet Analysis -->
          <div class="card p-3 mb-4">
            <h6 class="fw-bold mb-3 text-dark">Balance Sheet Analysis</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Particulars</th>
                    <th *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Current Assets</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ (col.currentAssets || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Current Liabilities</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ (col.currentLiabilities || 0) | indianCurrency:0 }}</td></tr>
                  <tr class="fw-semibold"><td>Net Working Capital</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ (col.netWorkingCapital || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Total Debt</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ (col.totalDebt || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Net Worth</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ (col.netWorth || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Total Assets</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ (col.totalAssets || 0) | indianCurrency:0 }}</td></tr>
                  <tr><td>Debt / Equity</td><td *ngFor="let col of data.cma.balanceSheetAnalysis" class="text-end font-monospace">{{ col.debtEquity !== null && col.debtEquity !== undefined ? col.debtEquity : '&mdash;' }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. Ratio Analysis -->
          <div class="card p-3 mb-4">
            <h6 class="fw-bold mb-3 text-dark">Ratio Analysis</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Ratio</th>
                    <th *ngFor="let col of data.cma.ratioAnalysis" class="text-end">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Current Ratio</td><td *ngFor="let col of data.cma.ratioAnalysis" class="text-end font-monospace">{{ col.currentRatio !== null && col.currentRatio !== undefined ? col.currentRatio : '&mdash;' }}</td></tr>
                  <tr><td>Debt / Equity</td><td *ngFor="let col of data.cma.ratioAnalysis" class="text-end font-monospace">{{ col.debtEquity !== null && col.debtEquity !== undefined ? col.debtEquity : '&mdash;' }}</td></tr>
                  <tr><td>Return on Capital Employed</td><td *ngFor="let col of data.cma.ratioAnalysis" class="text-end font-monospace">{{ col.roce !== null && col.roce !== undefined ? col.roce + '%' : '&mdash;' }}</td></tr>
                  <tr><td>Net Profit Margin</td><td *ngFor="let col of data.cma.ratioAnalysis" class="text-end font-monospace">{{ col.netMarginPct !== null && col.netMarginPct !== undefined ? col.netMarginPct + '%' : '&mdash;' }}</td></tr>
                  <tr><td>Asset Turnover</td><td *ngFor="let col of data.cma.ratioAnalysis" class="text-end font-monospace">{{ col.assetTurnover !== null && col.assetTurnover !== undefined ? col.assetTurnover : '&mdash;' }}</td></tr>
                  <tr><td>Debt Service Coverage Ratio (DSCR)</td><td *ngFor="let col of data.cma.ratioAnalysis" class="text-end text-muted font-monospace">Not Computed</td></tr>
                </tbody>
              </table>
            </div>
            <p class="small text-muted mt-3 mb-0">{{ data.cma.dscrCaveat }}</p>
          </div>

          <!-- 4. MPBF Section -->
          <div class="card p-3 mb-4">
            <h6 class="fw-bold mb-3 text-dark">
              MPBF &mdash; Maximum Permissible Bank Finance
              <span class="text-muted small fw-normal">(Nayak Committee Turnover Method, simplified)</span>
            </h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Projected Year</th>
                    <th class="text-end">Projected Turnover</th>
                    <th class="text-end">Working Capital Gap (20%)</th>
                    <th class="text-end">Less: Margin (5%)</th>
                    <th class="text-end">MPBF</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of data.cma.mpbf">
                    <td class="fw-semibold">{{ f.label }}</td>
                    <td class="text-end font-monospace">{{ (f.projectedTurnover || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">{{ (f.workingCapitalGap || 0) | indianCurrency:0 }}</td>
                    <td class="text-end font-monospace">({{ (f.marginMinimum || 0) | indianCurrency:0 }})</td>
                    <td class="text-end font-monospace fw-semibold">{{ (f.mpbf || 0) | indianCurrency:0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="small text-muted mt-3 mb-0">{{ data.cma.mpbfCaveat }}</p>
          </div>

          <p class="text-muted small">
            This CMA report is compiled in the standard format banks request for working-capital assessment, built from your own posted data. It is a decision-support prototype, not a substitute for your bank's own credit appraisal.
          </p>
        </div>
      </div>
    </div>

    <!-- Drill-down Modal for Category Segment Items matching Express -->
    <div class="modal fade show d-block" *ngIf="breakdownModalOpen" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ breakdownSegment }} &mdash; Item Breakdown</h5>
            <button type="button" class="btn-close" (click)="breakdownModalOpen = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small mb-3">
              Items and services within the "{{ breakdownSegment }}" category for the latest financial year in this model.
            </p>
            <div *ngIf="breakdownLoading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div *ngIf="!breakdownLoading" class="table-responsive">
              <table class="table table-sm table-hover mb-0">
                <thead>
                  <tr class="text-muted small">
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-end">Qty Sold</th>
                    <th class="text-end">Invoices</th>
                    <th class="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of breakdownRows">
                    <td class="fw-semibold">{{ r.itemName }}</td>
                    <td class="text-muted small font-monospace">{{ r.sku }}</td>
                    <td class="text-end">{{ r.qty }}</td>
                    <td class="text-end">{{ r.invoiceCount }}</td>
                    <td class="text-end font-monospace fw-semibold">{{ (r.revenue || 0) | indianCurrency:0 }}</td>
                  </tr>
                  <tr *ngIf="!breakdownRows || breakdownRows.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">No items found for this segment.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-secondary" (click)="breakdownModalOpen = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FinancialModelComponent implements OnInit {
  activeTab: 'modelling' | 'valuation' | 'cma' = 'modelling';
  projectionYears: number = 3;
  selectedSector: string = '';
  loading: boolean = false;

  data: any = null;
  sectors: SectorOption[] = [];
  allFYs: FinancialYear[] = [];
  latestFY: FinancialYear | null = null;

  revenueChartData: any;
  revenueChartOptions: any;
  segmentChartData: any;
  segmentChartOptions: any;

  breakdownModalOpen: boolean = false;
  breakdownSegment: string = '';
  breakdownRows: any[] = [];
  breakdownLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initChartOptions();
    this.loadData();
  }

  private initChartOptions() {
    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 15, font: { family: 'Inter, sans-serif' } }
        }
      },
      scales: {
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { font: { family: 'Inter, sans-serif' } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter, sans-serif' } }
        }
      }
    };

    this.segmentChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, padding: 10, font: { family: 'Inter, sans-serif' } }
        }
      }
    };
  }

  loadData() {
    this.loading = true;
    const url = `${environment.apiUrl}/financial-model?years=${this.projectionYears}&sector=${encodeURIComponent(this.selectedSector || '')}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.data) {
          this.data = res.data;
          this.sectors = res.data.sectors || [];
          const model = res.data.model;
          if (model && model.hasData) {
            const hist = model.historicalFYs || [];
            const proj = model.projectedFYs || [];
            this.allFYs = [...hist, ...proj];
            this.latestFY = hist.length ? hist[hist.length - 1] : null;

            this.buildRevenueChart();
            this.buildSegmentChart();
          } else {
            this.allFYs = [];
            this.latestFY = null;
          }
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading Corporate Finance data:', err);
      }
    });
  }

  private buildRevenueChart() {
    const labels = this.allFYs.map(f => f.label);
    const revData = this.allFYs.map(f => f.revenue);
    const ebitdaData = this.allFYs.map(f => f.ebitda);

    const revColors = this.allFYs.map(f => f.isProjected ? 'rgba(13, 148, 136, 0.35)' : '#0d9488');
    const ebitdaColors = this.allFYs.map(f => f.isProjected ? 'rgba(217, 119, 6, 0.35)' : '#d97706');

    this.revenueChartData = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revData,
          backgroundColor: revColors,
          borderRadius: 6
        },
        {
          label: 'EBITDA',
          data: ebitdaData,
          backgroundColor: ebitdaColors,
          borderRadius: 6
        }
      ]
    };
  }

  private buildSegmentChart() {
    const byCategory = this.data?.model?.segments?.byCategory || [];
    const labels = byCategory.map((c: any) => c.segment);
    const data = byCategory.map((c: any) => c.revenue);
    const palette = ['#0d9488', '#2dd4bf', '#d97706', '#6366f1', '#ec4899', '#84cc16', '#f97316', '#06b6d4'];

    this.segmentChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: palette.slice(0, labels.length),
          borderWidth: 0
        }
      ]
    };
  }

  openSegmentBreakdown(segment: string) {
    this.breakdownSegment = segment;
    this.breakdownModalOpen = true;
    this.breakdownLoading = true;
    const url = `${environment.apiUrl}/financial-model/segment-breakdown?years=${this.projectionYears}&sector=${encodeURIComponent(this.selectedSector || '')}&segment=${encodeURIComponent(segment)}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.breakdownLoading = false;
        if (res && res.success && res.data) {
          this.breakdownRows = res.data.rows || [];
        }
      },
      error: (err) => {
        this.breakdownLoading = false;
        console.error('Error loading segment breakdown:', err);
      }
    });
  }

  exportDeck() {
    window.open(`${environment.apiUrl}/financial-model/export-deck?years=${this.projectionYears}&sector=${encodeURIComponent(this.selectedSector || '')}`, '_blank');
  }

  exportPdf() {
    window.open(`${environment.apiUrl}/financial-model/export-pdf?years=${this.projectionYears}&sector=${encodeURIComponent(this.selectedSector || '')}`, '_blank');
  }
}
