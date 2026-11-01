import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';

export interface FixedAssetItem {
  id: number;
  code: string;
  name: string;
  category: string;
  department: string;
  branchName: string;
  locationName: string;
  depreciationMethod: string;
  purchaseDate: string;
  datePutToUse: string;
  cost: number;
  accumDep: number;
  netBookValue: number;
  projectedMonthly: number;
  status: string;
  usefulLifeYears: number;
  salvageValue: number;
  paymentMode?: string;
  coActBlock?: string;
  itActBlock?: string;
}

export interface DepreciationRunItem {
  periodMonth: number;
  periodYear: number;
  totalAmount: number;
}

export interface CategorySummary {
  category: string;
  count: number;
  netBookValue: number;
}

export interface CoActCategoryRow {
  label: string;
  methodLabel: string;
  assetsCount: number;
  cost: number;
  depreciationThisFy: number;
  accumulatedDepreciation: number;
  closingValue: number;
}

export interface ItActBlockRow {
  label: string;
  assetsCount: number;
  cost: number;
  depreciationThisFy: number;
  accumulatedDepreciation: number;
  closingValue: number;
}

const CO_ACT_DEFINITIONS: Record<string, { label: string; usefulLifeYears: number }> = {
  building_rcc: { label: 'Building â€” RCC Frame Structure', usefulLifeYears: 60 },
  building_other: { label: 'Building â€” Other than RCC Frame Structure (incl. Factory)', usefulLifeYears: 30 },
  building_temp: { label: 'Building â€” Temporary Structure', usefulLifeYears: 3 },
  plant_machinery_general: { label: 'Plant & Machinery (General, Continuous Process not covered)', usefulLifeYears: 15 },
  furniture_general: { label: 'Furniture & Fittings (General)', usefulLifeYears: 10 },
  furniture_hospitality: { label: 'Furniture & Fittings (Hotels/Schools/Cinemas/Hire)', usefulLifeYears: 8 },
  office_equipment: { label: 'Office Equipment', usefulLifeYears: 5 },
  computers_servers: { label: 'Computers â€” Servers & Networks', usefulLifeYears: 6 },
  computers_end_user: { label: 'Computers â€” End User Devices (Desktops, Laptops, etc.)', usefulLifeYears: 3 },
  motor_vehicles_two_wheeler: { label: 'Motor Vehicles â€” Motor Cycles, Scooters, Mopeds', usefulLifeYears: 10 },
  motor_vehicles_general: { label: 'Motor Vehicles â€” Cars/Buses/Lorries (Not Used on Hire)', usefulLifeYears: 8 },
  motor_vehicles_hire: { label: 'Motor Vehicles â€” Buses/Lorries/Taxis Used on Hire', usefulLifeYears: 6 },
  motor_vehicles_electric: { label: 'Electrically Operated Vehicles (incl. Battery/Fuel Cell)', usefulLifeYears: 8 },
  electrical_installations: { label: 'Electrical Installations & Equipment', usefulLifeYears: 10 },
  laboratory_equipment: { label: 'Laboratory Equipment (General)', usefulLifeYears: 10 },
  intangible_software: { label: 'Intangible Assets â€” Computer Software (per AS 26, commonly adopted)', usefulLifeYears: 3 },
};

const IT_ACT_DEFINITIONS: Record<string, { label: string; rate: number }> = {
  building_residential: { label: 'Building â€” Residential', rate: 5 },
  building_nonresidential: { label: 'Building â€” Non-Residential / Factory / Office', rate: 10 },
  building_temp: { label: 'Building â€” Purely Temporary Erections', rate: 40 },
  furniture_fittings: { label: 'Furniture & Fittings (incl. Electrical Fittings)', rate: 10 },
  plant_machinery_general: { label: 'Plant & Machinery (General)', rate: 15 },
  motor_car_general: { label: 'Motor Cars (Not Used in a Hire Business)', rate: 15 },
  motor_vehicles_hire: { label: 'Motor Buses/Lorries/Taxis Used on Hire', rate: 30 },
  motor_vehicles_electric: { label: 'Electrically Operated / EV Motor Vehicles', rate: 40 },
  computers_software: { label: 'Computers, incl. Computer Software', rate: 40 },
  books: { label: 'Books (Professional Books / Non-Annual Publications)', rate: 40 },
  pollution_energy_saving: { label: 'Air/Water Pollution Control & Energy Saving Devices', rate: 40 },
  intangibles: { label: 'Intangible Assets â€” Know-how, Patents, Copyrights, Trademarks, Licences, Franchises', rate: 25 },
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function parseISO(s: string): Date {
  const parts = s.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function fyStartYear(d: Date): number {
  return d.getUTCMonth() >= 3 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
}
function fyBounds(fyStart: number): { start: string; end: string } {
  return {
    start: iso(new Date(Date.UTC(fyStart, 3, 1))),
    end: iso(new Date(Date.UTC(fyStart + 1, 2, 31)))
  };
}
function daysInclusive(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000) + 1;
}

@Component({
  selector: 'app-fixed-assets',
  template: `
    <!-- Feedback Banner -->
    <div *ngIf="alertMessage" class="alert alert-success alert-dismissible fade show py-2 small mb-3" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 1: DASHBOARD (FAM Summary / Asset Register)                          -->
    <!-- ========================================================================= -->
    <div *ngIf="currentView === 'dashboard'">
      <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="mb-0 fw-bold">{{ activeTab === 'summary' ? 'FAM Summary' : 'Fixed Assets' }}</h3>
          <div *ngIf="activeTab === 'summary'" class="subtitle text-muted small">
            Overview of the fixed asset register and depreciation position.
          </div>
        </div>
        <div class="io-toolbar d-flex flex-wrap gap-2">
          <a routerLink="/assets/depreciation/schedule" class="btn btn-sm btn-outline-secondary">
            Statutory Depreciation Schedule
          </a>
          <a routerLink="/assets/depreciation/run" class="btn btn-sm btn-outline-secondary">
            Run Depreciation
          </a>
          <a routerLink="/assets/new" class="btn btn-primary btn-sm">
            + New Asset
          </a>
        </div>
      </div>

      <!-- Tabs matching Express _tabs.ejs -->
      <ul class="nav nav-tabs mb-3 border-bottom">
        <li class="nav-item">
          <a class="nav-link cursor-pointer" [class.active]="activeTab === 'summary'" (click)="setActiveTab('summary')">
            FAM Summary
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link cursor-pointer" [class.active]="activeTab === 'register'" (click)="setActiveTab('register')">
            Asset Register
          </a>
        </li>
      </ul>

      <!-- TAB 1: FAM SUMMARY -->
      <div *ngIf="activeTab === 'summary'">
        <!-- 4 KPI Cards matching Express dashboard.ejs exactly -->
        <div class="row g-3 mb-3">
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border bg-white">
              <div class="small text-muted fw-semibold">Gross Block</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(grossBlock) }}</div>
              <div class="small text-muted">{{ totalAssetsCount }} assets ({{ activeAssetsCount }} active)</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border bg-white">
              <div class="small text-muted fw-semibold">Accumulated Depreciation</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(totalAccumDep) }}</div>
              <div class="small text-muted">Method: Straight-line</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border bg-white">
              <div class="small text-muted fw-semibold">Net Book Value</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(netBookValue) }}</div>
              <div class="small text-muted">Gross Block &minus; Accum. Depreciation</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border bg-white">
              <div class="small text-muted fw-semibold">Projected This Period</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(projectedThisPeriod) }}</div>
              <div class="small text-muted">Already posted for this period</div>
            </div>
          </div>
        </div>

        <!-- 2 Side-by-side Tables matching Express dashboard.ejs -->
        <div class="row g-3">
          <!-- Left: Net Book Value by Category -->
          <div class="col-md-6">
            <div class="card p-3 shadow-sm border bg-white h-100">
              <h6 class="fw-bold mb-3">Net Book Value by Category</h6>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th class="text-end">Assets</th>
                      <th class="text-end">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let cat of categorySummaries">
                      <td>{{ cat.category }}</td>
                      <td class="text-end">{{ cat.count }}</td>
                      <td class="text-end">{{ formatNumber(cat.netBookValue) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right: Recent Depreciation Runs -->
          <div class="col-md-6">
            <div class="card p-3 shadow-sm border bg-white h-100">
              <h6 class="fw-bold mb-3">Recent Depreciation Runs</h6>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th class="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let run of depreciationRuns">
                      <td>{{ formatPeriod(run.periodMonth, run.periodYear) }}</td>
                      <td class="text-end">{{ formatNumber(run.totalAmount) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ASSET REGISTER -->
      <div *ngIf="activeTab === 'register'">
        <div class="card p-3 mb-3 border">
          <div class="row g-3 align-items-end">
            <div class="col-md-5">
              <div class="d-flex gap-2 align-items-end">
                <div class="flex-grow-1">
                  <label class="form-label small mb-1">
                    Depreciation Method <span class="text-muted">(applies to every asset)</span>
                  </label>
                  <select [(ngModel)]="globalMethod" class="form-select form-select-sm">
                    <option value="straight_line">Straight-line (SLM)</option>
                    <option value="wdv">Written Down Value (WDV)</option>
                  </select>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary" (click)="applyMethod()">
                  Apply Method
                </button>
              </div>
            </div>
            <div class="col-md-7">
              <div class="d-flex align-items-center">
                <button type="button" class="btn btn-sm btn-success" (click)="pushToReports()">
                  Push to Reports
                </button>
                <span class="text-muted small ms-2">
                  Posts the current period's depreciation under the method above into the ledger (Balance Sheet, P&amp;L, Trial Balance).
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-3 mb-3 border">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small text-muted">{{ assets.length }} assets</span>
            <button type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAllAssets()">
              Delete All (this view)
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Branch</th>
                  <th>Location</th>
                  <th>Method</th>
                  <th class="text-end">Cost</th>
                  <th class="text-end">Accum. Depr.</th>
                  <th class="text-end">Book Value</th>
                  <th class="text-end">Next Period's Depr.</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of assets">
                  <td><a class="text-primary fw-semibold">{{ a.code }}</a></td>
                  <td>{{ a.name }}</td>
                  <td>{{ a.category || 'â€”' }}</td>
                  <td>{{ a.department || 'â€”' }}</td>
                  <td>{{ a.branchName || 'â€”' }}</td>
                  <td>{{ a.locationName || 'â€”' }}</td>
                  <td>{{ a.depreciationMethod === 'wdv' ? 'WDV' : 'Straight-line' }}</td>
                  <td class="text-end font-monospace">{{ formatNumber(a.cost) }}</td>
                  <td class="text-end font-monospace">{{ formatNumber(a.accumDep) }}</td>
                  <td class="text-end font-monospace">{{ formatNumber(a.netBookValue) }}</td>
                  <td class="text-end font-monospace">{{ formatNumber(a.projectedMonthly) }}</td>
                  <td>
                    <span class="badge bg-success-subtle text-success border border-success-subtle">
                      {{ a.status }}
                    </span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAsset(a)">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card p-3 border">
          <h6 class="mb-2">Recent Depreciation Runs</h6>
          <table class="table table-sm mb-0">
            <thead>
              <tr>
                <th>Period</th>
                <th class="text-end">Total Posted</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let run of depreciationRuns">
                <td>{{ formatPeriod(run.periodMonth, run.periodYear) }}</td>
                <td class="text-end">{{ formatNumber(run.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: NEW ASSET FORM (Matching Express form.ejs)                        -->
    <!-- ========================================================================= -->
    <div *ngIf="currentView === 'new'">
      <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="mb-0 fw-bold">New Fixed Asset</h3>
          <div class="subtitle text-muted small">
            Record asset purchase, assign statutory blocks, and post acquisition voucher to the ledger
          </div>
        </div>
        <div class="io-toolbar">
          <a routerLink="/assets" class="btn btn-sm btn-outline-secondary">
            Back to Fixed Assets
          </a>
        </div>
      </div>

      <div class="card p-4 border bg-white shadow-sm mb-4">
        <form (ngSubmit)="saveAsset()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Asset Name</label>
              <input type="text" name="name" [(ngModel)]="newAsset.name" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold small">Category</label>
              <input type="text" name="category" [(ngModel)]="newAsset.category" class="form-control" placeholder="e.g. IT Equipment" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold small">Department</label>
              <input type="text" name="department" [(ngModel)]="newAsset.department" class="form-control" placeholder="e.g. Administration" />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold small">Branch</label>
              <input type="text" name="branchName" [(ngModel)]="newAsset.branchName" class="form-control" placeholder="e.g. Mumbai HO" />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold small">Purchase Date</label>
              <input type="date" name="purchase_date" [(ngModel)]="newAsset.purchaseDate" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold small">
                Date Put to Use <span class="text-muted small fw-normal">(defaults to purchase date)</span>
              </label>
              <input type="date" name="date_put_to_use" [(ngModel)]="newAsset.datePutToUse" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold small">Cost</label>
              <input type="number" step="0.01" name="cost" [(ngModel)]="newAsset.cost" (input)="onNewAssetCostChange()" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">
                Salvage Value <span class="text-muted small fw-normal">(defaults to 5% of cost)</span>
              </label>
              <input type="number" step="0.01" name="salvage_value" [(ngModel)]="newAsset.salvageValue" class="form-control" placeholder="Auto: 5% of cost" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Useful Life (years)</label>
              <input type="number" step="0.5" name="useful_life_years" [(ngModel)]="newAsset.usefulLifeYears" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Paid Via</label>
              <select name="payment_mode" [(ngModel)]="newAsset.paymentMode" class="form-select">
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="credit">On Credit (Accounts Payable)</option>
              </select>
            </div>
          </div>

          <hr class="my-4">

          <h6 class="mb-1 fw-bold">Statutory Depreciation Classification</h6>
          <p class="text-muted small mb-3">Selecting these lets the app auto-compute Companies Act (Schedule II) and Income Tax Act (Section 32) depreciation schedules for this asset, separately from the book depreciation above.</p>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Companies Act 2013 &mdash; Schedule II Category</label>
              <select name="co_act_block" [(ngModel)]="newAsset.coActBlock" class="form-select">
                <option value="">&mdash; Not classified &mdash;</option>
                <option value="building_rcc">Building &mdash; RCC Frame Structure (60 yrs)</option>
                <option value="building_other">Building &mdash; Other than RCC Frame Structure (incl. Factory) (30 yrs)</option>
                <option value="building_temp">Building &mdash; Temporary Structure (3 yrs)</option>
                <option value="plant_machinery_general">Plant &amp; Machinery (General, Continuous Process not covered) (15 yrs)</option>
                <option value="furniture_general">Furniture &amp; Fittings (General) (10 yrs)</option>
                <option value="furniture_hospitality">Furniture &amp; Fittings (Hotels/Schools/Cinemas/Hire) (8 yrs)</option>
                <option value="office_equipment">Office Equipment (5 yrs)</option>
                <option value="computers_servers">Computers &mdash; Servers &amp; Networks (6 yrs)</option>
                <option value="computers_end_user">Computers &mdash; End User Devices (Desktops, Laptops, etc.) (3 yrs)</option>
                <option value="motor_vehicles_two_wheeler">Motor Vehicles &mdash; Motor Cycles, Scooters, Mopeds (10 yrs)</option>
                <option value="motor_vehicles_general">Motor Vehicles &mdash; Cars/Buses/Lorries (Not Used on Hire) (8 yrs)</option>
                <option value="motor_vehicles_hire">Motor Vehicles &mdash; Buses/Lorries/Taxis Used on Hire (6 yrs)</option>
                <option value="motor_vehicles_electric">Electrically Operated Vehicles (incl. Battery/Fuel Cell) (8 yrs)</option>
                <option value="electrical_installations">Electrical Installations &amp; Equipment (10 yrs)</option>
                <option value="laboratory_equipment">Laboratory Equipment (General) (10 yrs)</option>
                <option value="intangible_software">Intangible Assets &mdash; Computer Software (per AS 26, commonly adopted) (3 yrs)</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold small">Income Tax Act &mdash; Section 32 Block</label>
              <select name="it_act_block" [(ngModel)]="newAsset.itActBlock" class="form-select">
                <option value="">&mdash; Not classified &mdash;</option>
                <option value="building_residential">Building &mdash; Residential (5% WDV)</option>
                <option value="building_nonresidential">Building &mdash; Non-Residential / Factory / Office (10% WDV)</option>
                <option value="building_temp">Building &mdash; Purely Temporary Erections (40% WDV)</option>
                <option value="furniture_fittings">Furniture &amp; Fittings (incl. Electrical Fittings) (10% WDV)</option>
                <option value="plant_machinery_general">Plant &amp; Machinery (General) (15% WDV)</option>
                <option value="motor_car_general">Motor Cars (Not Used in a Hire Business) (15% WDV)</option>
                <option value="motor_vehicles_hire">Motor Buses/Lorries/Taxis Used on Hire (30% WDV)</option>
                <option value="motor_vehicles_electric">Electrically Operated / EV Motor Vehicles (40% WDV)</option>
                <option value="computers_software">Computers, incl. Computer Software (40% WDV)</option>
                <option value="books">Books (Professional Books / Non-Annual Publications) (40% WDV)</option>
                <option value="pollution_energy_saving">Air/Water Pollution Control &amp; Energy Saving Devices (40% WDV)</option>
                <option value="intangibles">Intangible Assets &mdash; Know-how, Patents, Copyrights, Trademarks, Licences, Franchises (25% WDV)</option>
              </select>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">Save Asset</button>
            <a routerLink="/assets" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 3: STATUTORY DEPRECIATION SCHEDULE (Matching Express schedule.ejs)   -->
    <!-- ========================================================================= -->
    <div *ngIf="currentView === 'schedule'">
      <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="mb-0 fw-bold">Statutory Depreciation Schedule</h3>
          <div class="subtitle text-muted small">
            Assets grouped by Companies Act 2013 (Schedule II) category and by Income Tax Act (Section 32) block, as of {{ formatDisplayDate(asOfDate) }}
          </div>
        </div>
        <div class="io-toolbar">
          <a routerLink="/assets" class="btn btn-sm btn-outline-secondary">
            Back to Fixed Assets
          </a>
        </div>
      </div>

      <form (submit)="applyScheduleFilter($event)" class="row g-2 align-items-end mb-3">
        <div class="col-auto">
          <label class="form-label small mb-0 fw-semibold">As of Date</label>
          <input type="date" [(ngModel)]="asOfDate" name="asOfDate" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-sm btn-outline-primary">Apply</button>
        </div>
      </form>

      <!-- Companies Act Schedule II Table -->
      <div class="card p-3 mb-4 shadow-sm border bg-white">
        <h5 class="mb-1 fw-bold">Grouped by Companies Act 2013 â€” Schedule II Category</h5>
        <p class="text-muted small mb-3">
          Depreciated over each category's prescribed useful life, run from each asset's Date Put to Use, under whichever method (Straight-Line or Written Down Value) is set on that asset -- see the Method column below.
        </p>
        <div class="table-responsive">
          <table class="table table-hover table-sm mb-0 align-middle">
            <thead class="table-light small">
              <tr>
                <th>Category</th>
                <th>Method</th>
                <th class="text-end">Assets</th>
                <th class="text-end">Gross Cost</th>
                <th class="text-end">Depreciation (Current FY)</th>
                <th class="text-end">Accum. Depreciation</th>
                <th class="text-end">WDV / Closing Value</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of coActGroups">
                <td class="fw-semibold text-dark">{{ row.label }}</td>
                <td>{{ row.methodLabel }}</td>
                <td class="text-end">{{ row.assetsCount }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.cost) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.depreciationThisFy) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.accumulatedDepreciation) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.closingValue) }}</td>
              </tr>
            </tbody>
            <tfoot class="fw-bold border-top">
              <tr>
                <td>Total</td>
                <td></td>
                <td class="text-end">{{ totalCoActAssets }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalCoActCost) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalCoActDepThisFy) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalCoActAccumDep) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalCoActClosingValue) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Income Tax Act Section 32 Table -->
      <div class="card p-3 mb-4 shadow-sm border bg-white">
        <h5 class="mb-1 fw-bold">Grouped by Income Tax Act â€” Section 32 Block</h5>
        <p class="text-muted small mb-3">
          Written Down Value depreciation at the block rate, with the half-rate rule applied for assets used &lt;180 days in their year of acquisition.
        </p>
        <div class="table-responsive">
          <table class="table table-hover table-sm mb-0 align-middle">
            <thead class="table-light small">
              <tr>
                <th>Block</th>
                <th class="text-end">Assets</th>
                <th class="text-end">Gross Cost</th>
                <th class="text-end">Depreciation (Current FY)</th>
                <th class="text-end">Accum. Depreciation</th>
                <th class="text-end">WDV / Closing Value</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of itActGroups">
                <td class="fw-semibold text-dark">{{ row.label }}</td>
                <td class="text-end">{{ row.assetsCount }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.cost) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.depreciationThisFy) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.accumulatedDepreciation) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.closingValue) }}</td>
              </tr>
            </tbody>
            <tfoot class="fw-bold border-top">
              <tr>
                <td>Total</td>
                <td class="text-end">{{ totalItActAssets }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalItActCost) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalItActDepThisFy) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalItActAccumDep) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalItActClosingValue) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="small text-muted mb-0 mt-3">
          Note: this is an informational statutory schedule â€” no journal voucher is posted from these figures. Book depreciation (posted to the ledger via Run Depreciation) is calculated separately per the method chosen on each asset.
        </p>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 4: RUN DEPRECIATION                                                  -->
    <!-- ========================================================================= -->
    <div *ngIf="currentView === 'run'">
      <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="mb-0 fw-bold">Run Depreciation</h3>
          <div class="subtitle text-muted small">
            Post period depreciation to the general ledger for all active fixed assets.
          </div>
        </div>
        <div class="io-toolbar">
          <a routerLink="/assets" class="btn btn-sm btn-outline-secondary">
            Back to Fixed Assets
          </a>
        </div>
      </div>

      <div class="card p-4 border bg-white shadow-sm mb-4">
        <form (ngSubmit)="executeDepreciationRun()">
          <div class="row g-3 align-items-end mb-3">
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Period Month</label>
              <select [(ngModel)]="runMonth" name="runMonth" class="form-select form-select-sm">
                <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">{{ m }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Period Year</label>
              <input type="number" [(ngModel)]="runYear" name="runYear" class="form-control form-control-sm" />
            </div>
            <div class="col-md-4">
              <button type="submit" class="btn btn-sm btn-primary">
                Post Depreciation Voucher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FixedAssetsComponent implements OnInit, OnDestroy {
  currentView: 'dashboard' | 'new' | 'schedule' | 'run' = 'dashboard';
  activeTab: 'summary' | 'register' = 'summary';

  grossBlock: number = 1779000.00;
  totalAccumDep: number = 596352.12;
  netBookValue: number = 1182647.88;
  projectedThisPeriod: number = 21175.77;
  totalAssetsCount: number = 10;
  activeAssetsCount: number = 10;

  asOfDate: string = '';
  globalMethod: string = 'straight_line';
  alertMessage: string = '';

  runMonth: number = 10;
  runYear: number = 2026;

  assets: FixedAssetItem[] = [];
  categorySummaries: CategorySummary[] = [];
  depreciationRuns: DepreciationRunItem[] = [];

  coActGroups: CoActCategoryRow[] = [];
  itActGroups: ItActBlockRow[] = [];

  totalCoActAssets: number = 0;
  totalCoActCost: number = 0;
  totalCoActDepThisFy: number = 0;
  totalCoActAccumDep: number = 0;
  totalCoActClosingValue: number = 0;

  totalItActAssets: number = 0;
  totalItActCost: number = 0;
  totalItActDepThisFy: number = 0;
  totalItActAccumDep: number = 0;
  totalItActClosingValue: number = 0;

  newAsset = {
    name: '',
    category: '',
    department: '',
    branchName: 'Mumbai HO',
    purchaseDate: new Date().toISOString().slice(0, 10),
    datePutToUse: '',
    cost: 0,
    salvageValue: null as number | null,
    usefulLifeYears: 5,
    paymentMode: 'bank',
    coActBlock: '',
    itActBlock: ''
  };

  private sub: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    this.detectRoute();

    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectRoute();
      this.loadData();
    });

    this.route.queryParams.subscribe(params => {
      if (params['asOf']) {
        this.asOfDate = params['asOf'];
      }
      this.calculateStatutorySchedule(this.asOfDate);
    });
  }

  loadData() {
    this.http.get<any>(`${environment.apiBaseUrl}/assets/dashboard`).subscribe({
      next: (res) => {
        if (res && res.data) {
          const d = res.data;
          this.grossBlock = Number(d.grossBlock) || 0;
          this.totalAccumDep = Number(d.accumDep) || 0;
          this.netBookValue = Number(d.netBookValue) || 0;
          this.projectedThisPeriod = Number(d.projectedThisPeriod) || 0;
          this.totalAssetsCount = Number(d.assetCount) || 0;
          this.activeAssetsCount = Number(d.activeCount) || 0;
          if (d.depreciationMethod) this.globalMethod = d.depreciationMethod;
          if (d.byCategory) this.categorySummaries = d.byCategory;
          if (d.recentRuns) {
            this.depreciationRuns = d.recentRuns.map((r: any) => ({
              periodMonth: r.periodMonth,
              periodYear: r.periodYear,
              totalAmount: Number(r.totalAmount) || 0
            }));
          }
        }
      },
      error: () => {}
    });

    this.http.get<any>(`${environment.apiBaseUrl}/assets`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.assets = res.data.map((a: any) => ({
            id: a.id,
            code: a.code || a.assetCode,
            name: a.name,
            category: a.category,
            department: a.department,
            branchName: a.branchName,
            locationName: a.locationName || a.branchName || 'Main Location',
            depreciationMethod: a.depreciationMethod === 'wdv' ? 'wdv' : 'Straight-line',
            purchaseDate: a.purchaseDate,
            datePutToUse: a.datePutToUse || a.purchaseDate,
            cost: Number(a.cost) || 0,
            accumDep: Number(a.accumDep || a.accumulatedDepreciation) || 0,
            netBookValue: Number(a.netBookValue || a.bookValue) || 0,
            projectedMonthly: Number(a.projectedMonthly) || 0,
            status: a.status || 'active',
            usefulLifeYears: Number(a.usefulLifeYears) || 5,
            salvageValue: Number(a.salvageValue) || 0,
            paymentMode: a.paymentMode,
            coActBlock: a.coActBlock,
            itActBlock: a.itActBlock
          }));
          this.calculateStatutorySchedule(this.asOfDate);
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  detectRoute() {
    const url = this.router.url.split('?')[0];
    if (url.includes('/assets/new')) {
      this.currentView = 'new';
    } else if (url.includes('/assets/depreciation/schedule')) {
      this.currentView = 'schedule';
    } else if (url.includes('/assets/depreciation/run')) {
      this.currentView = 'run';
    } else if (url === '/assets') {
      this.currentView = 'dashboard';
      this.activeTab = 'register';
    } else {
      this.currentView = 'dashboard';
      this.activeTab = 'summary';
    }
  }

  setActiveTab(tab: 'summary' | 'register') {
    this.activeTab = tab;
    if (tab === 'register') {
      this.router.navigate(['/assets']);
    } else {
      this.router.navigate(['/assets/dashboard']);
    }
  }

  applyScheduleFilter(e?: Event) {
    if (e) e.preventDefault();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { asOf: this.asOfDate },
      queryParamsHandling: 'merge'
    });
    this.calculateStatutorySchedule(this.asOfDate);
  }

  calculateStatutorySchedule(asOf: string) {
    // 1. Companies Act 2013 Schedule II Schedule
    const coGroupsMap = new Map<string, {
      label: string;
      methodLabel: string;
      assetsCount: number;
      cost: number;
      depreciationThisFy: number;
      accumulatedDepreciation: number;
      closingValue: number;
    }>();

    this.assets.forEach(asset => {
      if (!asset.coActBlock || !CO_ACT_DEFINITIONS[asset.coActBlock]) return;
      const catDef = CO_ACT_DEFINITIONS[asset.coActBlock];
      const cost = asset.cost;
      const residual = (asset.salvageValue && asset.salvageValue > 0) ? asset.salvageValue : round2(cost * 0.05);
      const depreciableAmount = round2(cost - residual);
      const annualDep = round2(depreciableAmount / catDef.usefulLifeYears);

      // Compute SLM rows
      const startDateStr = asset.datePutToUse || asset.purchaseDate;
      const startDate = parseISO(startDateStr);
      const uptoDate = parseISO(asOf);

      let bookValue = cost;
      let accum = 0;
      let thisFyDep = 0;

      if (uptoDate >= startDate) {
        const acqFy = fyStartYear(startDate);
        const finalFy = fyStartYear(uptoDate);
        for (let fy = acqFy; fy <= finalFy; fy++) {
          const { start, end } = fyBounds(fy);
          const pStart = fy === acqFy ? startDateStr : start;
          const pEnd = fy === finalFy ? asOf : end;
          const fyDays = daysInclusive(start, end);
          const usedDays = daysInclusive(pStart, pEnd);
          let dep = round2(annualDep * usedDays / fyDays);
          if (round2(bookValue - dep) < residual) {
            dep = round2(bookValue - residual);
          }
          dep = Math.max(0, dep);
          bookValue = round2(bookValue - dep);
          accum = round2(accum + dep);
          if (fy === finalFy) {
            thisFyDep = dep;
          }
        }
      }

      if (!coGroupsMap.has(asset.coActBlock)) {
        coGroupsMap.set(asset.coActBlock, {
          label: catDef.label,
          methodLabel: 'Straight-Line',
          assetsCount: 0,
          cost: 0,
          depreciationThisFy: 0,
          accumulatedDepreciation: 0,
          closingValue: 0
        });
      }

      const g = coGroupsMap.get(asset.coActBlock)!;
      g.assetsCount += 1;
      g.cost = round2(g.cost + cost);
      g.depreciationThisFy = round2(g.depreciationThisFy + thisFyDep);
      g.accumulatedDepreciation = round2(g.accumulatedDepreciation + accum);
      g.closingValue = round2(g.closingValue + bookValue);
    });

    this.coActGroups = Array.from(coGroupsMap.values());
    this.totalCoActAssets = this.coActGroups.reduce((s, g) => s + g.assetsCount, 0);
    this.totalCoActCost = round2(this.coActGroups.reduce((s, g) => s + g.cost, 0));
    this.totalCoActDepThisFy = round2(this.coActGroups.reduce((s, g) => s + g.depreciationThisFy, 0));
    this.totalCoActAccumDep = round2(this.coActGroups.reduce((s, g) => s + g.accumulatedDepreciation, 0));
    this.totalCoActClosingValue = round2(this.coActGroups.reduce((s, g) => s + g.closingValue, 0));

    // 2. Income Tax Act Section 32 Schedule
    const itGroupsMap = new Map<string, {
      label: string;
      assetsCount: number;
      cost: number;
      depreciationThisFy: number;
      accumulatedDepreciation: number;
      closingValue: number;
    }>();

    this.assets.forEach(asset => {
      if (!asset.itActBlock || !IT_ACT_DEFINITIONS[asset.itActBlock]) return;
      const blockDef = IT_ACT_DEFINITIONS[asset.itActBlock];
      const rate = blockDef.rate / 100;
      const cost = asset.cost;

      const startDateStr = asset.datePutToUse || asset.purchaseDate;
      const startDate = parseISO(startDateStr);
      const uptoDate = parseISO(asOf);

      let wdv = cost;
      let accum = 0;
      let thisFyDep = 0;

      if (uptoDate >= startDate) {
        const acqFy = fyStartYear(startDate);
        const finalFy = fyStartYear(uptoDate);
        for (let fy = acqFy; fy <= finalFy; fy++) {
          const { start, end } = fyBounds(fy);
          let effRate = rate;
          if (fy === acqFy) {
            const daysUsed = daysInclusive(startDateStr, end);
            if (daysUsed < 180) {
              effRate = rate / 2;
            }
          }
          const dep = round2(wdv * effRate);
          wdv = round2(wdv - dep);
          accum = round2(accum + dep);
          if (fy === finalFy) {
            thisFyDep = dep;
          }
        }
      }

      if (!itGroupsMap.has(asset.itActBlock)) {
        itGroupsMap.set(asset.itActBlock, {
          label: blockDef.label,
          assetsCount: 0,
          cost: 0,
          depreciationThisFy: 0,
          accumulatedDepreciation: 0,
          closingValue: 0
        });
      }

      const g = itGroupsMap.get(asset.itActBlock)!;
      g.assetsCount += 1;
      g.cost = round2(g.cost + cost);
      g.depreciationThisFy = round2(g.depreciationThisFy + thisFyDep);
      g.accumulatedDepreciation = round2(g.accumulatedDepreciation + accum);
      g.closingValue = round2(g.closingValue + wdv);
    });

    this.itActGroups = Array.from(itGroupsMap.values());
    this.totalItActAssets = this.itActGroups.reduce((s, g) => s + g.assetsCount, 0);
    this.totalItActCost = round2(this.itActGroups.reduce((s, g) => s + g.cost, 0));
    this.totalItActDepThisFy = round2(this.itActGroups.reduce((s, g) => s + g.depreciationThisFy, 0));
    this.totalItActAccumDep = round2(this.itActGroups.reduce((s, g) => s + g.accumulatedDepreciation, 0));
    this.totalItActClosingValue = round2(this.itActGroups.reduce((s, g) => s + g.closingValue, 0));
  }

  formatDisplayDate(dStr: string): string {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dStr;
  }

  formatPeriod(month: number, year: number): string {
    return `${String(month).padStart(2, '0')}/${year}`;
  }

  formatNumber(val: number | null | undefined): string {
    if (val == null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onNewAssetCostChange() {
    if (this.newAsset.cost && !this.newAsset.salvageValue) {
      this.newAsset.salvageValue = round2(this.newAsset.cost * 0.05);
    }
  }

  saveAsset() {
    const payload = {
      name: this.newAsset.name,
      category: this.newAsset.category,
      department: this.newAsset.department,
      branchName: this.newAsset.branchName,
      purchaseDate: this.newAsset.purchaseDate,
      datePutToUse: this.newAsset.datePutToUse || this.newAsset.purchaseDate,
      cost: Number(this.newAsset.cost || 0),
      salvageValue: this.newAsset.salvageValue != null ? Number(this.newAsset.salvageValue) : null,
      usefulLifeYears: Number(this.newAsset.usefulLifeYears || 5),
      depreciationMethod: this.globalMethod || 'straight_line',
      paymentMode: this.newAsset.paymentMode || 'bank',
      coActBlock: this.newAsset.coActBlock,
      itActBlock: this.newAsset.itActBlock
    };

    this.http.post<any>(`${environment.apiBaseUrl}/assets`, payload).subscribe({
      next: (res) => {
        this.alertMessage = 'Fixed asset registered successfully and acquisition posted to ledger.';
        this.newAsset = {
          name: '',
          category: '',
          department: '',
          branchName: '',
          purchaseDate: '',
          datePutToUse: '',
          cost: 0,
          salvageValue: null,
          usefulLifeYears: 5,
          paymentMode: 'bank',
          coActBlock: '',
          itActBlock: ''
        };
        this.router.navigate(['/assets']);
        this.loadData();
      },
      error: (err) => {
        this.alertMessage = err?.error?.message || 'Failed to register asset.';
      }
    });
  }

  applyMethod() {
    this.http.post<any>(`${environment.apiBaseUrl}/assets/depreciation-method?method=${this.globalMethod}`, {}).subscribe({
      next: () => {
        this.alertMessage = `Company-wide depreciation method updated to ${this.globalMethod === 'wdv' ? 'Written Down Value (WDV)' : 'Straight-line (SLM)'}.`;
        this.loadData();
      },
      error: (err) => {
        this.alertMessage = err?.error?.message || 'Failed to update depreciation method.';
      }
    });
  }

  pushToReports() {
    this.http.post<any>(`${environment.apiBaseUrl}/assets/push-to-reports`, {}).subscribe({
      next: (res) => {
        this.alertMessage = `Current period depreciation of â‚¹${this.formatNumber(res?.data?.totalAmount || this.projectedThisPeriod)} successfully pushed to reports (Balance Sheet, P&L, Trial Balance).`;
        this.loadData();
      },
      error: (err) => {
        this.alertMessage = err?.error?.message || 'Failed to push depreciation to reports.';
      }
    });
  }

  deleteAsset(a: FixedAssetItem) {
    if (confirm(`Delete asset ${a.code}? This cannot be undone.`)) {
      this.http.delete<any>(`${environment.apiBaseUrl}/assets/${a.id}`).subscribe({
        next: () => {
          this.alertMessage = `Asset ${a.code} deleted.`;
          this.loadData();
        },
        error: (err) => {
          this.alertMessage = err?.error?.message || 'Failed to delete asset.';
        }
      });
    }
  }

  deleteAllAssets() {
    if (confirm(`Delete ALL ${this.assets.length} fixed assets? This cannot be undone.`)) {
      this.http.post<any>(`${environment.apiBaseUrl}/assets/delete-all`, {}).subscribe({
        next: () => {
          this.alertMessage = 'All eligible assets deleted.';
          this.loadData();
        },
        error: (err) => {
          this.alertMessage = err?.error?.message || 'Failed to delete all assets.';
        }
      });
    }
  }

  executeDepreciationRun() {
    this.http.post<any>(`${environment.apiBaseUrl}/assets/run-depreciation?month=${this.runMonth}&year=${this.runYear}`, {}).subscribe({
      next: () => {
        this.alertMessage = `Depreciation posted for period ${String(this.runMonth).padStart(2, '0')}/${this.runYear}.`;
        this.router.navigate(['/assets/dashboard']);
        this.loadData();
      },
      error: (err) => {
        this.alertMessage = err?.error?.message || 'Failed to run depreciation.';
      }
    });
  }
  // ─── Dynamic Date Helpers ────────────────────────────────────────────
  private fmt(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  getToday(): string { return this.fmt(new Date()); }
  getFyStart(): string {
    const now = new Date(); const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return fy + '-04-01';
  }
  getFyEnd(): string {
    const now = new Date(); const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return (fy + 1) + '-03-31';
  }
  getMonthStart(): string { const n = new Date(); return this.fmt(new Date(n.getFullYear(), n.getMonth(), 1)); }
  getMonthEnd(): string { const n = new Date(); return this.fmt(new Date(n.getFullYear(), n.getMonth() + 1, 0)); }
  getQuarterStart(): string {
    const now = new Date(); const mInFy = (now.getMonth() - 3 + 12) % 12;
    const qm = Math.floor(mInFy / 3) * 3 + 3;
    const yr = qm > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
    return this.fmt(new Date(yr, qm, 1));
  }
  getQuarterEnd(): string {
    const now = new Date(); const mInFy = (now.getMonth() - 3 + 12) % 12;
    const qm = Math.floor(mInFy / 3) * 3 + 3;
    const yr = qm > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
    return this.fmt(new Date(yr, qm + 3, 0));
  }
  // ─────────────────────────────────────────────────────────────────────
}


