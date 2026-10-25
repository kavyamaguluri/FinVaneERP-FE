import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface FixedAssetItem {
  id: number;
  code: string;
  name: string;
  category: string;
  department: string;
  branchName?: string;
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

@Component({
  selector: 'app-fixed-assets',
  template: `
    <a href="javascript:history.back()" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back</a>

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
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="openScheduleModal()">
          Statutory Depreciation Schedule
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="openRunDepreciationModal()">
          Run Depreciation
        </button>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewAssetModal()">
          + New Asset
        </button>
      </div>
    </div>

    <!-- Feedback Banner -->
    <div *ngIf="alertMessage" class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
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

    <!-- ================= TAB 1: FAM SUMMARY (Matching Screenshot 4 Left) ================= -->
    <div *ngIf="activeTab === 'summary'">
      <!-- 4 KPI Cards matching Express dashboard.ejs -->
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card p-3 shadow-sm border-0 bg-white">
            <div class="small text-muted fw-semibold">Gross Block</div>
            <div class="fs-4 fw-bold text-dark mt-1">{{ totalGrossBlock | number:'1.2-2' }}</div>
            <div class="small text-muted mt-1">{{ assets.length }} assets ({{ activeCount }} active)</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 shadow-sm border-0 bg-white">
            <div class="small text-muted fw-semibold">Accumulated Depreciation</div>
            <div class="fs-4 fw-bold text-dark mt-1">{{ totalAccumDep | number:'1.2-2' }}</div>
            <div class="small text-muted mt-1">Method: {{ globalMethod === 'wdv' ? 'Written Down Value' : 'Straight-line' }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 shadow-sm border-0 bg-white">
            <div class="small text-muted fw-semibold">Net Book Value</div>
            <div class="fs-4 fw-bold text-dark mt-1">{{ totalNetBookValue | number:'1.2-2' }}</div>
            <div class="small text-muted mt-1">Gross Block &minus; Accum. Depreciation</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 shadow-sm border-0 bg-white">
            <div class="small text-muted fw-semibold">Projected This Period</div>
            <div class="fs-4 fw-bold text-dark mt-1">{{ projectedThisPeriod | number:'1.2-2' }}</div>
            <div class="small text-muted mt-1">{{ hasRunCurrentMonth ? 'Already posted for this period' : 'Not yet pushed to reports' }}</div>
          </div>
        </div>
      </div>

      <!-- Side-by-Side Category & Recent Runs matching Express dashboard.ejs -->
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card p-3 shadow-sm border-0 bg-white h-100">
            <h6 class="fw-bold mb-3">Net Book Value by Category</h6>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead class="bg-light small text-muted text-uppercase">
                  <tr>
                    <th>Category</th>
                    <th class="text-end">Assets</th>
                    <th class="text-end">Net Book Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of byCategory">
                    <td>{{ c.category }}</td>
                    <td class="text-end">{{ c.count }}</td>
                    <td class="text-end fw-semibold">{{ c.netBookValue | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="byCategory.length === 0">
                    <td colspan="3" class="text-center text-muted py-3">No fixed assets recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3 shadow-sm border-0 bg-white h-100">
            <h6 class="fw-bold mb-3">Recent Depreciation Runs</h6>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead class="bg-light small text-muted text-uppercase">
                  <tr>
                    <th>Period</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of recentRuns.slice(0, 6)">
                    <td>{{ pad2(r.periodMonth) }}/{{ r.periodYear }}</td>
                    <td class="text-end fw-semibold">{{ r.totalAmount | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="recentRuns.length === 0">
                    <td colspan="2" class="text-center text-muted py-3">No depreciation has been run yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= TAB 2: ASSET REGISTER (Matching Screenshot 4 Right & 5) ================= -->
    <div *ngIf="activeTab === 'register'">
      <!-- Method & Push to Reports Card matching Express list.ejs -->
      <div class="card p-3 shadow-sm border-0 bg-white mb-3">
        <div class="row g-3 align-items-end">
          <div class="col-md-5">
            <div class="d-flex gap-2 align-items-end">
              <div class="flex-grow-1">
                <label class="form-label small mb-1 fw-semibold text-muted">
                  Depreciation Method <span class="fw-normal text-muted">(applies to every asset)</span>
                </label>
                <select class="form-select form-select-sm" [(ngModel)]="globalMethod">
                  <option value="straight_line">Straight-line (SLM)</option>
                  <option value="wdv">Written Down Value (WDV)</option>
                </select>
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="applyMethod()">Apply Method</button>
            </div>
          </div>
          <div class="col-md-7">
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-success" (click)="pushToReports()">Push to Reports</button>
              <span class="text-muted small">
                Posts the current period's depreciation under the method above into the ledger (Balance Sheet, P&amp;L, Trial Balance).
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Asset Summary Cards (matching screenshot 5) -->
      <div class="d-flex gap-3 flex-wrap mb-3">
        <div class="p-3 rounded border text-start bg-white shadow-sm" style="min-width: 170px;">
          <span class="fs-4 fw-bold d-block text-dark">{{ activeCount }}</span>
          <span class="small text-muted fw-medium">Active Assets</span>
        </div>
        <div class="p-3 rounded border text-start bg-white shadow-sm" style="min-width: 200px;">
          <span class="fs-4 fw-bold d-block text-dark">&#8377;{{ totalGrossBlock | number:'1.2-2' }}</span>
          <span class="small text-muted fw-medium">Gross Block</span>
        </div>
        <div class="p-3 rounded border text-start bg-white shadow-sm" style="min-width: 200px;">
          <span class="fs-4 fw-bold d-block text-danger">&#8377;{{ totalAccumDep | number:'1.2-2' }}</span>
          <span class="small text-muted fw-medium">Accumulated Dep.</span>
        </div>
        <div class="p-3 rounded border text-start bg-white shadow-sm" style="min-width: 200px;">
          <span class="fs-4 fw-bold d-block text-success">&#8377;{{ totalNetBookValue | number:'1.2-2' }}</span>
          <span class="small text-muted fw-medium">Net Book Value</span>
        </div>
      </div>

      <!-- Asset Register Table -->
      <div class="card p-3 shadow-sm border-0 bg-white mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small text-muted">{{ assets.length }} asset{{ assets.length === 1 ? '' : 's' }}</span>
          <button *ngIf="assets.length > 0" type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAllAssets()">
            Delete All (this view)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light small text-muted text-uppercase">
              <tr>
                <th>Asset Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Department</th>
                <th>Put to Use</th>
                <th class="text-end">Cost</th>
                <th class="text-end">Accum. Dep</th>
                <th class="text-end">Net Value</th>
                <th>Status</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of assets">
                <td><strong class="text-secondary">{{ a.code }}</strong></td>
                <td class="fw-semibold text-dark">{{ a.name }}</td>
                <td>{{ a.category }}</td>
                <td>{{ a.department }}</td>
                <td>{{ a.datePutToUse || a.purchaseDate }}</td>
                <td class="text-end">&#8377;{{ a.cost | number:'1.2-2' }}</td>
                <td class="text-end text-danger">&#8377;{{ a.accumDep | number:'1.2-2' }}</td>
                <td class="text-end fw-bold text-success">&#8377;{{ a.netBookValue | number:'1.2-2' }}</td>
                <td><span class="badge text-bg-success">{{ a.status }}</span></td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAsset(a)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="assets.length === 0">
                <td colspan="10" class="text-center text-muted py-4">No fixed assets yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Depreciation Runs Table -->
      <div class="card p-3 shadow-sm border-0 bg-white">
        <h6 class="fw-bold mb-2">Recent Depreciation Runs</h6>
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead class="bg-light small text-muted text-uppercase">
              <tr>
                <th>Period</th>
                <th class="text-end">Total Posted</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of recentRuns">
                <td>{{ r.periodMonth }}/{{ r.periodYear }}</td>
                <td class="text-end fw-semibold">&#8377;{{ r.totalAmount | number:'1.2-2' }}</td>
              </tr>
              <tr *ngIf="recentRuns.length === 0">
                <td colspan="2" class="text-center text-muted py-2">No depreciation runs yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 1: STATUTORY DEPRECIATION SCHEDULE ================= -->
    <div *ngIf="showScheduleModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-bold mb-0">Statutory Depreciation Schedule</h5>
              <div class="small text-muted">Assets grouped by Companies Act 2013 (Schedule II) and Income Tax Act (Section 32) block as of {{ asOfDate }}</div>
            </div>
            <button type="button" class="btn-close" (click)="showScheduleModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 align-items-end mb-3">
              <div class="col-auto">
                <label class="form-label small mb-0 fw-semibold">As of Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="asOfDate" />
              </div>
              <div class="col-auto">
                <button type="button" class="btn btn-sm btn-outline-primary" (click)="applyScheduleDate()">Apply</button>
              </div>
            </div>

            <!-- Group 1: Companies Act 2013 Category -->
            <h6 class="fw-bold mb-2 text-dark">Grouped by Companies Act 2013 &mdash; Schedule II Category</h6>
            <div class="table-responsive mb-4">
              <table class="table table-sm table-bordered align-middle mb-0">
                <thead class="bg-light small text-muted text-uppercase">
                  <tr>
                    <th>Category</th>
                    <th class="text-end">Cost</th>
                    <th class="text-end">Accum. Depr.</th>
                    <th class="text-end">Closing Value</th>
                    <th class="text-end">Depr. This FY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let g of coActGroups">
                    <td class="fw-semibold">{{ g.category }}</td>
                    <td class="text-end">&#8377;{{ g.cost | number:'1.2-2' }}</td>
                    <td class="text-end">&#8377;{{ g.accumDep | number:'1.2-2' }}</td>
                    <td class="text-end fw-semibold">&#8377;{{ g.closingValue | number:'1.2-2' }}</td>
                    <td class="text-end text-danger">&#8377;{{ g.deprThisFy | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="fw-bold border-top bg-light">
                    <td>Total</td>
                    <td class="text-end">&#8377;{{ totalGrossBlock | number:'1.2-2' }}</td>
                    <td class="text-end">&#8377;{{ totalAccumDep | number:'1.2-2' }}</td>
                    <td class="text-end">&#8377;{{ totalNetBookValue | number:'1.2-2' }}</td>
                    <td class="text-end text-danger">&#8377;{{ coActTotalDeprThisFy | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Group 2: Income Tax Act Block -->
            <h6 class="fw-bold mb-2 text-dark">Grouped by Income Tax Act &mdash; Section 32 Block</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered align-middle mb-0">
                <thead class="bg-light small text-muted text-uppercase">
                  <tr>
                    <th>Block</th>
                    <th class="text-center">Rate %</th>
                    <th class="text-end">Cost</th>
                    <th class="text-end">Accum. Depr.</th>
                    <th class="text-end">Closing WDV</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of itActBlocks">
                    <td class="fw-semibold">{{ b.block }}</td>
                    <td class="text-center">{{ b.rate }}%</td>
                    <td class="text-end">&#8377;{{ b.cost | number:'1.2-2' }}</td>
                    <td class="text-end">&#8377;{{ b.accumDep | number:'1.2-2' }}</td>
                    <td class="text-end fw-semibold">&#8377;{{ b.closingWdv | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="fw-bold border-top bg-light">
                    <td colspan="2">Total</td>
                    <td class="text-end">&#8377;{{ totalGrossBlock | number:'1.2-2' }}</td>
                    <td class="text-end">&#8377;{{ totalAccumDep | number:'1.2-2' }}</td>
                    <td class="text-end">&#8377;{{ totalNetBookValue | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showScheduleModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 2: RUN DEPRECIATION ================= -->
    <div *ngIf="showRunDeprModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Run Monthly Depreciation</h5>
            <button type="button" class="btn-close" (click)="showRunDeprModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 align-items-end mb-3">
              <div class="col-auto">
                <label class="form-label mb-0 small fw-semibold">Month</label>
                <input type="number" min="1" max="12" class="form-control form-control-sm" [(ngModel)]="runMonth" style="width: 80px;" />
              </div>
              <div class="col-auto">
                <label class="form-label mb-0 small fw-semibold">Year</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="runYear" style="width: 100px;" />
              </div>
              <div class="col-auto">
                <button type="button" class="btn btn-sm btn-primary" (click)="executeDepreciationRun()">
                  Run &amp; Post Journal Voucher
                </button>
              </div>
            </div>

            <div class="card p-3 shadow-none border bg-light">
              <h6 class="fw-bold mb-2">Preview &mdash; Projected Depreciation for Active Assets</h6>
              <div class="table-responsive" style="max-height: 250px;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="bg-white small text-muted text-uppercase">
                    <tr>
                      <th>Asset</th>
                      <th>Method</th>
                      <th class="text-end">Book Value</th>
                      <th class="text-end">Projected Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let a of assets">
                      <td>{{ a.name }} ({{ a.code }})</td>
                      <td>{{ globalMethod === 'wdv' ? 'WDV' : 'Straight-line' }}</td>
                      <td class="text-end">&#8377;{{ a.netBookValue | number:'1.2-2' }}</td>
                      <td class="text-end fw-semibold text-primary">&#8377;{{ a.projectedMonthly | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fw-bold border-top">
                      <td colspan="3">Consolidated Journal Voucher Total:</td>
                      <td class="text-end text-primary">&#8377;{{ projectedThisPeriod | number:'1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <p class="text-muted small mt-2 mb-0">
              Running this posts one consolidated journal voucher (Depreciation Expense Dr / Accumulated Depreciation Cr) for the whole period.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showRunDeprModal = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 3: NEW ASSET ================= -->
    <div *ngIf="showNewAssetModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">New Fixed Asset</h5>
            <button type="button" class="btn-close" (click)="showNewAssetModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Asset Code</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newAsset.code" placeholder="e.g. FA-011" />
              </div>
              <div class="col-md-8">
                <label class="form-label small fw-semibold">Asset Name</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="newAsset.name" placeholder="e.g. Conference Room Projector" />
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Category</label>
                <select class="form-select form-select-sm" [(ngModel)]="newAsset.category">
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Plant & Machinery">Plant &amp; Machinery</option>
                  <option value="Electrical Installations">Electrical Installations</option>
                  <option value="Furniture & Fixtures">Furniture &amp; Fixtures</option>
                  <option value="Warehouse Equipment">Warehouse Equipment</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Department</label>
                <select class="form-select form-select-sm" [(ngModel)]="newAsset.department">
                  <option value="Administration">Administration</option>
                  <option value="Operations">Operations</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Purchase Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="newAsset.purchaseDate" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Date Put to Use</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="newAsset.datePutToUse" />
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Cost (₹)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="newAsset.cost" (input)="onNewAssetCostChange()" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Salvage Value (₹)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="newAsset.salvageValue" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Useful Life (Years)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="newAsset.usefulLifeYears" />
              </div>
            </div>
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Payment Mode</label>
                <select class="form-select form-select-sm" [(ngModel)]="newAsset.paymentMode">
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit (Vendor Payable)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showNewAssetModal = false">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" (click)="saveNewAsset()">Save Fixed Asset</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
  `]
})
export class FixedAssetsComponent implements OnInit {
  activeTab: 'summary' | 'register' = 'summary';
  alertMessage = '';
  globalMethod = 'straight_line';
  hasRunCurrentMonth = false;

  asOfDate = '2026-10-25';
  showScheduleModal = false;
  showRunDeprModal = false;
  showNewAssetModal = false;

  runMonth = 10;
  runYear = 2026;

  newAsset: Partial<FixedAssetItem> = {
    code: '',
    name: '',
    category: 'IT Equipment',
    department: 'Administration',
    purchaseDate: new Date().toISOString().slice(0, 10),
    datePutToUse: new Date().toISOString().slice(0, 10),
    cost: 50000,
    salvageValue: 2500,
    usefulLifeYears: 3,
    paymentMode: 'bank'
  };

  assets: FixedAssetItem[] = [
    {
      id: 1,
      code: 'FA-001',
      name: 'Office Laptop - Dell Latitude',
      category: 'IT Equipment',
      department: 'Administration',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2024-04-01',
      datePutToUse: '2024-04-01',
      cost: 65000,
      accumDep: 49743.12,
      netBookValue: 15256.88,
      projectedMonthly: 1715.28,
      status: 'active',
      usefulLifeYears: 3,
      salvageValue: 3250
    },
    {
      id: 2,
      code: 'FA-002',
      name: 'Warehouse Racking System',
      category: 'Warehouse Equipment',
      department: 'Operations',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2024-06-15',
      datePutToUse: '2024-06-15',
      cost: 45000,
      accumDep: 6412.50,
      netBookValue: 38587.50,
      projectedMonthly: 237.50,
      status: 'active',
      usefulLifeYears: 15,
      salvageValue: 2250
    },
    {
      id: 3,
      code: 'FA-003',
      name: 'Delivery Two-Wheeler',
      category: 'Vehicles',
      department: 'Logistics',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2024-08-20',
      datePutToUse: '2024-08-20',
      cost: 85000,
      accumDep: 18168.84,
      netBookValue: 66831.16,
      projectedMonthly: 672.92,
      status: 'active',
      usefulLifeYears: 10,
      salvageValue: 4250
    },
    {
      id: 4,
      code: 'FA-004',
      name: 'Office Furniture Set',
      category: 'Furniture & Fixtures',
      department: 'Administration',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2024-11-10',
      datePutToUse: '2024-11-10',
      cost: 62000,
      accumDep: 13252.41,
      netBookValue: 48747.59,
      projectedMonthly: 490.83,
      status: 'active',
      usefulLifeYears: 10,
      salvageValue: 3100
    },
    {
      id: 5,
      code: 'FA-005',
      name: 'Desktop Computers (Batch of 5)',
      category: 'IT Equipment',
      department: 'Administration',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2025-02-05',
      datePutToUse: '2025-02-05',
      cost: 175000,
      accumDep: 124687.62,
      netBookValue: 50312.38,
      projectedMonthly: 4618.06,
      status: 'active',
      usefulLifeYears: 3,
      salvageValue: 8750
    },
    {
      id: 6,
      code: 'FA-006',
      name: 'Delivery Van',
      category: 'Vehicles',
      department: 'Logistics',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2025-05-12',
      datePutToUse: '2025-05-12',
      cost: 650000,
      accumDep: 173671.83,
      netBookValue: 476328.17,
      projectedMonthly: 6175.00,
      status: 'active',
      usefulLifeYears: 8,
      salvageValue: 32500
    },
    {
      id: 7,
      code: 'FA-007',
      name: 'Split AC Units - Office',
      category: 'Electrical Installations',
      department: 'Administration',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2025-08-18',
      datePutToUse: '2025-08-18',
      cost: 128000,
      accumDep: 27359.91,
      netBookValue: 100640.09,
      projectedMonthly: 1013.33,
      status: 'active',
      usefulLifeYears: 10,
      salvageValue: 6400
    },
    {
      id: 8,
      code: 'FA-008',
      name: 'Retail Display Racks',
      category: 'Furniture & Fixtures',
      department: 'Sales',
      branchName: 'Bengaluru Branch',
      locationName: 'Bengaluru Retail Store',
      purchaseDate: '2025-11-22',
      datePutToUse: '2025-11-22',
      cost: 54000,
      accumDep: 11542.50,
      netBookValue: 42457.50,
      projectedMonthly: 427.50,
      status: 'active',
      usefulLifeYears: 10,
      salvageValue: 2700
    },
    {
      id: 9,
      code: 'FA-009',
      name: 'Laptops (Batch of 3)',
      category: 'IT Equipment',
      department: 'Sales',
      branchName: 'Bengaluru Branch',
      locationName: 'Bengaluru Retail Store',
      purchaseDate: '2026-02-10',
      datePutToUse: '2026-02-10',
      cost: 135000,
      accumDep: 96187.50,
      netBookValue: 38812.50,
      projectedMonthly: 3562.50,
      status: 'active',
      usefulLifeYears: 3,
      salvageValue: 6750
    },
    {
      id: 10,
      code: 'FA-010',
      name: 'Forklift - Warehouse',
      category: 'Plant & Machinery',
      department: 'Operations',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: '2026-05-15',
      datePutToUse: '2026-05-15',
      cost: 380000,
      accumDep: 54150.12,
      netBookValue: 325849.88,
      projectedMonthly: 2172.22,
      status: 'active',
      usefulLifeYears: 15,
      salvageValue: 19000
    }
  ];

  recentRuns: DepreciationRunItem[] = [
    { periodMonth: 8, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 7, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 6, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 5, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 4, periodYear: 2026, totalAmount: 21175.77 },
    { periodMonth: 3, periodYear: 2026, totalAmount: 21175.77 }
  ];

  coActGroups = [
    { category: 'Vehicles', cost: 735000.00, accumDep: 191840.67, closingValue: 543159.33, deprThisFy: 35537.67 },
    { category: 'Plant & Machinery', cost: 380000.00, accumDep: 54150.12, closingValue: 325849.88, deprThisFy: 54150.12 },
    { category: 'IT Equipment', cost: 375000.00, accumDep: 270618.24, closingValue: 104381.76, deprThisFy: 45958.50 },
    { category: 'Electrical Installations', cost: 128000.00, accumDep: 27359.91, closingValue: 100640.09, deprThisFy: 7104.09 },
    { category: 'Furniture & Fixtures', cost: 116000.00, accumDep: 24794.91, closingValue: 91205.09, deprThisFy: 7725.09 },
    { category: 'Warehouse Equipment', cost: 45000.00, accumDep: 6412.50, closingValue: 38587.50, deprThisFy: 1187.50 }
  ];

  itActBlocks = [
    { block: 'Motor Cars / Vehicles', rate: 15, cost: 735000.00, accumDep: 191840.67, closingWdv: 543159.33 },
    { block: 'Plant & Machinery (General)', rate: 15, cost: 425000.00, accumDep: 60562.62, closingWdv: 364437.38 },
    { block: 'Computers & Software', rate: 40, cost: 375000.00, accumDep: 270618.24, closingWdv: 104381.76 },
    { block: 'Furniture and Fittings', rate: 10, cost: 116000.00, accumDep: 24794.91, closingWdv: 91205.09 },
    { block: 'Electrical Installations', rate: 15, cost: 128000.00, accumDep: 27359.91, closingWdv: 100640.09 }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    if (this.router.url.includes('/assets/dashboard')) {
      this.activeTab = 'summary';
    } else if (this.router.url.includes('/assets')) {
      this.activeTab = 'summary';
    }
    const now = new Date();
    this.runMonth = now.getUTCMonth() + 1;
    this.runYear = now.getUTCFullYear();
    this.asOfDate = now.toISOString().slice(0, 10);
  }

  setActiveTab(tab: 'summary' | 'register') {
    this.activeTab = tab;
  }

  get activeCount(): number {
    return this.assets.filter(a => a.status === 'active').length;
  }

  get totalGrossBlock(): number {
    return Math.round(this.assets.reduce((sum, a) => sum + a.cost, 0) * 100) / 100;
  }

  get totalAccumDep(): number {
    return Math.round(this.assets.reduce((sum, a) => sum + a.accumDep, 0) * 100) / 100;
  }

  get totalNetBookValue(): number {
    return Math.round((this.totalGrossBlock - this.totalAccumDep) * 100) / 100;
  }

  get projectedThisPeriod(): number {
    return Math.round(this.assets.filter(a => a.status === 'active').reduce((sum, a) => sum + (a.projectedMonthly || 0), 0) * 100) / 100;
  }

  get byCategory(): CategorySummary[] {
    const map: { [key: string]: CategorySummary } = {};
    for (const a of this.assets) {
      const cat = a.category || 'Uncategorized';
      if (!map[cat]) {
        map[cat] = { category: cat, count: 0, netBookValue: 0 };
      }
      map[cat].count++;
      map[cat].netBookValue = Math.round((map[cat].netBookValue + a.netBookValue) * 100) / 100;
    }
    return Object.values(map).sort((a, b) => b.netBookValue - a.netBookValue);
  }

  get coActTotalDeprThisFy(): number {
    return Math.round(this.coActGroups.reduce((sum, g) => sum + g.deprThisFy, 0) * 100) / 100;
  }

  pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  // --- BUTTON ACTIONS ---

  openScheduleModal() {
    this.showScheduleModal = true;
  }

  applyScheduleDate() {
    this.alertMessage = `Statutory depreciation schedule recalculated as of ${this.asOfDate}.`;
  }

  openRunDepreciationModal() {
    this.showRunDeprModal = true;
  }

  executeDepreciationRun() {
    const existing = this.recentRuns.find(r => r.periodMonth === this.runMonth && r.periodYear === this.runYear);
    if (existing) {
      alert(`Depreciation for ${this.runMonth}/${this.runYear} has already been run.`);
      return;
    }

    const amount = this.projectedThisPeriod;
    this.recentRuns.unshift({
      periodMonth: this.runMonth,
      periodYear: this.runYear,
      totalAmount: amount
    });
    this.hasRunCurrentMonth = true;

    // Apply incremental depreciation to active assets
    this.assets.forEach(a => {
      if (a.status === 'active' && a.projectedMonthly) {
        a.accumDep = Math.round((a.accumDep + a.projectedMonthly) * 100) / 100;
        a.netBookValue = Math.round((a.cost - a.accumDep) * 100) / 100;
      }
    });

    this.showRunDeprModal = false;
    this.alertMessage = `Depreciation for ${this.runMonth}/${this.runYear} posted successfully (JV created: ₹${amount.toLocaleString('en-IN')}).`;
  }

  openNewAssetModal() {
    const nextNum = this.assets.length + 1;
    this.newAsset = {
      code: `FA-${String(nextNum).padStart(3, '0')}`,
      name: '',
      category: 'IT Equipment',
      department: 'Administration',
      purchaseDate: new Date().toISOString().slice(0, 10),
      datePutToUse: new Date().toISOString().slice(0, 10),
      cost: 50000,
      salvageValue: 2500,
      usefulLifeYears: 3,
      paymentMode: 'bank'
    };
    this.showNewAssetModal = true;
  }

  onNewAssetCostChange() {
    if (this.newAsset.cost) {
      this.newAsset.salvageValue = Math.round(this.newAsset.cost * 0.05 * 100) / 100;
    }
  }

  saveNewAsset() {
    if (!this.newAsset.code || !this.newAsset.name || !this.newAsset.cost || !this.newAsset.usefulLifeYears) {
      alert('Asset code, name, cost and useful life are required.');
      return;
    }

    const cost = Number(this.newAsset.cost);
    const salvage = Number(this.newAsset.salvageValue || 0);
    const life = Number(this.newAsset.usefulLifeYears);
    const monthlyDepr = Math.round(((cost - salvage) / life / 12) * 100) / 100;

    const item: FixedAssetItem = {
      id: Date.now(),
      code: this.newAsset.code!,
      name: this.newAsset.name!,
      category: this.newAsset.category || 'IT Equipment',
      department: this.newAsset.department || 'Administration',
      branchName: 'Mumbai HO',
      locationName: 'Mumbai Central Warehouse',
      purchaseDate: this.newAsset.purchaseDate || new Date().toISOString().slice(0, 10),
      datePutToUse: this.newAsset.datePutToUse || this.newAsset.purchaseDate || new Date().toISOString().slice(0, 10),
      cost: cost,
      accumDep: 0,
      netBookValue: cost,
      projectedMonthly: monthlyDepr,
      status: 'active',
      usefulLifeYears: life,
      salvageValue: salvage,
      paymentMode: this.newAsset.paymentMode || 'bank'
    };

    this.assets.push(item);
    this.showNewAssetModal = false;
    this.alertMessage = `Asset "${item.code} - ${item.name}" registered and acquisition entry posted to ledger.`;
  }

  applyMethod() {
    if (this.globalMethod === 'wdv') {
      this.assets.forEach(a => {
        // Approximate WDV monthly depreciation
        const rate = 0.40; // example WDV rate
        a.projectedMonthly = Math.round((a.netBookValue * rate / 12) * 100) / 100;
      });
      this.alertMessage = 'Global depreciation method updated to Written Down Value (WDV).';
    } else {
      this.assets.forEach(a => {
        const floor = a.salvageValue || 0;
        const life = a.usefulLifeYears || 5;
        a.projectedMonthly = Math.round(((a.cost - floor) / life / 12) * 100) / 100;
      });
      this.alertMessage = 'Global depreciation method updated to Straight-line (SLM).';
    }
  }

  pushToReports() {
    const amount = this.projectedThisPeriod;
    this.alertMessage = `Current period depreciation of ₹${amount.toLocaleString('en-IN')} successfully pushed to reports (Balance Sheet, P&L, Trial Balance).`;
  }

  deleteAsset(a: FixedAssetItem) {
    if (confirm(`Delete asset ${a.code}? Only possible if it has no depreciation posted yet. This cannot be undone.`)) {
      this.assets = this.assets.filter(item => item.id !== a.id);
      this.alertMessage = `Asset ${a.code} deleted.`;
    }
  }

  deleteAllAssets() {
    if (confirm(`Delete ALL ${this.assets.length} fixed assets? Assets with posted depreciation will be skipped.`)) {
      const skipped = this.assets.filter(a => a.accumDep > 0).length;
      this.assets = this.assets.filter(a => a.accumDep > 0);
      this.alertMessage = `Deleted ${this.assets.length === 0 ? 'all assets' : '0 unposted assets'}. Skipped ${skipped} assets with posted depreciation.`;
    }
  }
}
