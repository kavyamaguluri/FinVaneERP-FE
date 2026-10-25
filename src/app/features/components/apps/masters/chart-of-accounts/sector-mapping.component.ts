import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface SectorRow {
  id: number;
  code: string;
  name: string;
  type: string;
  g1: string;
  g2: string;
  groupId: number;
  amount: number;
  saved: string;
  effective: string;
  effectiveLabel: string;
  source: string;
  status: string;
  selected?: boolean;
}

export interface SectorGroup {
  id: number;
  label: string;
  type: string;
  count: number;
  rule: string;
}

@Component({
  selector: 'app-sector-mapping',
  template: `
    <!-- Page Header matching Express views/accounts/sector_mapping.ejs exactly -->
    <div class="page-header d-flex justify-content-between align-items-start mb-3">
      <div>
        <h3 class="mb-1 fw-bold text-dark" style="font-size: 1.45rem;">Sector Mapping</h3>
        <div class="text-secondary small" style="line-height: 1.45;">
          {{ entityName }} &middot; Layout: <strong>{{ templateLabel }}</strong>. Choose the report line each income / expense ledger appears under in Financials (Sector view) and the Schedule III P&amp;L. Net Profit never changes &mdash; only where an amount is shown.
        </div>
      </div>
      <div class="d-flex flex-column align-items-end gap-2 mt-1">
        <div class="d-flex gap-2 align-items-center flex-wrap">
          <a routerLink="/accounts" class="btn btn-sm btn-outline-secondary">&larr; Chart of Accounts</a>
          <a routerLink="/accounts/coa-mapping" class="btn btn-sm btn-outline-secondary">COA Mapping</a>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export (Excel)</button>
        </div>
        <div>
          <a routerLink="/reports/financials" class="btn btn-sm btn-outline-primary fw-medium">View Financials</a>
        </div>
      </div>
    </div>

    <!-- Top KPI cards matching Express -->
    <div class="d-flex gap-2 flex-wrap mb-3">
      <button type="button" class="btn btn-outline-secondary text-start" [class.active]="filterStatus === ''" style="min-width: 150px;" (click)="setStatusFilter('')">
        <span class="fs-4 fw-semibold d-block" [class.text-white]="filterStatus === ''" [class.text-dark]="filterStatus !== ''">{{ counts.all }}</span>
        <span class="small" [class.text-white-50]="filterStatus === ''" [class.text-muted]="filterStatus !== ''">All ledgers</span>
      </button>
      <button type="button" class="btn btn-outline-secondary text-start" [class.active]="filterStatus === 'mapped'" style="min-width: 150px;" (click)="setStatusFilter('mapped')">
        <span class="fs-4 fw-semibold d-block" [class.text-white]="filterStatus === 'mapped'" [class.text-dark]="filterStatus !== 'mapped'">{{ counts.mapped }}</span>
        <span class="small" [class.text-white-50]="filterStatus === 'mapped'" [class.text-muted]="filterStatus !== 'mapped'">Follows its group / your line</span>
      </button>
    </div>

    <div class="row g-3">
      <!-- Main Content Column (Left: col-lg-9) -->
      <div class="col-lg-9">

        <!-- Collapsible: Map by Ledger Group matching Express -->
        <details class="card p-3 mb-3 border bg-white shadow-sm" [open]="counts.all > 200">
          <summary class="fw-semibold" style="cursor:pointer">
            Map by Ledger Group <span class="text-muted small fw-normal">&mdash; one choice covers every ledger in the group (fastest for thousands of ledgers)</span>
          </summary>
          <div class="table-responsive mt-2" style="max-height: 260px; overflow: auto;">
            <table class="table table-sm align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Ledger Group</th>
                  <th class="text-end">Ledgers</th>
                  <th>Report line for the whole group</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let g of groups">
                  <td>{{ g.label }} <span class="badge text-bg-light border text-muted">{{ g.type }}</span></td>
                  <td class="text-end fw-semibold">{{ g.count }}</td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="g.rule" (change)="onGroupRuleChange(g)" style="min-width: 220px; max-width: 280px;">
                      <option value="">&mdash; no group rule (follows the ledger's group) &mdash;</option>
                      <option *ngFor="let opt of getOptionsForType(g.type)" [value]="opt.key">{{ opt.label }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-muted small mt-2">
            Order of precedence for each ledger: its own saved line, then its group's rule, then the ledger's own Ledger Group.
          </div>
        </details>

        <!-- Ledger List Card with Search, Filter & Bulk Actions -->
        <div class="card p-3 border bg-white shadow-sm">
          <!-- Filter Row -->
          <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
            <input type="search"
                   [(ngModel)]="filterQ"
                   (input)="applyFilters()"
                   class="form-control form-control-sm"
                   placeholder="Search ledger name or code…"
                   style="max-width: 220px;">
            <select [(ngModel)]="filterGrp" (change)="applyFilters()" class="form-select form-select-sm" style="max-width: 200px;">
              <option value="">All Ledger Groups</option>
              <option *ngFor="let pg of primaryGroups" [value]="pg">{{ pg }}</option>
            </select>
            <select [(ngModel)]="filterType" (change)="applyFilters()" class="form-select form-select-sm" style="max-width: 140px;">
              <option value="">Income + Expense</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="form-select form-select-sm" style="max-width: 140px;">
              <option value="">Any status</option>
              <option value="mapped">Mapped</option>
            </select>
            <div class="form-check mb-0">
              <input class="form-check-input" type="checkbox" id="sm-active" [(ngModel)]="filterActive" (change)="applyFilters()">
              <label class="form-check-label small" for="sm-active">Only ledgers with postings</label>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="applyFilters()">Apply filter</button>
            <button type="button" class="btn btn-sm btn-link text-decoration-none" (click)="clearFilters()">Clear</button>
          </div>

          <!-- Bulk Action Row matching Express -->
          <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
            <select [(ngModel)]="bulkLine" class="form-select form-select-sm" style="max-width: 260px;">
              <option value="">Choose a line…</option>
              <optgroup label="Income ledgers">
                <option *ngFor="let opt of lineOptions.income" [value]="opt.key">{{ opt.label }}</option>
              </optgroup>
              <optgroup label="Expense ledgers">
                <option *ngFor="let opt of lineOptions.expense" [value]="opt.key">{{ opt.label }}</option>
              </optgroup>
            </select>
            <button type="button" class="btn btn-sm btn-primary" [disabled]="!hasSelectedRows || !bulkLine" (click)="applyToTicked()">
              Apply to ticked rows
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary" [disabled]="filteredRows.length === 0 || !bulkLine" (click)="applyToAllMatching()">
              Apply to all {{ filteredRows.length }} matching ledgers
            </button>
          </div>

          <!-- Table matching Express table layout & columns exactly -->
          <div class="table-responsive" style="max-height: 62vh; overflow: auto;">
            <table class="table table-sm table-hover align-middle mb-0" id="sm-table">
              <thead class="table-light" style="position: sticky; top: 0; z-index: 1;">
                <tr>
                  <th style="width: 32px;">
                    <input type="checkbox" [(ngModel)]="selectAll" (change)="toggleSelectAll()" title="Tick every row on this page">
                  </th>
                  <th style="width: 100px;">Ledger Id</th>
                  <th>Ledger Name</th>
                  <th>Ledger Group</th>
                  <th class="text-end" style="width: 140px;">Amount (posted)</th>
                  <th style="width: 220px;">Reports under</th>
                  <th style="width: 260px;">Own line for this ledger</th>
                  <th style="width: 90px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of filteredRows">
                  <td>
                    <input type="checkbox" [(ngModel)]="r.selected" (change)="checkSelection()">
                  </td>
                  <td class="font-monospace text-dark">{{ r.code }}</td>
                  <td>
                    <span class="fw-semibold text-dark">{{ r.name }}</span>
                    <span class="badge text-bg-light border text-muted ms-1 text-lowercase">{{ r.type }}</span>
                  </td>
                  <td>{{ r.g1 }}{{ r.g2 ? ' › ' + r.g2 : '' }}</td>
                  <td class="text-end font-monospace">{{ formatAmount(r.amount) }}</td>
                  <td class="small">
                    <span class="text-dark">{{ r.effectiveLabel }}</span><br>
                    <span class="text-muted">{{ r.source === 'ledger' ? 'saved for this ledger' : (r.source === 'group' ? 'group rule' : 'from its group') }}</span>
                  </td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="r.saved" (change)="onLedgerLineChange(r)" style="min-width: 200px;">
                      <option value="">&mdash; {{ r.saved ? 'clear (use group rule / its group)' : 'not set' }} &mdash;</option>
                      <option *ngFor="let opt of getOptionsForType(r.type)" [value]="opt.key">{{ opt.label }}</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge text-bg-success">Mapped</span>
                  </td>
                </tr>
                <tr *ngIf="filteredRows.length === 0">
                  <td colspan="8" class="text-muted py-3 text-center">No ledgers match this filter.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Summary -->
          <div class="d-flex align-items-center mt-2 gap-2 flex-wrap">
            <span class="text-muted small">Showing {{ filteredRows.length ? 1 : 0 }}&ndash;{{ filteredRows.length }} of {{ filteredRows.length }} ledgers</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Instructions Sidebar (col-lg-3) matching Express exactly -->
      <div class="col-lg-3">
        <div class="card p-3 mb-3 border bg-white shadow-sm">
          <h6 class="fw-semibold text-dark mb-2">Mapping thousands of ledgers</h6>
          <div class="small text-muted" style="line-height: 1.55;">
            1. Set a <b>rule per Ledger Group</b> (top box) &mdash; one choice covers the whole group.<br><br>
            3. Filter to <b>Unmapped</b> (or search a word like &quot;wages&quot;) and <b>apply a line to all matching ledgers</b> in one go.<br><br>
            4. Or map in Excel: the Chart of Accounts export/import has a <i>Sector Report Line</i> column.<br><br>
            <b>Mapped</b> = saved on the ledger or set by its group.<br>
            <b>Unmapped</b> = no rule matched; direct expenses report as direct cost, other ledgers as &quot;Administrative &amp; Other&quot;.
          </div>
        </div>
      </div>
    </div>
`,
  styles: [`
    .table td, .table th {
      padding: 0.45rem 0.6rem;
      font-size: 0.875rem;
    }
  `]
})
export class SectorMappingComponent implements OnInit {
  entityName: string = 'Acme Trading Co';
  templateLabel: string = 'Trading';
  counts = { all: 11, mapped: 11 };

  allRows: SectorRow[] = [];
  filteredRows: SectorRow[] = [];
  groups: SectorGroup[] = [];
  primaryGroups: string[] = [];

  lineOptions: { income: { key: string; label: string }[]; expense: { key: string; label: string }[] } = {
    income: [
      { key: 'revenue', label: 'Revenue from Operations' },
      { key: 'other_income', label: 'Other Income' }
    ],
    expense: [
      { key: 'materials', label: 'Purchases of Stock-in-Trade' },
      { key: 'direct_cost', label: 'Direct Expenses (freight inward etc.)' },
      { key: 'employee', label: 'Employee Cost' },
      { key: 'selling', label: 'Selling & Distribution' },
      { key: 'admin', label: 'Administrative & Other' },
      { key: 'depreciation', label: 'Depreciation & Amortisation' },
      { key: 'finance', label: 'Finance Cost' }
    ]
  };

  filterQ: string = '';
  filterGrp: string = '';
  filterType: string = '';
  filterStatus: string = '';
  filterActive: boolean = false;

  bulkLine: string = '';
  selectAll: boolean = false;
  hasSelectedRows: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any>(`${environment.apiBaseUrl}/accounts/sector-mapping`).subscribe({
      next: (res) => {
        if (res && res.data) {
          const d = res.data;
          this.entityName = d.entity?.name || 'Acme Trading Co';
          this.templateLabel = d.template?.label || 'Trading';
          this.counts = d.counts || { all: 11, mapped: 11 };
          this.groups = d.groups || [];
          this.allRows = (d.rows || []).map((r: any) => ({ ...r, selected: false }));
          if (d.lineOptions) this.lineOptions = d.lineOptions;
          this.primaryGroups = [...new Set(this.allRows.map(r => r.g1))].sort();
          this.applyFilters();
        }
      },
      error: () => {}
    });
  }

  getOptionsForType(type: string) {
    return 'income' === (type || '').toLowerCase() ? this.lineOptions.income : this.lineOptions.expense;
  }

  setStatusFilter(status: string) {
    this.filterStatus = this.filterStatus === status ? '' : status;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.filterQ.trim().toLowerCase();
    this.filteredRows = this.allRows.filter(r => {
      const matchQ = !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
      const matchGrp = !this.filterGrp || r.g1 === this.filterGrp || r.g2 === this.filterGrp;
      const matchType = !this.filterType || r.type.toLowerCase() === this.filterType.toLowerCase();
      const matchStatus = !this.filterStatus || r.status === this.filterStatus;
      const matchActive = !this.filterActive || Math.abs(r.amount) >= 0.005;
      return matchQ && matchGrp && matchType && matchStatus && matchActive;
    });
    this.checkSelection();
  }

  clearFilters() {
    this.filterQ = '';
    this.filterGrp = '';
    this.filterType = '';
    this.filterStatus = '';
    this.filterActive = false;
    this.applyFilters();
  }

  toggleSelectAll() {
    this.filteredRows.forEach(r => r.selected = this.selectAll);
    this.hasSelectedRows = this.selectAll && this.filteredRows.length > 0;
  }

  checkSelection() {
    this.hasSelectedRows = this.filteredRows.some(r => r.selected);
    this.selectAll = this.filteredRows.length > 0 && this.filteredRows.every(r => r.selected);
  }

  onGroupRuleChange(g: SectorGroup) {
    this.http.post<any>(`${environment.apiBaseUrl}/accounts/sector-mapping/group`, {
      group_id: g.id,
      line: g.rule
    }).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        alert('Failed to update group rule');
      }
    });
  }

  onLedgerLineChange(r: SectorRow) {
    this.http.post<any>(`${environment.apiBaseUrl}/accounts/sector-mapping/save`, {
      ids: [r.id],
      line: r.saved
    }).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        alert('Failed to update ledger report line');
      }
    });
  }

  applyToTicked() {
    const selectedIds = this.filteredRows.filter(r => r.selected).map(r => r.id);
    if (!selectedIds.length || !this.bulkLine) return;
    this.http.post<any>(`${environment.apiBaseUrl}/accounts/sector-mapping/save`, {
      ids: selectedIds,
      line: this.bulkLine
    }).subscribe({
      next: () => {
        this.bulkLine = '';
        this.loadData();
      },
      error: () => {
        alert('Failed to apply line to selected ledgers');
      }
    });
  }

  applyToAllMatching() {
    const allMatchingIds = this.filteredRows.map(r => r.id);
    if (!allMatchingIds.length || !this.bulkLine) return;
    this.http.post<any>(`${environment.apiBaseUrl}/accounts/sector-mapping/save`, {
      ids: allMatchingIds,
      line: this.bulkLine
    }).subscribe({
      next: () => {
        this.bulkLine = '';
        this.loadData();
      },
      error: () => {
        alert('Failed to apply line to all matching ledgers');
      }
    });
  }

  formatAmount(val: number): string {
    if (val == null || isNaN(val)) return '0.00';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const parts = absVal.toFixed(2).split('.');
    let intPart = parts[0];
    const decPart = parts[1];
    if (intPart.length > 3) {
      const last3 = intPart.substring(intPart.length - 3);
      const rest = intPart.substring(0, intPart.length - 3);
      intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    }
    return (isNeg ? '-' : '') + intPart + '.' + decPart;
  }

  exportExcel() {
    const headers = ['Ledger Id', 'Ledger Name', 'Type', 'Ledger Group', 'Amount (posted)', 'Reports under', 'Status'];
    const rows = this.filteredRows.map(r => [
      r.code,
      r.name,
      r.type,
      r.g1 + (r.g2 ? ' › ' + r.g2 : ''),
      this.formatAmount(r.amount),
      r.effectiveLabel,
      r.status
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'sector_mapping.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
