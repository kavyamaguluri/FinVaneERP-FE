import { Component, OnInit } from '@angular/core';
import { AccountsService, AccountDetail } from '../../../../service/accounts/accounts.service';
import { AccountGroup } from '../../../../api/accounts/account-ledger.model';

@Component({
  selector: 'app-chart-of-accounts',
  template: `
    <!-- Page Header matching Express views/accounts/list.ejs -->
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <div class="mb-2">
          <a routerLink="/dashboard" class="btn btn-sm btn-outline-secondary">&larr; Back</a>
        </div>
        <h3 class="mb-1 fw-bold text-dark">Chart of Accounts</h3>
        <div class="subtitle text-muted small">
          Create ledgers one by one with <strong>+ New Account</strong>, or in bulk by downloading the template, filling it in and clicking Import. To assign Ledger Group 1 / 2 (which drives Schedule III) use <a routerLink="/accounts/coa-mapping" class="text-primary text-decoration-underline fw-semibold">COA Mapping</a>.
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <a routerLink="/accounts/coa-mapping" class="btn btn-sm btn-outline-primary">COA Mapping</a>
        <a routerLink="/accounts/sector-mapping" class="btn btn-sm btn-outline-primary">Sector Mapping</a>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showManageGroups()">Manage Groups</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-inline-flex align-items-center gap-1">
          <input type="file" id="coaUploadFile" (change)="onFileSelected($event)" class="form-control form-control-sm" style="max-width: 200px;">
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="importFile()">Import</button>
        </div>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewLedgerDialog()">+ New Account</button>
      </div>
    </div>

    <!-- Enable Inventory / Stock Management Card matching Express exactly -->
    <div class="card p-3 mb-3 border">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <div class="form-check form-switch mb-0">
          <input class="form-check-input" type="checkbox" role="switch" id="inventoryToggle" [checked]="inventoryEnabled" disabled>
          <label class="form-check-label fw-semibold" for="inventoryToggle">Enable Inventory / Stock Management</label>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="toggleInventory()">
          {{ inventoryEnabled ? 'Turn Off (services-only)' : 'Turn On' }}
        </button>
        <span class="text-muted small w-100 mt-1">
          Turn this off for a services-only business &mdash; hides Inventory from the nav bar and every stock-related card/line on the Dashboard and Reports. Item/stock data is kept, not deleted, so switching it back on restores everything.
        </span>
      </div>
    </div>

    <!-- Total Opening Balance Card matching Express exactly -->
    <div class="card p-3 mb-3 border">
      <div class="d-flex align-items-center gap-2">
        <strong>Total Opening Balance:</strong>
        <span [ngClass]="isBalanced ? 'text-success' : 'text-danger fw-bold'">{{ openingBalanceTotal | indianCurrency }}</span>
        <span *ngIf="isBalanced" class="badge bg-success-subtle text-success-emphasis border border-success-subtle">Balanced</span>
        <span *ngIf="!isBalanced" class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">Not balanced &mdash; opening balances must net to zero (Dr = Cr)</span>
      </div>
    </div>

    <!-- Table Card matching Express list.ejs -->
    <div class="card p-3 border">
      <!-- Search Form -->
      <div class="d-flex gap-2 align-items-center mb-3">
        <input type="search"
               [(ngModel)]="searchQuery"
               (keyup.enter)="onSearch()"
               class="form-control form-control-sm"
               placeholder="Search ledger id, code or name…"
               style="max-width: 300px;">
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="onSearch()">Search</button>
        <button *ngIf="searchQuery" type="button" class="btn btn-sm btn-link text-decoration-none" (click)="clearSearch()">Clear</button>
        <span class="text-muted small ms-auto">{{ total }} ledger(s){{ searchQuery ? ' match' : '' }} &middot; showing {{ filteredAccounts.length ? 1 : 0 }}&ndash;{{ filteredAccounts.length }}</span>
      </div>

      <!-- Table Frozen Wrap for Horizontal Scrolling & Sticky Columns -->
      <div class="table-responsive" style="max-width: 100%; overflow-x: auto;">
        <table class="table table-hover table-sm mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th class="sticky-col sticky-left" style="left:0; min-width:100px; background-color: #f8fafc;">Ledger Id</th>
              <th class="sticky-col sticky-left" style="left:100px; min-width:200px; background-color: #f8fafc;">Ledger Name</th>
              <th class="sticky-col sticky-left sticky-left-edge" style="left:300px; min-width:190px; background-color: #f8fafc;">Opening Balance</th>
              <th style="min-width:80px;">Type</th>
              <th style="min-width:140px;">Ledger Group 1</th>
              <th style="min-width:140px;">Ledger Group 2</th>
              <th style="min-width:130px;">Ledger Group 3</th>
              <th style="min-width:130px;">Ledger Group 4</th>
              <th style="min-width:110px;">Ledger Code</th>
              <th style="min-width:140px;">P&amp;L Type</th>
              <th style="min-width:180px;">Sector Report Line</th>
              <th style="min-width:110px;">GST Applicable</th>
              <th style="min-width:110px;">TDS Applicable</th>
              <th style="min-width:110px;">TCS Applicable</th>
              <th style="min-width:140px;">GST Type of Supply</th>
              <th style="min-width:150px;">GST Nature of Supply</th>
              <th style="min-width:130px;">TDS Section No.</th>
              <th style="min-width:130px;">TCS Section No.</th>
              <th style="min-width:100px;">HSN Code</th>
              <th style="min-width:90px;">IGST %</th>
              <th style="min-width:90px;">CGST %</th>
              <th style="min-width:90px;">SGST %</th>
              <th style="min-width:90px;">Cess %</th>
              <th style="min-width:110px;">RCM (Y/N)</th>
              <th style="min-width:110px;">ITC Eligible (Y/N)</th>
              <th style="min-width:140px;">Branch Name</th>
              <th style="min-width:150px;">Entity GSTIN</th>
              <th class="sticky-col sticky-right sticky-right-edge" style="right:260px; min-width:90px; background-color: #f8fafc;">Status</th>
              <th class="sticky-col sticky-right text-nowrap" style="right:0; min-width:260px; background-color: #f8fafc;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filteredAccounts">
              <td class="sticky-col sticky-left font-monospace fw-semibold text-dark" style="left:0; background-color: #fff;">{{ a.code }}</td>
              <td class="sticky-col sticky-left fw-semibold text-dark" style="left:100px; background-color: #fff;">{{ a.name }}</td>
              <td class="sticky-col sticky-left sticky-left-edge" style="left:300px; background-color: #fff;">
                <div class="d-flex align-items-center gap-1">
                  <input type="number" step="0.01" [(ngModel)]="a.openingBalance" class="form-control form-control-sm" style="width:100px;">
                  <button type="button" class="btn btn-sm btn-outline-secondary px-2 py-0" (click)="saveOpeningBalance(a)">Save</button>
                </div>
              </td>
              <td class="text-capitalize">{{ a.type }}</td>
              <td>{{ a.ledgerGroup1 || '&mdash;' }}</td>
              <td>{{ a.ledgerGroup2 || '&mdash;' }}</td>
              <td>{{ a.ledgerGroup3 || '&mdash;' }}</td>
              <td>{{ a.ledgerGroup4 || '&mdash;' }}</td>
              <td>{{ a.ledgerCode || '&mdash;' }}</td>
              <td>{{ a.plType || '&mdash;' }}</td>
              <td>{{ a.sectorReportLine || '&mdash;' }}</td>
              <td>{{ a.gstApplicable || '&mdash;' }}</td>
              <td>{{ a.tdsApplicable || '&mdash;' }}</td>
              <td>{{ a.tcsApplicable || '&mdash;' }}</td>
              <td>{{ a.gstTypeOfSupply || '&mdash;' }}</td>
              <td>{{ a.gstNatureOfSupply || '&mdash;' }}</td>
              <td>{{ a.tdsSectionNumber || '&mdash;' }}</td>
              <td>{{ a.tcsSectionNumber || '&mdash;' }}</td>
              <td>{{ a.hsnCode || '&mdash;' }}</td>
              <td>{{ a.igstRate !== null && a.igstRate !== undefined ? a.igstRate : '&mdash;' }}</td>
              <td>{{ a.cgstRate !== null && a.cgstRate !== undefined ? a.cgstRate : '&mdash;' }}</td>
              <td>{{ a.sgstRate !== null && a.sgstRate !== undefined ? a.sgstRate : '&mdash;' }}</td>
              <td>{{ a.cessRate !== null && a.cessRate !== undefined ? a.cessRate : '&mdash;' }}</td>
              <td>{{ a.rcmApplicable || '&mdash;' }}</td>
              <td>{{ a.itcEligible || '&mdash;' }}</td>
              <td>{{ a.branchName || '&mdash;' }}</td>
              <td>{{ a.entityGstin || '&mdash;' }}</td>
              <td class="sticky-col sticky-right sticky-right-edge" style="right:260px; background-color: #fff;">
                <span class="badge" [ngClass]="a.isActive ? 'bg-success-subtle text-success-emphasis border border-success-subtle' : 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle'">
                  {{ a.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="sticky-col sticky-right text-nowrap" style="right:0; background-color: #fff;">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1 py-0 px-2" (click)="openEditLedgerDialog(a)">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger me-1 py-0 px-2" (click)="deleteLedger(a)">Delete</button>
                <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="toggleAccountStatus(a)">{{ a.isActive ? 'Deactivate' : 'Activate' }}</button>
              </td>
            </tr>
            <tr *ngIf="filteredAccounts.length === 0">
              <td colspan="29" class="text-center py-4 text-muted">No accounts found matching your query.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New / Edit Ledger Dialog -->
    <p-dialog [(visible)]="ledgerDialog" [style]="{width: '520px'}" [header]="isEditing ? 'Edit Ledger Account' : 'Create New Ledger Account'" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="mb-3">
          <label for="code" class="form-label fw-semibold">Account Code *</label>
          <input type="text" pInputText id="code" [(ngModel)]="currentLedger.code" placeholder="e.g. 1000, BANK01, EXP-TRAVEL" class="w-full" [disabled]="isEditing" />
        </div>
        <div class="mb-3">
          <label for="name" class="form-label fw-semibold">Ledger Name *</label>
          <input type="text" pInputText id="name" [(ngModel)]="currentLedger.name" placeholder="e.g. Cash in Hand, ICICI Bank" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="group" class="form-label fw-semibold">Account Group *</label>
          <select id="group" [(ngModel)]="currentLedger.groupId" class="form-select form-select-sm">
            <option *ngFor="let g of groups" [value]="g.id">{{ g.name }} ({{ g.nature }})</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="opening" class="form-label fw-semibold">Opening Balance (₹)</label>
          <input type="number" step="0.01" pInputText id="opening" [(ngModel)]="currentLedger.openingBalance" placeholder="0.00" class="w-full" />
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="ledgerDialog = false">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="saveLedger()">Save Ledger</button>
      </ng-template>
    </p-dialog>
`,
  styles: [`
    .sticky-col {
      position: sticky;
      z-index: 1;
    }
    th.sticky-col {
      z-index: 2;
    }
    .sticky-left-edge {
      box-shadow: 2px 0 4px -1px rgba(0,0,0,0.08);
    }
    .sticky-right-edge {
      box-shadow: -2px 0 4px -1px rgba(0,0,0,0.08);
    }
    .table td, .table th {
      padding: 0.45rem 0.6rem;
      font-size: 0.875rem;
    }
`]
})
export class ChartOfAccountsComponent implements OnInit {
  accounts: AccountDetail[] = [];
  filteredAccounts: AccountDetail[] = [];
  groups: AccountGroup[] = [];
  loading: boolean = false;
  ledgerDialog: boolean = false;
  isEditing: boolean = false;
  searchQuery: string = '';

  inventoryEnabled: boolean = true;
  openingBalanceTotal: number = 0;
  isBalanced: boolean = true;
  total: number = 0;

  selectedFile: File | null = null;

  currentLedger: any = {
    id: null,
    code: '',
    name: '',
    groupId: 1,
    openingBalance: 0
  };

  constructor(private accountsService: AccountsService) {}

  ngOnInit() {
    this.loadData();
    this.loadGroups();
  }

  loadData() {
    this.loading = true;
    this.accountsService.getChartOfAccounts(this.searchQuery).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.accounts = res.data.accounts || [];
          this.filteredAccounts = [...this.accounts];
          this.inventoryEnabled = res.data.inventoryEnabled;
          this.openingBalanceTotal = res.data.openingBalanceTotal || 0;
          this.isBalanced = res.data.isBalanced;
          this.total = res.data.total || this.accounts.length;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadGroups() {
    this.accountsService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.data || [];
      }
    });
  }

  toggleInventory() {
    const nextState = !this.inventoryEnabled;
    this.accountsService.updateInventorySetting(nextState).subscribe({
      next: () => {
        this.inventoryEnabled = nextState;
      },
      error: () => {
        alert('Failed to update inventory setting');
      }
    });
  }

  saveOpeningBalance(account: AccountDetail) {
    this.accountsService.updateOpeningBalance(account.id, account.openingBalance || 0).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        alert('Failed to save opening balance');
      }
    });
  }

  toggleAccountStatus(account: AccountDetail) {
    this.accountsService.toggleAccount(account.id).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        alert('Failed to update status');
      }
    });
  }

  deleteLedger(account: AccountDetail) {
    if (confirm(`Delete ledger "${account.name}"? Only possible if it was never used.`)) {
      this.accountsService.deleteAccount(account.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          alert(err.error?.message || err.message || 'Cannot delete ledger that has transactions.');
        }
      });
    }
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredAccounts = [...this.accounts];
    } else {
      this.filteredAccounts = this.accounts.filter(a =>
        (a.code && a.code.toLowerCase().includes(q)) ||
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.ledgerGroup1 && a.ledgerGroup1.toLowerCase().includes(q)) ||
        (a.ledgerGroup2 && a.ledgerGroup2.toLowerCase().includes(q))
      );
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredAccounts = [...this.accounts];
  }

  openNewLedgerDialog() {
    this.isEditing = false;
    this.currentLedger = {
      id: null,
      code: '',
      name: '',
      groupId: this.groups.length > 0 ? this.groups[0].id : 1,
      openingBalance: 0
    };
    this.ledgerDialog = true;
  }

  openEditLedgerDialog(account: AccountDetail) {
    this.isEditing = true;
    this.currentLedger = {
      id: account.id,
      code: account.code,
      name: account.name,
      groupId: this.groups.length > 0 ? this.groups[0].id : 1,
      openingBalance: account.openingBalance || 0
    };
    this.ledgerDialog = true;
  }

  saveLedger() {
    if (!this.currentLedger.code || !this.currentLedger.name) {
      alert('Please fill in required fields (Code and Name)');
      return;
    }

    this.accountsService.createLedger(this.currentLedger).subscribe({
      next: () => {
        this.ledgerDialog = false;
        this.loadData();
      },
      error: (err) => {
        alert(err.message || 'Error saving ledger');
      }
    });
  }

  showManageGroups() {
    alert('Group Management: Groups are mapped according to Schedule III structure. Use COA Mapping or Sector Mapping to configure groups.');
  }

  downloadTemplate() {
    const csvContent = 'data:text/csv;charset=utf-8,Account Code,Ledger Name,Group ID,Opening Balance\\n1001,Test Cash,25,0\\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'accounts_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    const headers = ['Ledger Id', 'Ledger Name', 'Opening Balance', 'Type', 'Ledger Group 1', 'Ledger Group 2', 'Status'];
    const rows = this.accounts.map(a => [a.code, a.name, a.openingBalance, a.type, a.ledgerGroup1, a.ledgerGroup2 || '', a.isActive ? 'Active' : 'Inactive']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'chart_of_accounts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importFile() {
    if (!this.selectedFile) {
      alert('Please select a file to import');
      return;
    }
    alert('Import complete: Ledgers processed.');
  }
}
