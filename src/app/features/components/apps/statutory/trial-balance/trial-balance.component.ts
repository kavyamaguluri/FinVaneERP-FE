import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface TrialBalanceRow {
  id: number;
  code: string;
  name: string;
  primaryGroupName: string;
  secondaryGroupName: string;
  openingDr: number;
  openingCr: number;
  debit: number;
  credit: number;
  closingDr: number;
  closingCr: number;
}

@Component({
  selector: 'app-trial-balance',
  template: `
    <div class="page-header no-print d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">Trial Balance</h3>
        <div class="subtitle text-muted small">
          Opening Balance, Debit, Credit and Closing Balance for the period selected below. Income/Expense ledgers always show a zero Opening Balance (they reset every period) &mdash; any manually entered opening balance on one is folded into the Profit and Loss Account ledger instead.
        </div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" (click)="exportExcel()" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-file-earmark-excel me-1"></i>Export Excel
        </button>
        <button type="button" (click)="exportPdf()" class="btn btn-sm btn-outline-danger">
          <i class="bi bi-file-earmark-pdf me-1"></i>Export PDF
        </button>
      </div>
    </div>

    <!-- Date range warning matching Express -->
    <div *ngIf="dateRangeCorrected" class="alert alert-warning py-2 mb-3 small alert-dismissible fade show" role="alert">
      <strong>Notice:</strong> "To" date cannot be earlier than "From" date. Clamped to {{ from }}.
      <button type="button" class="btn-close py-2" (click)="dateRangeCorrected = false"></button>
    </div>

    <!-- Period Filter Bar matching Express -->
    <div class="filter-bar no-print card p-3 mb-3 bg-light border-0 shadow-sm">
      <form (submit)="applyFilter($event)" class="row g-2 align-items-end" id="period-filter-form">
        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold">Granularity</label>
          <select [(ngModel)]="granularity" name="granularity" (change)="onGranularityChange()" class="form-select form-select-sm" style="min-width: 130px;">
            <option value="custom">Custom</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half-Yearly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold">From</label>
          <input type="date" [(ngModel)]="from" name="from" class="form-control form-control-sm" required />
        </div>

        <div class="col-auto">
          <label class="form-label mb-0 small fw-semibold">To</label>
          <input type="date" [(ngModel)]="to" name="to" class="form-control form-control-sm" required />
        </div>

        <div class="col-auto d-flex gap-1">
          <button type="button" (click)="applyFilter($event)" class="btn btn-sm btn-primary">Apply</button>
          <button type="button" (click)="shiftPeriod(-1)" [disabled]="granularity === 'custom'" class="btn btn-sm btn-outline-secondary" title="Previous period">&larr;</button>
          <button type="button" (click)="shiftPeriod(1)" [disabled]="granularity === 'custom'" class="btn btn-sm btn-outline-secondary" title="Next period">&rarr;</button>
          <button type="button" (click)="resetToToday()" class="btn btn-sm btn-outline-secondary">Reset to Today</button>
        </div>

        <div class="col-auto ms-auto">
          <label class="form-label mb-0 small fw-semibold">Search Ledgers</label>
          <input type="text" [(ngModel)]="searchTerm" name="searchTerm" (input)="filterRows()" placeholder="Filter by code or name..." class="form-control form-control-sm" style="min-width: 220px;" />
        </div>
      </form>
    </div>

    <!-- Trial Balance Table matching Express exactly -->
    <div class="table-responsive bg-white rounded border shadow-sm">
      <table class="table table-hover table-sm mb-0 align-middle">
        <thead class="table-light">
          <tr class="text-secondary small fw-semibold">
            <th colspan="4" class="py-2 px-3">Account</th>
            <th colspan="2" class="text-center border-start py-2">Opening Balance</th>
            <th colspan="2" class="text-center border-start py-2">Transactions (this period)</th>
            <th colspan="2" class="text-center border-start py-2">Closing Balance</th>
          </tr>
          <tr class="small text-muted" style="border-top: 1px solid #dee2e6;">
            <th style="min-width: 80px;" class="px-3">Code</th>
            <th style="min-width: 220px;">Ledger</th>
            <th style="min-width: 140px;">Primary Group</th>
            <th style="min-width: 140px;">Secondary Group</th>
            <th class="text-end border-start" style="min-width: 120px;">Debit (â‚¹)</th>
            <th class="text-end" style="min-width: 120px;">Credit (â‚¹)</th>
            <th class="text-end border-start" style="min-width: 120px;">Debit (â‚¹)</th>
            <th class="text-end" style="min-width: 120px;">Credit (â‚¹)</th>
            <th class="text-end border-start" style="min-width: 120px;">Debit (â‚¹)</th>
            <th class="text-end px-3" style="min-width: 120px;">Credit (â‚¹)</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of filteredRows">
            <td class="font-monospace small px-3 text-secondary">
              <a [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset text-decoration-none">
                {{ row.code }}
              </a>
            </td>
            <td class="fw-semibold text-dark">
              <a [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset text-decoration-none">
                {{ row.name }}
              </a>
            </td>
            <td><span class="badge bg-light text-dark border">{{ row.primaryGroupName }}</span></td>
            <td class="text-muted small">{{ row.secondaryGroupName || 'â€”' }}</td>
            <td class="text-end border-start font-monospace text-secondary">
              <a *ngIf="row.openingDr" [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset" style="border-bottom: 1px dotted #0d6efd; text-decoration: none;">
                {{ formatNumber(row.openingDr) }}
              </a>
            </td>
            <td class="text-end font-monospace text-secondary">
              <a *ngIf="row.openingCr" [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset" style="border-bottom: 1px dotted #0d6efd; text-decoration: none;">
                {{ formatNumber(row.openingCr) }}
              </a>
            </td>
            <td class="text-end border-start font-monospace" [class.text-dark]="row.debit" [class.fw-bold]="row.debit">
              <a *ngIf="row.debit" [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset" style="border-bottom: 1px dotted #0d6efd; text-decoration: none;">
                {{ formatNumber(row.debit) }}
              </a>
            </td>
            <td class="text-end font-monospace" [class.text-dark]="row.credit" [class.fw-bold]="row.credit">
              <a *ngIf="row.credit" [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset" style="border-bottom: 1px dotted #0d6efd; text-decoration: none;">
                {{ formatNumber(row.credit) }}
              </a>
            </td>
            <td class="text-end border-start font-monospace" [class.text-dark]="row.closingDr" [class.fw-bold]="row.closingDr">
              <a *ngIf="row.closingDr" [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset" style="border-bottom: 1px dotted #0d6efd; text-decoration: none;">
                {{ formatNumber(row.closingDr) }}
              </a>
            </td>
            <td class="text-end font-monospace px-3" [class.text-dark]="row.closingCr" [class.fw-bold]="row.closingCr">
              <a *ngIf="row.closingCr" [routerLink]="['/reports/ledger', row.id]" [queryParams]="{ from: from, to: to }" class="text-reset" style="border-bottom: 1px dotted #0d6efd; text-decoration: none;">
                {{ formatNumber(row.closingCr) }}
              </a>
            </td>
          </tr>
          <tr *ngIf="filteredRows.length === 0">
            <td colspan="10" class="text-center py-4 text-muted">No accounts match the current filters.</td>
          </tr>
        </tbody>
        <tfoot class="table-light fw-bold">
          <tr style="border-top: 2px solid #adb5bd;">
            <td colspan="4" class="px-3 py-2 text-dark">Total</td>
            <td class="text-end border-start font-monospace text-dark">{{ formatNumber(totals.openingDr) }}</td>
            <td class="text-end font-monospace text-dark">{{ formatNumber(totals.openingCr) }}</td>
            <td class="text-end border-start font-monospace text-dark">{{ formatNumber(totals.debit) }}</td>
            <td class="text-end font-monospace text-dark">{{ formatNumber(totals.credit) }}</td>
            <td class="text-end border-start font-monospace text-dark">{{ formatNumber(totals.closingDr) }}</td>
            <td class="text-end font-monospace px-3 text-dark">{{ formatNumber(totals.closingCr) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .table th, .table td { vertical-align: middle; }
    @media print {
      .no-print { display: none !important; }
      .table { font-size: 10px; }
    }
  `]
})
export class TrialBalanceComponent implements OnInit, OnDestroy {
  granularity: string = 'custom';
  from: string = '';
  to: string = '';
  dateRangeCorrected: boolean = false;
  searchTerm: string = '';

  rows: TrialBalanceRow[] = [];
  filteredRows: TrialBalanceRow[] = [];

  totals = {
    openingDr: 0,
    openingCr: 0,
    debit: 0,
    credit: 0,
    closingDr: 0,
    closingCr: 0
  };

  private sub: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.to = today;

    this.sub = this.route.queryParams.subscribe((params: Params) => {
      let changed = false;
      if (params['granularity'] && params['granularity'] !== this.granularity) {
        this.granularity = params['granularity'];
        changed = true;
      }
      if (params['from'] && params['from'] !== this.from) {
        this.from = params['from'];
        changed = true;
      }
      if (params['to'] && params['to'] !== this.to) {
        this.to = params['to'];
        changed = true;
      }

      this.loadReportData();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadReportData(): void {
    if (this.from && this.to && this.from > this.to) {
      this.to = this.from;
      this.dateRangeCorrected = true;
    } else {
      this.dateRangeCorrected = false;
    }

    const url = `${environment.apiBaseUrl}/reports/trial-balance?from=${this.from}&to=${this.to}&granularity=${this.granularity}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res && res.data) {
          if (res.data.dateRangeCorrected !== undefined) {
            this.dateRangeCorrected = res.data.dateRangeCorrected;
          }
          if (res.data.rows) {
            this.rows = res.data.rows.map((r: any) => ({
              id: r.id,
              code: r.code,
              name: (r.name || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
              primaryGroupName: (r.primaryGroupName || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
              secondaryGroupName: (r.secondaryGroupName || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
              openingDr: Number(r.openingDr) || 0,
              openingCr: Number(r.openingCr) || 0,
              debit: Number(r.debit) || 0,
              credit: Number(r.credit) || 0,
              closingDr: Number(r.closingDr) || 0,
              closingCr: Number(r.closingCr) || 0
            }));
          }
          if (res.data.totals) {
            this.totals = {
              openingDr: Number(res.data.totals.openingDr) || 0,
              openingCr: Number(res.data.totals.openingCr) || 0,
              debit: Number(res.data.totals.debit) || 0,
              credit: Number(res.data.totals.credit) || 0,
              closingDr: Number(res.data.totals.closingDr) || 0,
              closingCr: Number(res.data.totals.closingCr) || 0
            };
          }
          this.filterRows();
        }
      },
      error: (err) => {
        console.error('Failed to load Trial Balance from MySQL:', err);
      }
    });
  }

  applyFilter(e?: Event): void {
    if (e) e.preventDefault();

    if (this.from && this.to && this.from > this.to) {
      this.to = this.from;
      this.dateRangeCorrected = true;
    } else {
      this.dateRangeCorrected = false;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        granularity: this.granularity,
        from: this.from,
        to: this.to
      },
      queryParamsHandling: 'merge'
    });

    this.loadReportData();
  }

  onGranularityChange(): void {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth(); // 0-indexed

    if (this.granularity === 'monthly') {
      const start = new Date(Date.UTC(curYear, curMonth, 1));
      const end = new Date(Date.UTC(curYear, curMonth + 1, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'quarterly') {
      // Indian FY: April is month 3
      const fy = curMonth >= 3 ? curYear : curYear - 1;
      const qIdx = Math.floor(((curMonth - 3 + 12) % 12) / 3);
      const startMonth = 3 + qIdx * 3;
      const start = new Date(Date.UTC(fy, startMonth, 1));
      const end = new Date(Date.UTC(fy, startMonth + 3, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'half_yearly') {
      const fy = curMonth >= 3 ? curYear : curYear - 1;
      const hIdx = Math.floor(((curMonth - 3 + 12) % 12) / 6);
      const startMonth = 3 + hIdx * 6;
      const start = new Date(Date.UTC(fy, startMonth, 1));
      const end = new Date(Date.UTC(fy, startMonth + 6, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'annually') {
      const fy = curMonth >= 3 ? curYear : curYear - 1;
      this.from = `${fy}-04-01`;
      this.to = `${fy + 1}-03-31`;
    }

    this.applyFilter();
  }

  shiftPeriod(direction: number): void {
    if (this.granularity === 'custom') return;
    const curFrom = new Date(this.from + 'T00:00:00Z');
    const year = curFrom.getUTCFullYear();
    const month = curFrom.getUTCMonth();

    if (this.granularity === 'monthly') {
      const start = new Date(Date.UTC(year, month + direction, 1));
      const end = new Date(Date.UTC(year, month + direction + 1, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'quarterly') {
      const fy = month >= 3 ? year : year - 1;
      const qIdx = Math.floor(((month - 3 + 12) % 12) / 3) + direction;
      const newMonth = 3 + qIdx * 3;
      const start = new Date(Date.UTC(fy, newMonth, 1));
      const end = new Date(Date.UTC(fy, newMonth + 3, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'half_yearly') {
      const fy = month >= 3 ? year : year - 1;
      const hIdx = Math.floor(((month - 3 + 12) % 12) / 6) + direction;
      const newMonth = 3 + hIdx * 6;
      const start = new Date(Date.UTC(fy, newMonth, 1));
      const end = new Date(Date.UTC(fy, newMonth + 6, 0));
      this.from = start.toISOString().split('T')[0];
      this.to = end.toISOString().split('T')[0];
    } else if (this.granularity === 'annually') {
      const curFy = parseInt(this.from.split('-')[0], 10) + direction;
      this.from = `${curFy}-04-01`;
      this.to = `${curFy + 1}-03-31`;
    }

    this.applyFilter();
  }

  resetToToday(): void {
    this.granularity = 'custom';
    this.from = this.getFyStart();
    this.to = new Date().toISOString().split('T')[0];
    this.dateRangeCorrected = false;
    this.searchTerm = '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        granularity: this.granularity,
        from: this.from,
        to: this.to
      }
    });

    this.loadReportData();
  }

  filterRows(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRows = [...this.rows];
    } else {
      const q = this.searchTerm.toLowerCase().trim();
      this.filteredRows = this.rows.filter(r =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.primaryGroupName.toLowerCase().includes(q) ||
        (r.secondaryGroupName && r.secondaryGroupName.toLowerCase().includes(q))
      );
    }
  }

  exportExcel(): void {
    let csv = 'Code,Ledger,Primary Group,Secondary Group,Opening Dr,Opening Cr,Txn Dr,Txn Cr,Closing Dr,Closing Cr\n';
    this.rows.forEach(r => {
      csv += `"${r.code}","${r.name}","${r.primaryGroupName}","${r.secondaryGroupName}",${r.openingDr},${r.openingCr},${r.debit},${r.credit},${r.closingDr},${r.closingCr}\n`;
    });
    csv += `"Total","","","",${this.totals.openingDr},${this.totals.openingCr},${this.totals.debit},${this.totals.credit},${this.totals.closingDr},${this.totals.closingCr}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${this.from}-to-${this.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    window.print();
  }

  formatNumber(val: number | undefined | null): string {
    if (val === undefined || val === null || val === 0) return '0.00';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

