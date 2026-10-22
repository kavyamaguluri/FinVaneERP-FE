import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../../../../service/accounts/accounts.service';
import { AccountGroup, AccountLedger } from '../../../../api/accounts/account-ledger.model';

@Component({
  selector: 'app-chart-of-accounts',
  template: `
    <!-- Page Header matching Express list.ejs -->
    <div class="page-header">
      <div>
        <h3 class="mb-0">Chart of Accounts</h3>
        <div class="subtitle">
          Create ledgers one by one with <strong>+ New Account</strong>, or in bulk by downloading the template, filling it in and clicking Import. To assign Ledger Group 1 / 2 (which drives Schedule III) use <a routerLink="/accounts/coa-mapping" class="text-brand fw-semibold">COA Mapping</a>.
        </div>
      </div>
      <div class="io-toolbar">
        <a routerLink="/accounts/coa-mapping" class="btn btn-sm btn-outline-primary">COA Mapping</a>
        <a routerLink="/accounts/sector-mapping" class="btn btn-sm btn-outline-primary">Sector Mapping</a>
        <button type="button" class="btn btn-sm btn-outline-secondary">Manage Groups</button>
        <button type="button" class="btn btn-sm btn-outline-secondary"><i class="bi bi-download me-1"></i>Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary"><i class="bi bi-upload me-1"></i>Import</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewLedgerDialog()">+ New Account</button>
      </div>
    </div>

    <!-- Opening Balance Banner Card -->
    <div class="card p-3 mb-3">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <strong>Total Opening Balance:</strong>
        <span class="text-success fw-bold">₹0.00</span>
        <span class="badge bg-brand-soft text-brand">Balanced (Dr = Cr)</span>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card p-3">
      <!-- Search Bar -->
      <div class="d-flex gap-2 align-items-center mb-3">
        <input type="search"
               [(ngModel)]="searchQuery"
               (input)="onSearch()"
               class="form-control form-control-sm"
               placeholder="Search ledger code or name…"
               style="max-width: 320px;">
        <span class="text-muted small ms-auto">{{ filteredLedgers.length }} ledger(s) found</span>
      </div>

      <!-- Ledgers Table -->
      <p-table [value]="filteredLedgers"
               [loading]="loading"
               responsiveLayout="scroll"
               styleClass="p-datatable-sm"
               [paginator]="true"
               [rows]="15"
               [showCurrentPageReport]="true"
               currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ledgers">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 15%">Ledger Code</th>
            <th style="width: 35%">Ledger Name</th>
            <th style="width: 25%">Ledger Group</th>
            <th style="width: 15%" class="text-end">Current Balance</th>
            <th style="width: 10%" class="text-center">Status</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-ledger>
          <tr>
            <td class="font-monospace fw-semibold text-brand">{{ ledger.code }}</td>
            <td class="fw-semibold text-dark">{{ ledger.name }}</td>
            <td>
              <span class="badge bg-brand-soft text-brand">
                {{ ledger.groupName || 'Current Assets' }}
              </span>
            </td>
            <td class="text-end font-monospace fw-semibold" [ngClass]="{'text-success': ledger.currentBalance >= 0, 'text-danger': ledger.currentBalance < 0}">
              {{ ledger.currentBalance | indianCurrency }}
            </td>
            <td class="text-center">
              <span class="badge badge-status-active" *ngIf="ledger.isActive !== false">Active</span>
              <span class="badge badge-status-rejected" *ngIf="ledger.isActive === false">Inactive</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4 text-muted">No ledgers found. Click "+ New Account" to add one.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- New Ledger Dialog -->
    <p-dialog [(visible)]="ledgerDialog" [style]="{width: '500px'}" header="Create New Ledger Account" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="mb-3">
          <label for="code" class="form-label">Account Code *</label>
          <input type="text" pInputText id="code" [(ngModel)]="newLedger.code" placeholder="e.g. BANK02, EXP-TRAVEL" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="name" class="form-label">Ledger Name *</label>
          <input type="text" pInputText id="name" [(ngModel)]="newLedger.name" placeholder="e.g. ICICI Bank, Travelling Expense" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="group" class="form-label">Primary Account Group *</label>
          <select id="group" [(ngModel)]="newLedger.groupId" class="form-select form-select-sm">
            <option *ngFor="let g of groups" [value]="g.id">{{ g.name }} ({{ g.nature }})</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="opening" class="form-label">Opening Balance (₹)</label>
          <input type="number" pInputText id="opening" [(ngModel)]="newLedger.openingBalance" placeholder="0.00" class="w-full" />
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="ledgerDialog = false">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="saveLedger()">Save Ledger</button>
      </ng-template>
    </p-dialog>
  `
})
export class ChartOfAccountsComponent implements OnInit {
  ledgers: AccountLedger[] = [];
  filteredLedgers: AccountLedger[] = [];
  groups: AccountGroup[] = [];
  loading: boolean = false;
  ledgerDialog: boolean = false;
  searchQuery: string = '';

  newLedger: AccountLedger = {
    code: '',
    name: '',
    groupId: 1,
    openingBalance: 0,
    currentBalance: 0
  };

  constructor(private accountsService: AccountsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.accountsService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.data || [];
        if (this.groups.length > 0) {
          this.newLedger.groupId = this.groups[0].id;
        }
      }
    });

    this.accountsService.getAllActiveLedgers().subscribe({
      next: (res) => {
        this.ledgers = res.data || [];
        this.filteredLedgers = [...this.ledgers];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredLedgers = [...this.ledgers];
    } else {
      this.filteredLedgers = this.ledgers.filter(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.code && l.code.toLowerCase().includes(q)) ||
        (l.groupName && l.groupName.toLowerCase().includes(q))
      );
    }
  }

  openNewLedgerDialog() {
    this.newLedger = {
      code: '',
      name: '',
      groupId: this.groups.length > 0 ? this.groups[0].id : 1,
      openingBalance: 0,
      currentBalance: 0
    };
    this.ledgerDialog = true;
  }

  saveLedger() {
    if (!this.newLedger.code || !this.newLedger.name) {
      alert('Please fill in required fields (Code and Name)');
      return;
    }

    this.accountsService.createLedger(this.newLedger).subscribe({
      next: () => {
        this.ledgerDialog = false;
        this.loadData();
      },
      error: (err) => {
        alert(err.message || 'Error creating ledger');
      }
    });
  }
}
