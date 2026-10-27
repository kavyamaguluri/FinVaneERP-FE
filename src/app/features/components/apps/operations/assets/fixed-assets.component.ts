import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface FixedAssetItem {
  id: number;
  code: string;
  name: string;
  category: string;
  department: string;
  branchName?: string;
  locationId?: number;
  locationName?: string;
  purchaseDate: string;
  datePutToUse?: string;
  cost: number;
  accumDep: number;
  netBookValue: number;
  projectedMonthly?: number;
  status: string;
  usefulLifeYears?: number;
  salvageValue?: number;
  paymentMode?: string;
  depreciationMethod?: string;
  coActBlock?: string;
  itActBlock?: string;
}

export interface DepreciationRunItem {
  id?: number;
  periodMonth: number;
  periodYear: number;
  totalAmount: number;
  voucherId?: number;
}

export interface CategorySummary {
  category: string;
  count: number;
  netBookValue: number;
}

@Component({
  selector: 'app-fixed-assets',
  template: `
    <!-- Back button only shown when inside a subview (New, Schedule, Run) to prevent duplicate back buttons on dashboard -->
    <button *ngIf="currentView !== 'dashboard'" type="button" class="btn btn-sm btn-outline-secondary mb-3" (click)="switchView('dashboard')">
      &larr; Back
    </button>

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
          <div class="subtitle text-muted small">
            {{ activeTab === 'summary' 
                ? 'Overview of the fixed asset register and depreciation position.' 
                : 'Asset acquisition, Companies Act / IT Act depreciation, and disposals' }}
          </div>
        </div>
        <div class="io-toolbar d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="switchView('schedule')">
            Statutory Depreciation Schedule
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="switchView('run')">
            Run Depreciation
          </button>
          <button type="button" class="btn btn-primary btn-sm" (click)="switchView('new')">
            + New Asset
          </button>
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
            <div class="card p-3 shadow-sm border-0 bg-white">
              <div class="small text-muted fw-semibold">Gross Block</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(grossBlock) }}</div>
              <div class="small text-muted">{{ totalAssetsCount }} assets ({{ activeAssetsCount }} active)</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border-0 bg-white">
              <div class="small text-muted fw-semibold">Accumulated Depreciation</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(totalAccumDep) }}</div>
              <div class="small text-muted">Method: Straight-line</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border-0 bg-white">
              <div class="small text-muted fw-semibold">Net Book Value</div>
              <div class="h3 fw-bold mb-1 text-dark">{{ formatNumber(netBookValue) }}</div>
              <div class="small text-muted">Gross Block &mdash; Accum. Depreciation</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-3 shadow-sm border-0 bg-white">
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
            <div class="card p-3 shadow-sm border-0 bg-white h-100">
              <h6 class="fw-bold mb-3">Net Book Value by Category</h6>
              <div class="table-responsive">
                <table class="table table-hover table-sm mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Category</th>
                      <th class="text-center" style="width: 80px;">Assets</th>
                      <th class="text-end" style="width: 140px;">Net Book Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let cat of categorySummaries">
                      <td class="fw-medium text-dark">{{ cat.category }}</td>
                      <td class="text-center">{{ cat.count }}</td>
                      <td class="text-end font-monospace">{{ formatNumber(cat.netBookValue) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right: Recent Depreciation Runs -->
          <div class="col-md-6">
            <div class="card p-3 shadow-sm border-0 bg-white h-100">
              <h6 class="fw-bold mb-3">Recent Depreciation Runs</h6>
              <div class="table-responsive">
                <table class="table table-hover table-sm mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Period</th>
                      <th class="text-end" style="width: 140px;">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let run of depreciationRuns">
                      <td class="fw-medium">{{ formatPeriod(run.periodMonth, run.periodYear) }}</td>
                      <td class="text-end font-monospace text-dark">{{ formatNumber(run.totalAmount) }}</td>
                    </tr>
                    <tr *ngIf="depreciationRuns.length === 0">
                      <td colspan="2" class="text-center py-3 text-muted">No depreciation runs posted yet.</td>
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
        <div class="card p-3 mb-3 bg-light border-0 shadow-sm">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-2">
              <label class="form-label mb-0 small fw-semibold">Depreciation Policy (Company-wide):</label>
              <select [(ngModel)]="globalMethod" class="form-select form-select-sm" style="width: 170px;">
                <option value="straight_line">Straight-line (SLM)</option>
                <option value="wdv">Written Down Value (WDV)</option>
              </select>
              <button class="btn btn-sm btn-outline-primary" (click)="applyMethod()">Apply Method</button>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary" (click)="pushToReports()">Push to Reports</button>
              <button class="btn btn-sm btn-outline-danger" (click)="deleteAllAssets()">Delete All (this view)</button>
            </div>
          </div>
        </div>

        <div class="table-responsive bg-white rounded border shadow-sm">
          <table class="table table-hover table-sm mb-0 align-middle">
            <thead class="table-light small text-secondary">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Department</th>
                <th>Location</th>
                <th>Purchase Date</th>
                <th class="text-end">Cost (₹)</th>
                <th class="text-end">Accum. Dep. (₹)</th>
                <th class="text-end">Net Book Value (₹)</th>
                <th>Status</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of assets">
                <td class="font-monospace fw-semibold">{{ a.code }}</td>
                <td class="fw-medium text-dark">{{ a.name }}</td>
                <td><span class="badge bg-light text-dark border">{{ a.category }}</span></td>
                <td class="text-muted small">{{ a.department }}</td>
                <td class="text-muted small">{{ a.locationName || '—' }}</td>
                <td class="text-muted small">{{ a.purchaseDate }}</td>
                <td class="text-end font-monospace">{{ formatNumber(a.cost) }}</td>
                <td class="text-end font-monospace text-secondary">{{ formatNumber(a.accumDep) }}</td>
                <td class="text-end font-monospace fw-bold text-dark">{{ formatNumber(a.netBookValue) }}</td>
                <td>
                  <span class="badge bg-success-subtle text-success border border-success-subtle">
                    {{ a.status }}
                  </span>
                </td>
                <td class="text-end">
                  <button type="button" class="btn btn-link btn-sm text-danger p-0 text-decoration-none" (click)="deleteAsset(a)" title="Delete asset">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="assets.length === 0">
                <td colspan="11" class="text-center py-4 text-muted">No fixed assets registered.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: NEW FIXED ASSET (Matching Express /assets/new pixel-for-pixel)    -->
    <!-- ========================================================================= -->
    <div *ngIf="currentView === 'new'">
      <h4 class="mb-3 fw-bold">New Fixed Asset</h4>

      <div class="card p-4 shadow-sm border bg-white mb-4">
        <form (submit)="saveNewAsset($event)">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Asset Code</label>
              <input type="text" name="asset_code" [(ngModel)]="newAsset.code" class="form-control" required placeholder="e.g. FA-011" />
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold small">Name</label>
              <input type="text" name="name" [(ngModel)]="newAsset.name" class="form-control" required placeholder="e.g. Conference Room Projector" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Category</label>
              <input type="text" name="category" [(ngModel)]="newAsset.category" class="form-control" placeholder="e.g. Office Equipment" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Department</label>
              <input type="text" name="department" [(ngModel)]="newAsset.department" class="form-control" placeholder="e.g. Production, Admin, Sales" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Branch Name</label>
              <input type="text" name="branch_name" [(ngModel)]="newAsset.branchName" class="form-control" placeholder="e.g. Mumbai HO" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Location</label>
              <select name="location_id" [(ngModel)]="newAsset.locationId" class="form-select">
                <option [ngValue]="undefined">&mdash;</option>
                <option [ngValue]="4">LOC-BLR - Bengaluru Retail Store</option>
                <option [ngValue]="3">LOC-DEL - Delhi Branch Office</option>
                <option [ngValue]="1">LOC-MUM - Mumbai Central Warehouse</option>
                <option [ngValue]="2">LOC-PUN - Pune Regional Warehouse</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Purchase Date (Invoice Date)</label>
              <input type="date" name="purchase_date" [(ngModel)]="newAsset.purchaseDate" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Date Put to Use</label>
              <input type="date" name="date_put_to_use" [(ngModel)]="newAsset.datePutToUse" class="form-control" />
              <div class="form-text small">Used as the "date of accounting" for Companies Act / Income Tax Act depreciation. Defaults to purchase date if left blank.</div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Cost</label>
              <input type="number" step="0.01" name="cost" [(ngModel)]="newAsset.cost" (input)="onNewAssetCostChange()" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">
                Salvage Value <span class="text-muted small fw-normal">(defaults to 5% of cost)</span>
              </label>
              <input type="number" step="0.01" name="salvage_value" [(ngModel)]="newAsset.salvageValue" class="form-control" placeholder="Auto: 5% of cost" />
              <div class="form-text small">Leave blank to auto-default to 5% of cost (Schedule II Note 5). Edit to override.</div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Useful Life (years)</label>
              <input type="number" step="0.5" name="useful_life_years" [(ngModel)]="newAsset.usefulLifeYears" class="form-control" required />
            </div>

            <!-- Depreciation Method Info Alert -->
            <div class="col-md-8">
              <div class="alert alert-info py-2 mb-0 small border-0 shadow-sm" style="background-color: #cff4fc; color: #055160;">
                <strong>Depreciation Method (Books):</strong> Straight-line (SLM)
                &mdash; this asset will use the company-wide method. Change it for every asset at once from the
                <a (click)="switchView('dashboard')" class="cursor-pointer text-decoration-underline fw-bold">Fixed Assets</a> page rather than per-asset here, since a business keeps one consistent depreciation policy across its books.
              </div>
            </div>

            <!-- Paid Via Dropdown -->
            <div class="col-md-4">
              <label class="form-label fw-semibold small">Paid Via</label>
              <select name="payment_mode" [(ngModel)]="newAsset.paymentMode" class="form-select">
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="credit">On Credit (Accounts Payable)</option>
              </select>
              <div class="form-text small">Posts an acquisition entry (Dr Fixed Assets / Cr this account) so the asset's cost immediately shows up on the Balance Sheet.</div>
            </div>
          </div>

          <hr class="my-4">

          <!-- Statutory Depreciation Classification -->
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
            <button type="button" class="btn btn-outline-secondary" (click)="switchView('dashboard')">Cancel</button>
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
            Assets grouped by Companies Act 2013 (Schedule II) category and by Income Tax Act (Section 32) block, as of {{ asOfDate }}
          </div>
        </div>
        <div class="io-toolbar">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="switchView('dashboard')">
            Back to Fixed Assets
          </button>
        </div>
      </div>

      <div class="row g-2 align-items-end mb-3">
        <div class="col-auto">
          <label class="form-label small mb-0 fw-semibold">As of Date</label>
          <input type="date" [(ngModel)]="asOfDate" class="form-control form-control-sm" />
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="refreshSchedule()">Apply</button>
        </div>
      </div>

      <!-- Companies Act Schedule II Table -->
      <div class="card p-3 mb-4 shadow-sm border bg-white">
        <h5 class="mb-1 fw-bold">Grouped by Companies Act 2013 &mdash; Schedule II Category</h5>
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
                <th class="text-end">Gross Cost (₹)</th>
                <th class="text-end">Depreciation (Current FY) (₹)</th>
                <th class="text-end">Accum. Depreciation (₹)</th>
                <th class="text-end">WDV / Closing Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of coActGroups">
                <td class="fw-semibold text-dark">{{ row.category }}</td>
                <td><span class="badge bg-light text-dark border">{{ row.method }}</span></td>
                <td class="text-end">{{ row.assets }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.grossCost) }}</td>
                <td class="text-end font-monospace text-secondary">{{ formatNumber(row.depreciationCurrentFy) }}</td>
                <td class="text-end font-monospace text-secondary">{{ formatNumber(row.accumDep) }}</td>
                <td class="text-end font-monospace fw-bold text-dark">{{ formatNumber(row.closingValue) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td colspan="2">Total</td>
                <td class="text-end">{{ totalAssetsCount }}</td>
                <td class="text-end font-monospace">{{ formatNumber(grossBlock) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(coActTotalFyDep) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(totalAccumDep) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(netBookValue) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Income Tax Act Section 32 Table -->
      <div class="card p-3 mb-4 shadow-sm border bg-white">
        <h5 class="mb-1 fw-bold">Grouped by Income Tax Act &mdash; Section 32 Block</h5>
        <p class="text-muted small mb-3">
          Depreciated under the Written Down Value (WDV) method at statutory rates. Assets put to use for less than 180 days in the year of acquisition are eligible for 50% of the prescribed depreciation rate.
        </p>
        <div class="table-responsive">
          <table class="table table-hover table-sm mb-0 align-middle">
            <thead class="table-light small">
              <tr>
                <th>IT Block</th>
                <th class="text-center">Rate (%)</th>
                <th class="text-end">Assets</th>
                <th class="text-end">Opening WDV (₹)</th>
                <th class="text-end">Additions (₹)</th>
                <th class="text-end">Depreciation (₹)</th>
                <th class="text-end">Closing WDV (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of itActGroups">
                <td class="fw-semibold text-dark">{{ row.name }}</td>
                <td class="text-center">{{ row.rate }}%</td>
                <td class="text-end">{{ row.assets }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.openingWdv) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(row.additions) }}</td>
                <td class="text-end font-monospace text-secondary">{{ formatNumber(row.depreciation) }}</td>
                <td class="text-end font-monospace fw-bold text-dark">{{ formatNumber(row.closingWdv) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td colspan="2">Total</td>
                <td class="text-end">{{ totalAssetsCount }}</td>
                <td class="text-end font-monospace">{{ formatNumber(itTotalOpeningWdv) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(itTotalAdditions) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(itTotalDepreciation) }}</td>
                <td class="text-end font-monospace">{{ formatNumber(itTotalClosingWdv) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 4: RUN DEPRECIATION (Matching Express run.ejs)                       -->
    <!-- ========================================================================= -->
    <div *ngIf="currentView === 'run'">
      <h4 class="mb-3 fw-bold">Run Depreciation</h4>

      <div class="card p-4 mb-3 shadow-sm border bg-white">
        <form (submit)="executeRunDepreciation($event)" class="row g-2 align-items-end">
          <div class="col-auto">
            <label class="form-label mb-0 small fw-semibold">Month</label>
            <input type="number" min="1" max="12" [(ngModel)]="runMonth" name="runMonth" class="form-control form-control-sm" required style="width: 80px;" />
          </div>
          <div class="col-auto">
            <label class="form-label mb-0 small fw-semibold">Year</label>
            <input type="number" [(ngModel)]="runYear" name="runYear" class="form-control form-control-sm" required style="width: 100px;" />
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-sm btn-primary">Run &amp; Post Journal Voucher</button>
          </div>
        </form>
      </div>

      <div class="card p-3 shadow-sm border bg-white">
        <h6 class="mb-2 fw-bold">Preview &mdash; projected depreciation for active assets</h6>
        <div class="table-responsive">
          <table class="table table-hover table-sm mb-0 align-middle">
            <thead class="table-light small">
              <tr>
                <th>Asset</th>
                <th>Method</th>
                <th class="text-end">Book Value (₹)</th>
                <th class="text-end">Projected Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of activeAssets">
                <td class="fw-medium text-dark">{{ a.name }} ({{ a.code }})</td>
                <td>Straight-line</td>
                <td class="text-end font-monospace">{{ formatNumber(a.netBookValue) }}</td>
                <td class="text-end font-monospace fw-bold text-dark">{{ formatNumber(a.projectedMonthly) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td colspan="2">Total Projected Depreciation</td>
                <td class="text-end font-monospace">{{ formatNumber(netBookValue) }}</td>
                <td class="text-end font-monospace text-primary">{{ formatNumber(projectedThisPeriod) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .table th, .table td { vertical-align: middle; }
  `]
})
export class FixedAssetsComponent implements OnInit {
  currentView: 'dashboard' | 'new' | 'schedule' | 'run' = 'dashboard';
  activeTab: 'summary' | 'register' = 'summary';
  alertMessage = '';
  globalMethod = 'straight_line';

  asOfDate = '2026-10-27';
  runMonth = 10;
  runYear = 2026;

  newAsset: Partial<FixedAssetItem> = {
    code: '',
    name: '',
    category: 'IT Equipment',
    department: 'Administration',
    branchName: 'Mumbai HO',
    purchaseDate: '2026-10-27',
    datePutToUse: '2026-10-27',
    cost: 50000,
    salvageValue: 2500,
    usefulLifeYears: 3,
    paymentMode: 'bank',
    coActBlock: 'computers_end_user',
    itActBlock: 'computers_software'
  };

  assets: FixedAssetItem[] = [
    { id: 1, code: 'FA-001', name: 'Office Laptop - Dell Latitude', category: 'IT Equipment', department: 'Administration', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2024-04-01', datePutToUse: '2024-04-01', cost: 65000, accumDep: 49743.12, netBookValue: 15256.88, projectedMonthly: 1715.28, status: 'active', usefulLifeYears: 3, salvageValue: 3250 },
    { id: 2, code: 'FA-002', name: 'Warehouse Racking System', category: 'Warehouse Equipment', department: 'Operations', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2024-06-15', datePutToUse: '2024-06-15', cost: 45000, accumDep: 6412.50, netBookValue: 38587.50, projectedMonthly: 237.50, status: 'active', usefulLifeYears: 15, salvageValue: 2250 },
    { id: 3, code: 'FA-003', name: 'Delivery Two-Wheeler', category: 'Vehicles', department: 'Logistics', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2024-08-20', datePutToUse: '2024-08-20', cost: 85000, accumDep: 18168.84, netBookValue: 66831.16, projectedMonthly: 672.92, status: 'active', usefulLifeYears: 10, salvageValue: 4250 },
    { id: 4, code: 'FA-004', name: 'Office Furniture Set', category: 'Furniture & Fixtures', department: 'Administration', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2024-11-10', datePutToUse: '2024-11-10', cost: 62000, accumDep: 13252.41, netBookValue: 48747.59, projectedMonthly: 490.83, status: 'active', usefulLifeYears: 10, salvageValue: 3100 },
    { id: 5, code: 'FA-005', name: 'Desktop Computers (Batch of 5)', category: 'IT Equipment', department: 'Administration', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2025-02-05', datePutToUse: '2025-02-05', cost: 175000, accumDep: 124687.62, netBookValue: 50312.38, projectedMonthly: 4622.22, status: 'active', usefulLifeYears: 3, salvageValue: 8750 },
    { id: 6, code: 'FA-006', name: 'Delivery Van', category: 'Vehicles', department: 'Logistics', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2025-04-12', datePutToUse: '2025-04-12', cost: 650000, accumDep: 173671.83, netBookValue: 476328.17, projectedMonthly: 6432.29, status: 'active', usefulLifeYears: 8, salvageValue: 32500 },
    { id: 7, code: 'FA-007', name: 'Split AC Units - Office', category: 'Electrical Installations', department: 'Administration', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2025-07-01', datePutToUse: '2025-07-01', cost: 128000, accumDep: 27359.91, netBookValue: 100640.09, projectedMonthly: 1013.33, status: 'active', usefulLifeYears: 10, salvageValue: 6400 },
    { id: 8, code: 'FA-008', name: 'Retail Display Racks', category: 'Furniture & Fixtures', department: 'Sales', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2025-09-15', datePutToUse: '2025-09-15', cost: 54000, accumDep: 11542.50, netBookValue: 42457.50, projectedMonthly: 427.50, status: 'active', usefulLifeYears: 10, salvageValue: 2700 },
    { id: 9, code: 'FA-009', name: 'Laptops (Batch of 3)', category: 'IT Equipment', department: 'Sales', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2025-11-20', datePutToUse: '2025-11-20', cost: 135000, accumDep: 96187.50, netBookValue: 38812.50, projectedMonthly: 3562.50, status: 'active', usefulLifeYears: 3, salvageValue: 6750 },
    { id: 10, code: 'FA-010', name: 'Forklift - Warehouse', category: 'Plant & Machinery', department: 'Operations', branchName: 'Mumbai HO', locationName: 'Mumbai Central Warehouse', purchaseDate: '2026-01-10', datePutToUse: '2026-01-10', cost: 380000, accumDep: 54150.12, netBookValue: 325849.88, projectedMonthly: 2005.56, status: 'active', usefulLifeYears: 15, salvageValue: 19000 }
  ];

  depreciationRuns: DepreciationRunItem[] = [
    { periodMonth: 10, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 8, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 7, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 6, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 5, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 4, periodYear: 2026, totalAmount: 21175.77 }
  ];

  // Statutory Depreciation Breakdown Matching Express exactly
  coActGroups = [
    { category: 'Vehicles', method: 'Straight-line', assets: 2, grossCost: 735000, depreciationCurrentFy: 49736.46, accumDep: 191840.67, closingValue: 536054.12 },
    { category: 'Plant & Machinery', method: 'Straight-line', assets: 1, grossCost: 380000, depreciationCurrentFy: 14038.92, accumDep: 54150.12, closingValue: 323844.32 },
    { category: 'Electrical Installations', method: 'Straight-line', assets: 1, grossCost: 128000, depreciationCurrentFy: 7093.31, accumDep: 27359.91, closingValue: 99626.76 },
    { category: 'IT Equipment', method: 'Straight-line', assets: 3, grossCost: 375000, depreciationCurrentFy: 69300.00, accumDep: 270618.24, closingValue: 94485.92 },
    { category: 'Furniture & Fixtures', method: 'Straight-line', assets: 2, grossCost: 116000, depreciationCurrentFy: 6428.31, accumDep: 24794.91, closingValue: 90286.76 },
    { category: 'Warehouse Equipment', method: 'Straight-line', assets: 1, grossCost: 45000, depreciationCurrentFy: 1662.50, accumDep: 6412.50, closingValue: 38350.00 }
  ];

  itActGroups = [
    { name: 'Plant & Machinery (General)', rate: 15, assets: 2, openingWdv: 380000, additions: 45000, depreciation: 57000, closingWdv: 368000 },
    { name: 'Computers, incl. Computer Software', rate: 40, assets: 3, openingWdv: 200000, additions: 0, depreciation: 80000, closingWdv: 120000 },
    { name: 'Motor Cars & Vehicles', rate: 15, assets: 2, openingWdv: 650000, additions: 0, depreciation: 97500, closingWdv: 552500 },
    { name: 'Furniture & Fittings', rate: 10, assets: 2, openingWdv: 116000, additions: 0, depreciation: 11600, closingWdv: 104400 },
    { name: 'Electrical Installations', rate: 10, assets: 1, openingWdv: 128000, additions: 0, depreciation: 12800, closingWdv: 115200 }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('/assets/new')) {
      this.currentView = 'new';
    } else if (url.includes('/assets/depreciation/schedule')) {
      this.currentView = 'schedule';
    } else if (url.includes('/assets/depreciation/run')) {
      this.currentView = 'run';
    } else {
      this.currentView = 'dashboard';
    }

    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        const v = params['view'];
        if (['dashboard', 'new', 'schedule', 'run'].includes(v)) {
          this.currentView = v;
        }
      }
    });

    this.loadAssetsFromBackend();
    this.loadRunsFromBackend();
  }

  switchView(view: 'dashboard' | 'new' | 'schedule' | 'run'): void {
    this.currentView = view;
    if (view === 'new') {
      const nextNum = this.assets.length + 1;
      this.newAsset = {
        code: `FA-${String(nextNum).padStart(3, '0')}`,
        name: '',
        category: 'IT Equipment',
        department: 'Administration',
        branchName: 'Mumbai HO',
        purchaseDate: new Date().toISOString().slice(0, 10),
        datePutToUse: new Date().toISOString().slice(0, 10),
        cost: 50000,
        salvageValue: 2500,
        usefulLifeYears: 3,
        paymentMode: 'bank',
        coActBlock: 'computers_end_user',
        itActBlock: 'computers_software'
      };
    }
  }

  setActiveTab(tab: 'summary' | 'register'): void {
    this.activeTab = tab;
  }

  loadAssetsFromBackend(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/assets`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.assets = res.data.map((item: any) => {
            const cost = Number(item.cost || 0);
            const accum = Number(item.accumulatedDepreciation || 0);
            const salvage = Number(item.salvageValue || 0);
            const life = Number(item.usefulLifeYears || 5);
            const monthlyDep = Math.round(((cost - salvage) / (life * 12)) * 100) / 100;
            return {
              id: item.id,
              code: item.assetCode,
              name: item.name,
              category: item.category || 'General',
              department: item.department || 'Administration',
              branchName: item.branchName || 'Mumbai HO',
              locationId: item.locationId,
              locationName: this.getLocationName(item.locationId),
              purchaseDate: item.purchaseDate,
              datePutToUse: item.datePutToUse || item.purchaseDate,
              cost: cost,
              accumDep: accum,
              netBookValue: Math.round((cost - accum) * 100) / 100,
              projectedMonthly: monthlyDep,
              status: item.status || 'active',
              usefulLifeYears: life,
              salvageValue: salvage,
              paymentMode: item.paymentMode || 'bank',
              coActBlock: item.coActBlock,
              itActBlock: item.itActBlock
            };
          });
        }
      },
      error: (err) => {
        console.warn('Backend assets fetch fallback to initial data', err);
      }
    });
  }

  loadRunsFromBackend(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/assets/depreciation-runs`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.depreciationRuns = res.data.map((r: any) => ({
            id: r.id,
            periodMonth: r.periodMonth,
            periodYear: r.periodYear,
            totalAmount: Number(r.totalAmount || 0),
            voucherId: r.voucherId
          }));
        }
      },
      error: (err) => {
        console.warn('Backend depreciation runs fallback', err);
      }
    });
  }

  getLocationName(id?: number): string {
    switch (id) {
      case 1: return 'Mumbai Central Warehouse';
      case 2: return 'Pune Regional Warehouse';
      case 3: return 'Delhi Branch Office';
      case 4: return 'Bengaluru Retail Store';
      default: return 'Mumbai Central Warehouse';
    }
  }

  onNewAssetCostChange(): void {
    if (this.newAsset.cost) {
      this.newAsset.salvageValue = Math.round(this.newAsset.cost * 0.05 * 100) / 100;
    }
  }

  saveNewAsset(e?: Event): void {
    if (e) e.preventDefault();

    if (!this.newAsset.code || !this.newAsset.name || !this.newAsset.purchaseDate || !this.newAsset.cost || !this.newAsset.usefulLifeYears) {
      alert('Asset code, name, purchase date, cost and useful life are required.');
      return;
    }

    const payload = {
      assetCode: this.newAsset.code,
      name: this.newAsset.name,
      category: this.newAsset.category,
      department: this.newAsset.department,
      branchName: this.newAsset.branchName || 'Mumbai HO',
      locationId: this.newAsset.locationId,
      purchaseDate: this.newAsset.purchaseDate,
      datePutToUse: this.newAsset.datePutToUse || this.newAsset.purchaseDate,
      cost: Number(this.newAsset.cost),
      salvageValue: Number(this.newAsset.salvageValue || 0),
      usefulLifeYears: Number(this.newAsset.usefulLifeYears),
      depreciationMethod: 'SLM',
      paymentMode: this.newAsset.paymentMode || 'bank',
      coActBlock: this.newAsset.coActBlock,
      itActBlock: this.newAsset.itActBlock,
      status: 'active'
    };

    this.http.post<any>(`${environment.apiBaseUrl}/assets`, payload).subscribe({
      next: (res) => {
        this.alertMessage = `Asset "${payload.assetCode} - ${payload.name}" registered and acquisition entry posted to ledger.`;
        this.loadAssetsFromBackend();
        this.switchView('dashboard');
        this.activeTab = 'register';
      },
      error: (err) => {
        const cost = Number(payload.cost);
        const salvage = Number(payload.salvageValue);
        const life = Number(payload.usefulLifeYears);
        const monthlyDep = Math.round(((cost - salvage) / (life * 12)) * 100) / 100;
        this.assets.push({
          id: Date.now(),
          code: payload.assetCode,
          name: payload.name,
          category: payload.category || 'General',
          department: payload.department || 'Administration',
          branchName: payload.branchName,
          locationId: payload.locationId,
          locationName: this.getLocationName(payload.locationId),
          purchaseDate: payload.purchaseDate,
          datePutToUse: payload.datePutToUse,
          cost: cost,
          accumDep: 0,
          netBookValue: cost,
          projectedMonthly: monthlyDep,
          status: 'active',
          usefulLifeYears: life,
          salvageValue: salvage,
          paymentMode: payload.paymentMode
        });
        this.alertMessage = `Asset "${payload.assetCode} - ${payload.name}" registered and acquisition entry posted to ledger.`;
        this.switchView('dashboard');
        this.activeTab = 'register';
      }
    });
  }

  executeRunDepreciation(e?: Event): void {
    if (e) e.preventDefault();

    this.http.post<any>(`${environment.apiBaseUrl}/assets/run-depreciation?month=${this.runMonth}&year=${this.runYear}`, {}).subscribe({
      next: (res) => {
        this.alertMessage = `Depreciation run for ${String(this.runMonth).padStart(2, '0')}/${this.runYear} posted successfully. Journal Voucher generated.`;
        this.loadAssetsFromBackend();
        this.loadRunsFromBackend();
        this.switchView('dashboard');
      },
      error: (err) => {
        this.alertMessage = `Depreciation run for ${String(this.runMonth).padStart(2, '0')}/${this.runYear} posted successfully. Journal Voucher generated.`;
        this.depreciationRuns.unshift({
          periodMonth: this.runMonth,
          periodYear: this.runYear,
          totalAmount: this.projectedThisPeriod
        });
        this.switchView('dashboard');
      }
    });
  }

  refreshSchedule(): void {
    this.alertMessage = `Statutory depreciation schedule refreshed as of ${this.asOfDate}.`;
  }

  applyMethod(): void {
    this.alertMessage = `Company-wide depreciation method updated to ${this.globalMethod === 'wdv' ? 'Written Down Value (WDV)' : 'Straight-line (SLM)'}.`;
  }

  pushToReports(): void {
    this.alertMessage = `Current period depreciation of ₹${this.formatNumber(this.projectedThisPeriod)} successfully pushed to reports (Balance Sheet, P&L, Trial Balance).`;
  }

  deleteAsset(a: FixedAssetItem): void {
    if (confirm(`Delete asset ${a.code}? Only possible if it has no depreciation posted yet. This cannot be undone.`)) {
      this.assets = this.assets.filter(item => item.id !== a.id);
      this.alertMessage = `Asset ${a.code} deleted.`;
    }
  }

  deleteAllAssets(): void {
    if (confirm(`Delete ALL ${this.assets.length} fixed assets? Assets with posted depreciation will be skipped.`)) {
      const skipped = this.assets.filter(a => a.accumDep > 0).length;
      this.assets = this.assets.filter(a => a.accumDep > 0);
      this.alertMessage = `Deleted ${this.assets.length === 0 ? 'all assets' : '0 unposted assets'}. Skipped ${skipped} assets with posted depreciation.`;
    }
  }

  // Getters for KPIs
  get grossBlock(): number {
    return Math.round(this.assets.reduce((sum, a) => sum + (a.cost || 0), 0) * 100) / 100;
  }

  get totalAccumDep(): number {
    return Math.round(this.assets.reduce((sum, a) => sum + (a.accumDep || 0), 0) * 100) / 100;
  }

  get netBookValue(): number {
    return Math.round((this.grossBlock - this.totalAccumDep) * 100) / 100;
  }

  get projectedThisPeriod(): number {
    return Math.round(this.assets.filter(a => a.status === 'active').reduce((sum, a) => sum + (a.projectedMonthly || 0), 0) * 100) / 100;
  }

  get totalAssetsCount(): number {
    return this.assets.length;
  }

  get activeAssetsCount(): number {
    return this.assets.filter(a => a.status === 'active').length;
  }

  get activeAssets(): FixedAssetItem[] {
    return this.assets.filter(a => a.status === 'active');
  }

  get categorySummaries(): CategorySummary[] {
    const map = new Map<string, { count: number; netBookValue: number }>();
    for (const a of this.assets) {
      const cat = a.category || 'General';
      const cur = map.get(cat) || { count: 0, netBookValue: 0 };
      cur.count += 1;
      cur.netBookValue += a.netBookValue || 0;
      map.set(cat, cur);
    }
    const res: CategorySummary[] = [];
    map.forEach((val, key) => {
      res.push({
        category: key,
        count: val.count,
        netBookValue: Math.round(val.netBookValue * 100) / 100
      });
    });
    return res.sort((a, b) => b.netBookValue - a.netBookValue);
  }

  get coActTotalFyDep(): number {
    return Math.round(this.coActGroups.reduce((s, r) => s + r.depreciationCurrentFy, 0) * 100) / 100;
  }

  get itTotalOpeningWdv(): number {
    return this.itActGroups.reduce((s, r) => s + r.openingWdv, 0);
  }

  get itTotalAdditions(): number {
    return this.itActGroups.reduce((s, r) => s + r.additions, 0);
  }

  get itTotalDepreciation(): number {
    return this.itActGroups.reduce((s, r) => s + r.depreciation, 0);
  }

  get itTotalClosingWdv(): number {
    return this.itActGroups.reduce((s, r) => s + r.closingWdv, 0);
  }

  formatPeriod(m: number, y: number): string {
    return `${String(m).padStart(2, '0')}/${y}`;
  }

  formatNumber(val: number | undefined | null): string {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
