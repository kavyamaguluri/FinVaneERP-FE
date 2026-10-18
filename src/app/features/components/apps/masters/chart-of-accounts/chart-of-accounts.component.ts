import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../../../../service/accounts/accounts.service';
import { AccountGroup, AccountLedger } from '../../../../api/accounts/account-ledger.model';

@Component({
  selector: 'app-chart-of-accounts',
  template: `
    <div class="p-card p-4">
      <div class="flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 class="text-xl font-bold text-900 m-0">Masters > Chart of Accounts</h2>
          <span class="text-sm text-500">Manage ledgers, primary groups, and opening balances</span>
        </div>
        <div class="flex gap-2">
          <button pButton label="New Account" icon="pi pi-plus" class="p-button-sm" (click)="openNewLedgerDialog()"></button>
        </div>
      </div>

      <!-- PrimeNG Table for Ledgers -->
      <p-table [value]="ledgers"
               [loading]="loading"
               responsiveLayout="scroll"
               styleClass="p-datatable-sm p-datatable-striped"
               [paginator]="true"
               [rows]="15"
               [showCurrentPageReport]="true"
               currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ledgers">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 15%">Code</th>
            <th style="width: 30%">Ledger Name</th>
            <th style="width: 25%">Group</th>
            <th style="width: 15%" class="text-right">Current Balance</th>
            <th style="width: 15%" class="text-center">Status</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-ledger>
          <tr>
            <td class="font-mono font-semibold text-primary">{{ ledger.code }}</td>
            <td class="font-medium text-900">{{ ledger.name }}</td>
            <td>
              <span class="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-round font-medium">
                {{ ledger.groupName || 'Current Assets' }}
              </span>
            </td>
            <td class="text-right font-mono font-semibold">
              <span [ngClass]="{'text-green-600': ledger.currentBalance >= 0, 'text-red-600': ledger.currentBalance < 0}">
                {{ ledger.currentBalance | indianCurrency }}
              </span>
            </td>
            <td class="text-center">
              <span class="p-badge p-badge-success text-xs" *ngIf="ledger.isActive !== false">Active</span>
              <span class="p-badge p-badge-danger text-xs" *ngIf="ledger.isActive === false">Inactive</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4 text-500">No ledgers found. Click "+ New Account" to add one.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- New Ledger Dialog -->
    <p-dialog [(visible)]="ledgerDialog" [style]="{width: '500px'}" header="Create New Ledger Account" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="field mb-3">
          <label for="code" class="font-semibold text-sm">Account Code *</label>
          <input type="text" pInputText id="code" [(ngModel)]="newLedger.code" placeholder="e.g. BANK02, EXP-TRAVEL" class="w-full" />
        </div>
        <div class="field mb-3">
          <label for="name" class="font-semibold text-sm">Ledger Name *</label>
          <input type="text" pInputText id="name" [(ngModel)]="newLedger.name" placeholder="e.g. ICICI Bank, Travelling Expense" class="w-full" />
        </div>
        <div class="field mb-3">
          <label for="group" class="font-semibold text-sm">Primary Account Group *</label>
          <select id="group" [(ngModel)]="newLedger.groupId" class="w-full p-2 border-1 surface-border border-round text-sm">
            <option *ngFor="let g of groups" [value]="g.id">{{ g.name }} ({{ g.nature }})</option>
          </select>
        </div>
        <div class="field mb-3">
          <label for="opening" class="font-semibold text-sm">Opening Balance (₹)</label>
          <input type="number" pInputText id="opening" [(ngModel)]="newLedger.openingBalance" placeholder="0.00" class="w-full" />
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text p-button-sm" (click)="ledgerDialog = false"></button>
        <button pButton label="Save Ledger" icon="pi pi-check" class="p-button-sm" (click)="saveLedger()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class ChartOfAccountsComponent implements OnInit {
  ledgers: AccountLedger[] = [];
  groups: AccountGroup[] = [];
  loading: boolean = false;
  ledgerDialog: boolean = false;

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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
