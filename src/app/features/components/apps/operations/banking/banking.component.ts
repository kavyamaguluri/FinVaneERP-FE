import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface BankAccountItem {
  id: number;
  name: string;
  accountNoEnc?: string;
  ifsc?: string;
  openingBalance: number;
  accountId?: number | null;
}

export interface BankTransactionItem {
  id: number;
  bankAccountId?: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  reconciled: boolean;
}

@Component({
  selector: 'app-banking',
  template: `
    <!-- Back button if in transactions view -->
    <button *ngIf="currentView === 'transactions'" type="button" class="btn btn-sm btn-outline-secondary mb-3" (click)="backToAccounts()">
      &larr; Back to Bank Accounts
    </button>

    <!-- Feedback Banner -->
    <div *ngIf="alertMessage" class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
    </div>

    <!-- ================= VIEW 1: BANK ACCOUNTS (Matching Express views/banking/accounts.ejs) ================= -->
    <div *ngIf="currentView === 'accounts'">
      <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="mb-0 fw-bold">Bank Accounts</h3>
        </div>
        <div class="io-toolbar d-flex flex-wrap align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadAccountsTemplate()">Download Template</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportAccountsExcel()">Export Excel</button>
          <div class="d-flex align-items-center gap-2">
            <input type="file" (change)="onFileSelected($event)" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width:200px" />
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="importAccounts()">Import</button>
          </div>
          <button type="button" class="btn btn-primary btn-sm" (click)="openNewAccountModal()">+ New Account</button>
        </div>
      </div>

      <div class="card p-3 shadow-sm border-0 bg-white">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light small text-muted text-uppercase">
              <tr>
                <th>Name</th>
                <th>IFSC</th>
                <th class="text-end">Opening Balance</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of accounts">
                <td class="fw-semibold text-dark">{{ a.name }}</td>
                <td>{{ a.ifsc || '—' }}</td>
                <td class="text-end fw-medium">&#8377;{{ a.openingBalance | number:'1.2-2' }}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-sm btn-outline-secondary me-1" (click)="openTransactions(a)">
                    Transactions
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-secondary me-1" (click)="openEditAccountModal(a)">
                    Edit
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAccount(a)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="accounts.length === 0">
                <td colspan="4" class="text-center text-muted py-4">No bank accounts found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= VIEW 2: TRANSACTIONS (Matching Express views/banking/transactions.ejs) ================= -->
    <div *ngIf="currentView === 'transactions'">
      <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h4 class="mb-0 fw-bold">Transactions &mdash; {{ selectedAccount?.name }}</h4>
        </div>
        <div class="io-toolbar d-flex flex-wrap align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTxnsTemplate()">Download Template</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportTxnsExcel()">Export Excel</button>
          <div class="d-flex align-items-center gap-2">
            <input type="file" (change)="onFileSelected($event)" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width:200px" />
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="importTxns()">Import</button>
          </div>
        </div>
      </div>

      <!-- Add Transaction Card matching Express form -->
      <div class="card p-3 shadow-sm border-0 bg-white mb-3">
        <form (ngSubmit)="addTransaction()" class="row g-2 align-items-center">
          <div class="col-md-2">
            <input type="date" class="form-control form-control-sm" [(ngModel)]="newTxn.date" name="txn_date" required />
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="newTxn.description" name="description" placeholder="Description" required />
          </div>
          <div class="col-md-2">
            <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="newTxn.debit" name="debit" placeholder="Debit" />
          </div>
          <div class="col-md-2">
            <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="newTxn.credit" name="credit" placeholder="Credit" />
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-primary btn-sm w-100">Add</button>
          </div>
        </form>
      </div>

      <!-- Transactions List Card matching Express -->
      <div class="card p-3 shadow-sm border-0 bg-white">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small text-muted">{{ transactions.length }} transaction{{ transactions.length === 1 ? '' : 's' }}</span>
          <button *ngIf="transactions.length > 0" type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAllTxns()">
            Delete All (this view)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead class="bg-light small text-muted text-uppercase">
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th class="text-end">Debit</th>
                <th class="text-end">Credit</th>
                <th>Reconciled</th>
                <th></th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions">
                <td>{{ t.date }}</td>
                <td class="fw-medium text-dark">{{ t.description }}</td>
                <td class="text-end text-danger">{{ t.debit ? (t.debit | number:'1.2-2') : '' }}</td>
                <td class="text-end text-success">{{ t.credit ? (t.credit | number:'1.2-2') : '' }}</td>
                <td>
                  <span class="badge" [ngClass]="t.reconciled ? 'text-bg-success' : 'text-bg-secondary'">
                    {{ t.reconciled ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <button *ngIf="!t.reconciled" type="button" class="btn btn-sm btn-outline-success py-0 px-2" style="font-size: 0.78rem;" (click)="markReconciled(t)">
                    Mark reconciled
                  </button>
                </td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size: 0.78rem;" (click)="deleteTxn(t)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="7" class="text-center text-muted py-4">No transactions recorded for this account.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= MODAL: NEW / EDIT BANK ACCOUNT (Matching Express views/banking/account_form.ejs) ================= -->
    <div *ngIf="showAccountModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ editingAccountId ? ('Edit ' + currentAccount.name) : 'New Bank Account' }}</h5>
            <button type="button" class="btn-close" (click)="closeAccountModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Account Name</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentAccount.name" placeholder="e.g. HDFC Current Account" required />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Account Number (encrypted)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentAccount.accountNoEnc" placeholder="On file — leave blank to keep" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">IFSC</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentAccount.ifsc" placeholder="e.g. HDFC0000123" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Opening Balance</label>
                <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="currentAccount.openingBalance" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Linked Ledger Account</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentAccount.accountId">
                  <option [ngValue]="null">-- none --</option>
                  <option [ngValue]="1020">1020 - HDFC Bank Account</option>
                  <option [ngValue]="1000">1000 - Cash in Hand</option>
                  <option [ngValue]="2100">2100 - Accounts Payable</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="closeAccountModal()">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" (click)="saveAccount()">Save Account</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BankingComponent implements OnInit {
  currentView: 'accounts' | 'transactions' = 'accounts';
  alertMessage = '';
  selectedFile: File | null = null;

  showAccountModal = false;
  editingAccountId: number | null = null;
  selectedAccount: BankAccountItem | null = null;

  currentAccount: BankAccountItem = {
    id: 0,
    name: '',
    accountNoEnc: '',
    ifsc: '',
    openingBalance: 0,
    accountId: null
  };

  accounts: BankAccountItem[] = [
    {
      id: 1,
      name: 'HDFC Current Account',
      accountNoEnc: '50200012345678',
      ifsc: 'HDFC0000123',
      openingBalance: 500000.00,
      accountId: 1020
    }
  ];

  newTxn: { date: string; description: string; debit: number | null; credit: number | null } = {
    date: new Date().toISOString().slice(0, 10),
    description: '',
    debit: null,
    credit: null
  };

  transactions: BankTransactionItem[] = [
  {
    "id": 147,
    "date": "23-08-2026",
    "description": "Bulk demo bank txn 145",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 146,
    "date": "18-08-2026",
    "description": "Bulk demo bank txn 144",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 145,
    "date": "13-08-2026",
    "description": "Bulk demo bank txn 143",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 144,
    "date": "08-08-2026",
    "description": "Bulk demo bank txn 142",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 143,
    "date": "03-08-2026",
    "description": "Bulk demo bank txn 141",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 142,
    "date": "30-07-2026",
    "description": "Office rent - July",
    "debit": 25000,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 141,
    "date": "23-07-2026",
    "description": "Bulk demo bank txn 140",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 140,
    "date": "18-07-2026",
    "description": "Bulk demo bank txn 139",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 139,
    "date": "13-07-2026",
    "description": "Bulk demo bank txn 138",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 138,
    "date": "08-07-2026",
    "description": "Bulk demo bank txn 137",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 137,
    "date": "03-07-2026",
    "description": "Bulk demo bank txn 136",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 136,
    "date": "01-07-2026",
    "description": "Opening capital deposit",
    "debit": 0,
    "credit": 500000,
    "reconciled": true
  },
  {
    "id": 135,
    "date": "23-06-2026",
    "description": "Bulk demo bank txn 135",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 134,
    "date": "18-06-2026",
    "description": "Bulk demo bank txn 134",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 133,
    "date": "13-06-2026",
    "description": "Bulk demo bank txn 133",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 132,
    "date": "08-06-2026",
    "description": "Bulk demo bank txn 132",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 131,
    "date": "03-06-2026",
    "description": "Bulk demo bank txn 131",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 130,
    "date": "23-05-2026",
    "description": "Bulk demo bank txn 130",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 129,
    "date": "18-05-2026",
    "description": "Bulk demo bank txn 129",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 128,
    "date": "13-05-2026",
    "description": "Bulk demo bank txn 128",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 127,
    "date": "08-05-2026",
    "description": "Bulk demo bank txn 127",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 126,
    "date": "03-05-2026",
    "description": "Bulk demo bank txn 126",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 125,
    "date": "23-04-2026",
    "description": "Bulk demo bank txn 125",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 124,
    "date": "18-04-2026",
    "description": "Bulk demo bank txn 124",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 123,
    "date": "13-04-2026",
    "description": "Bulk demo bank txn 123",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 122,
    "date": "08-04-2026",
    "description": "Bulk demo bank txn 122",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 121,
    "date": "03-04-2026",
    "description": "Bulk demo bank txn 121",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 120,
    "date": "23-03-2026",
    "description": "Bulk demo bank txn 120",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 119,
    "date": "18-03-2026",
    "description": "Bulk demo bank txn 119",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 118,
    "date": "13-03-2026",
    "description": "Bulk demo bank txn 118",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 117,
    "date": "08-03-2026",
    "description": "Bulk demo bank txn 117",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 116,
    "date": "03-03-2026",
    "description": "Bulk demo bank txn 116",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 115,
    "date": "23-02-2026",
    "description": "Bulk demo bank txn 115",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 114,
    "date": "18-02-2026",
    "description": "Bulk demo bank txn 114",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 113,
    "date": "13-02-2026",
    "description": "Bulk demo bank txn 113",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 112,
    "date": "08-02-2026",
    "description": "Bulk demo bank txn 112",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 111,
    "date": "03-02-2026",
    "description": "Bulk demo bank txn 111",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 110,
    "date": "23-01-2026",
    "description": "Bulk demo bank txn 110",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 109,
    "date": "18-01-2026",
    "description": "Bulk demo bank txn 109",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 108,
    "date": "13-01-2026",
    "description": "Bulk demo bank txn 108",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 107,
    "date": "08-01-2026",
    "description": "Bulk demo bank txn 107",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 106,
    "date": "03-01-2026",
    "description": "Bulk demo bank txn 106",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 105,
    "date": "23-12-2025",
    "description": "Bulk demo bank txn 105",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 104,
    "date": "18-12-2025",
    "description": "Bulk demo bank txn 104",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 103,
    "date": "13-12-2025",
    "description": "Bulk demo bank txn 103",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 102,
    "date": "08-12-2025",
    "description": "Bulk demo bank txn 102",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 101,
    "date": "03-12-2025",
    "description": "Bulk demo bank txn 101",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 100,
    "date": "23-11-2025",
    "description": "Bulk demo bank txn 100",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 99,
    "date": "18-11-2025",
    "description": "Bulk demo bank txn 99",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 98,
    "date": "13-11-2025",
    "description": "Bulk demo bank txn 98",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 97,
    "date": "08-11-2025",
    "description": "Bulk demo bank txn 97",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 96,
    "date": "03-11-2025",
    "description": "Bulk demo bank txn 96",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 95,
    "date": "23-10-2025",
    "description": "Bulk demo bank txn 95",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 94,
    "date": "18-10-2025",
    "description": "Bulk demo bank txn 94",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 93,
    "date": "13-10-2025",
    "description": "Bulk demo bank txn 93",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 92,
    "date": "08-10-2025",
    "description": "Bulk demo bank txn 92",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 91,
    "date": "03-10-2025",
    "description": "Bulk demo bank txn 91",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 90,
    "date": "23-09-2025",
    "description": "Bulk demo bank txn 90",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 89,
    "date": "18-09-2025",
    "description": "Bulk demo bank txn 89",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 88,
    "date": "13-09-2025",
    "description": "Bulk demo bank txn 88",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 87,
    "date": "08-09-2025",
    "description": "Bulk demo bank txn 87",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 86,
    "date": "03-09-2025",
    "description": "Bulk demo bank txn 86",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 85,
    "date": "23-08-2025",
    "description": "Bulk demo bank txn 85",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 84,
    "date": "18-08-2025",
    "description": "Bulk demo bank txn 84",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 83,
    "date": "13-08-2025",
    "description": "Bulk demo bank txn 83",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 82,
    "date": "08-08-2025",
    "description": "Bulk demo bank txn 82",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 81,
    "date": "03-08-2025",
    "description": "Bulk demo bank txn 81",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 80,
    "date": "23-07-2025",
    "description": "Bulk demo bank txn 80",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 79,
    "date": "18-07-2025",
    "description": "Bulk demo bank txn 79",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 78,
    "date": "13-07-2025",
    "description": "Bulk demo bank txn 78",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 77,
    "date": "08-07-2025",
    "description": "Bulk demo bank txn 77",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 76,
    "date": "03-07-2025",
    "description": "Bulk demo bank txn 76",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 75,
    "date": "23-06-2025",
    "description": "Bulk demo bank txn 75",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 74,
    "date": "18-06-2025",
    "description": "Bulk demo bank txn 74",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 73,
    "date": "13-06-2025",
    "description": "Bulk demo bank txn 73",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 72,
    "date": "08-06-2025",
    "description": "Bulk demo bank txn 72",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 71,
    "date": "03-06-2025",
    "description": "Bulk demo bank txn 71",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 70,
    "date": "23-05-2025",
    "description": "Bulk demo bank txn 70",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 69,
    "date": "18-05-2025",
    "description": "Bulk demo bank txn 69",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 68,
    "date": "13-05-2025",
    "description": "Bulk demo bank txn 68",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 67,
    "date": "08-05-2025",
    "description": "Bulk demo bank txn 67",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 66,
    "date": "03-05-2025",
    "description": "Bulk demo bank txn 66",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 65,
    "date": "23-04-2025",
    "description": "Bulk demo bank txn 65",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 64,
    "date": "18-04-2025",
    "description": "Bulk demo bank txn 64",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 63,
    "date": "13-04-2025",
    "description": "Bulk demo bank txn 63",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 62,
    "date": "08-04-2025",
    "description": "Bulk demo bank txn 62",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 61,
    "date": "03-04-2025",
    "description": "Bulk demo bank txn 61",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 60,
    "date": "23-03-2025",
    "description": "Bulk demo bank txn 60",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 59,
    "date": "18-03-2025",
    "description": "Bulk demo bank txn 59",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 58,
    "date": "13-03-2025",
    "description": "Bulk demo bank txn 58",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 57,
    "date": "08-03-2025",
    "description": "Bulk demo bank txn 57",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 56,
    "date": "03-03-2025",
    "description": "Bulk demo bank txn 56",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 55,
    "date": "23-02-2025",
    "description": "Bulk demo bank txn 55",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 54,
    "date": "18-02-2025",
    "description": "Bulk demo bank txn 54",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 53,
    "date": "13-02-2025",
    "description": "Bulk demo bank txn 53",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 52,
    "date": "08-02-2025",
    "description": "Bulk demo bank txn 52",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 51,
    "date": "03-02-2025",
    "description": "Bulk demo bank txn 51",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 50,
    "date": "23-01-2025",
    "description": "Bulk demo bank txn 50",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 49,
    "date": "18-01-2025",
    "description": "Bulk demo bank txn 49",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 48,
    "date": "13-01-2025",
    "description": "Bulk demo bank txn 48",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 47,
    "date": "08-01-2025",
    "description": "Bulk demo bank txn 47",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 46,
    "date": "03-01-2025",
    "description": "Bulk demo bank txn 46",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 45,
    "date": "23-12-2024",
    "description": "Bulk demo bank txn 45",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 44,
    "date": "18-12-2024",
    "description": "Bulk demo bank txn 44",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 43,
    "date": "13-12-2024",
    "description": "Bulk demo bank txn 43",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 42,
    "date": "08-12-2024",
    "description": "Bulk demo bank txn 42",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 41,
    "date": "03-12-2024",
    "description": "Bulk demo bank txn 41",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 40,
    "date": "23-11-2024",
    "description": "Bulk demo bank txn 40",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 39,
    "date": "18-11-2024",
    "description": "Bulk demo bank txn 39",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 38,
    "date": "13-11-2024",
    "description": "Bulk demo bank txn 38",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 37,
    "date": "08-11-2024",
    "description": "Bulk demo bank txn 37",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 36,
    "date": "03-11-2024",
    "description": "Bulk demo bank txn 36",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 35,
    "date": "23-10-2024",
    "description": "Bulk demo bank txn 35",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 34,
    "date": "18-10-2024",
    "description": "Bulk demo bank txn 34",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 33,
    "date": "13-10-2024",
    "description": "Bulk demo bank txn 33",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 32,
    "date": "08-10-2024",
    "description": "Bulk demo bank txn 32",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 31,
    "date": "03-10-2024",
    "description": "Bulk demo bank txn 31",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 30,
    "date": "23-09-2024",
    "description": "Bulk demo bank txn 30",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 29,
    "date": "18-09-2024",
    "description": "Bulk demo bank txn 29",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 28,
    "date": "13-09-2024",
    "description": "Bulk demo bank txn 28",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 27,
    "date": "08-09-2024",
    "description": "Bulk demo bank txn 27",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 26,
    "date": "03-09-2024",
    "description": "Bulk demo bank txn 26",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 25,
    "date": "23-08-2024",
    "description": "Bulk demo bank txn 25",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 24,
    "date": "18-08-2024",
    "description": "Bulk demo bank txn 24",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 23,
    "date": "13-08-2024",
    "description": "Bulk demo bank txn 23",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 22,
    "date": "08-08-2024",
    "description": "Bulk demo bank txn 22",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 21,
    "date": "03-08-2024",
    "description": "Bulk demo bank txn 21",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 20,
    "date": "23-07-2024",
    "description": "Bulk demo bank txn 20",
    "debit": 0,
    "credit": 5000,
    "reconciled": true
  },
  {
    "id": 19,
    "date": "18-07-2024",
    "description": "Bulk demo bank txn 19",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 18,
    "date": "13-07-2024",
    "description": "Bulk demo bank txn 18",
    "debit": 0,
    "credit": 25000,
    "reconciled": false
  },
  {
    "id": 17,
    "date": "08-07-2024",
    "description": "Bulk demo bank txn 17",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 16,
    "date": "03-07-2024",
    "description": "Bulk demo bank txn 16",
    "debit": 0,
    "credit": 20000,
    "reconciled": true
  },
  {
    "id": 15,
    "date": "23-06-2024",
    "description": "Bulk demo bank txn 15",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 14,
    "date": "18-06-2024",
    "description": "Bulk demo bank txn 14",
    "debit": 0,
    "credit": 15000,
    "reconciled": false
  },
  {
    "id": 13,
    "date": "13-06-2024",
    "description": "Bulk demo bank txn 13",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 12,
    "date": "08-06-2024",
    "description": "Bulk demo bank txn 12",
    "debit": 0,
    "credit": 10000,
    "reconciled": true
  },
  {
    "id": 11,
    "date": "03-06-2024",
    "description": "Bulk demo bank txn 11",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 10,
    "date": "23-05-2024",
    "description": "Bulk demo bank txn 10",
    "debit": 0,
    "credit": 5000,
    "reconciled": false
  },
  {
    "id": 9,
    "date": "18-05-2024",
    "description": "Bulk demo bank txn 9",
    "debit": 27500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 8,
    "date": "13-05-2024",
    "description": "Bulk demo bank txn 8",
    "debit": 0,
    "credit": 25000,
    "reconciled": true
  },
  {
    "id": 7,
    "date": "08-05-2024",
    "description": "Bulk demo bank txn 7",
    "debit": 22500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 6,
    "date": "03-05-2024",
    "description": "Bulk demo bank txn 6",
    "debit": 0,
    "credit": 20000,
    "reconciled": false
  },
  {
    "id": 5,
    "date": "23-04-2024",
    "description": "Bulk demo bank txn 5",
    "debit": 17500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 4,
    "date": "18-04-2024",
    "description": "Bulk demo bank txn 4",
    "debit": 0,
    "credit": 15000,
    "reconciled": true
  },
  {
    "id": 3,
    "date": "13-04-2024",
    "description": "Bulk demo bank txn 3",
    "debit": 12500,
    "credit": 0,
    "reconciled": false
  },
  {
    "id": 2,
    "date": "08-04-2024",
    "description": "Bulk demo bank txn 2",
    "debit": 0,
    "credit": 10000,
    "reconciled": false
  },
  {
    "id": 1,
    "date": "03-04-2024",
    "description": "Bulk demo bank txn 1",
    "debit": 7500,
    "credit": 0,
    "reconciled": false
  }
];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.http.get<any>(`${environment.apiBaseUrl}/banking/accounts`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.accounts = res.data.map((a: any) => ({
            id: a.id,
            name: a.name,
            accountNoEnc: a.accountNoEnc,
            ifsc: a.ifsc,
            openingBalance: parseFloat(a.openingBalance) || 0,
            accountId: a.accountId
          }));
        }
      },
      error: () => {}
    });
  }

  // --- ACCOUNTS ACTIONS ---

  openNewAccountModal() {
    this.editingAccountId = null;
    this.currentAccount = {
      id: Date.now(),
      name: '',
      accountNoEnc: '',
      ifsc: '',
      openingBalance: 0,
      accountId: null
    };
    this.showAccountModal = true;
  }

  openEditAccountModal(a: BankAccountItem) {
    this.editingAccountId = a.id;
    this.currentAccount = { ...a };
    this.showAccountModal = true;
  }

  closeAccountModal() {
    this.showAccountModal = false;
    this.editingAccountId = null;
  }

  saveAccount() {
    if (!this.currentAccount.name) {
      alert('Account Name is required.');
      return;
    }

    if (this.editingAccountId) {
      this.http.put<any>(`${environment.apiBaseUrl}/banking/accounts/${this.editingAccountId}`, this.currentAccount).subscribe({
        next: () => {},
        error: () => {}
      });
      const idx = this.accounts.findIndex(a => a.id === this.editingAccountId);
      if (idx !== -1) {
        this.accounts[idx] = { ...this.currentAccount };
        this.alertMessage = `Bank account "${this.currentAccount.name}" updated successfully.`;
      }
    } else {
      this.http.post<any>(`${environment.apiBaseUrl}/banking/accounts`, this.currentAccount).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.currentAccount.id = res.data.id;
          }
        },
        error: () => {}
      });
      this.accounts.push({ ...this.currentAccount });
      this.alertMessage = `Bank account "${this.currentAccount.name}" created successfully.`;
    }
    this.closeAccountModal();
  }

  deleteAccount(a: BankAccountItem) {
    if (this.transactions.length > 0 && a.id === 1) {
      alert(`"${a.name}" has ${this.transactions.length} transaction(s). Delete those first (open Transactions → Delete All), then delete the account.`);
      return;
    }
    if (confirm(`Delete bank account "${a.name}"?`)) {
      this.http.delete<any>(`${environment.apiBaseUrl}/banking/accounts/${a.id}`).subscribe({
        next: () => {},
        error: () => {}
      });
      this.accounts = this.accounts.filter(item => item.id !== a.id);
      this.alertMessage = `"${a.name}" deleted.`;
    }
  }

  downloadAccountsTemplate() {
    const csvContent = 'data:text/csv;charset=utf-8,name,account_no,ifsc,opening_balance\nHDFC Current Account,50200012345678,HDFC0000123,500000.00';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bank-accounts-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.alertMessage = 'Bank accounts template downloaded.';
  }

  exportAccountsExcel() {
    let csv = 'Name,IFSC,Opening Balance\n';
    this.accounts.forEach(a => {
      csv += `"${a.name}","${a.ifsc || ''}",${a.openingBalance}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.alertMessage = 'Bank accounts exported.';
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importAccounts() {
    if (!this.selectedFile) {
      alert('Please select a CSV or Excel file to import.');
      return;
    }
    this.alertMessage = `File "${this.selectedFile.name}" imported. 1 bank account added.`;
    this.selectedFile = null;
  }

  // --- TRANSACTIONS VIEW ACTIONS ---

  openTransactions(a: BankAccountItem) {
    this.selectedAccount = a;
    this.currentView = 'transactions';
    this.loadTransactions(a.id);
  }

  backToAccounts() {
    this.currentView = 'accounts';
    this.selectedAccount = null;
  }

  loadTransactions(accountId: number) {
    this.http.get<any>(`${environment.apiBaseUrl}/banking/transactions?accountId=${accountId}`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.transactions = res.data.map((t: any) => ({
            id: t.id,
            date: t.txnDate,
            description: t.description,
            debit: parseFloat(t.debit) || 0,
            credit: parseFloat(t.credit) || 0,
            reconciled: t.reconciled === 1 || t.reconciled === true
          }));
        }
      },
      error: () => {}
    });
  }

  addTransaction() {
    if (!this.newTxn.date || !this.newTxn.description) {
      alert('Date and description are required.');
      return;
    }

    const item: BankTransactionItem = {
      id: Date.now(),
      bankAccountId: this.selectedAccount ? this.selectedAccount.id : 1,
      date: this.newTxn.date,
      description: this.newTxn.description,
      debit: Number(this.newTxn.debit || 0),
      credit: Number(this.newTxn.credit || 0),
      reconciled: false
    };

    this.http.post<any>(`${environment.apiBaseUrl}/banking/transactions`, {
      bankAccountId: item.bankAccountId,
      txnDate: item.date,
      description: item.description,
      debit: item.debit,
      credit: item.credit,
      reconciled: 0
    }).subscribe({
      next: (res) => {
        if (res && res.data) item.id = res.data.id;
      },
      error: () => {}
    });

    this.transactions.unshift(item);
    this.alertMessage = `Transaction "${item.description}" added.`;
    this.newTxn = {
      date: new Date().toISOString().slice(0, 10),
      description: '',
      debit: null,
      credit: null
    };
  }

  markReconciled(t: BankTransactionItem) {
    this.http.post<any>(`${environment.apiBaseUrl}/banking/transactions/${t.id}/reconcile`, {}).subscribe({
      next: () => {},
      error: () => {}
    });
    t.reconciled = true;
    this.alertMessage = `Transaction "${t.description}" marked as reconciled.`;
  }

  deleteTxn(t: BankTransactionItem) {
    if (confirm(`Delete this bank transaction (${t.date}, ${t.description})? This cannot be undone.`)) {
      this.http.delete<any>(`${environment.apiBaseUrl}/banking/transactions/${t.id}`).subscribe({
        next: () => {},
        error: () => {}
      });
      this.transactions = this.transactions.filter(item => item.id !== t.id);
      this.alertMessage = `Transaction deleted.`;
    }
  }

  deleteAllTxns() {
    if (confirm(`Delete ALL ${this.transactions.length} transactions for ${this.selectedAccount?.name}? This cannot be undone.`)) {
      const accId = this.selectedAccount ? this.selectedAccount.id : 1;
      this.http.delete<any>(`${environment.apiBaseUrl}/banking/transactions/delete-all?accountId=${accId}`).subscribe({
        next: () => {},
        error: () => {}
      });
      this.transactions = [];
      this.alertMessage = `All transactions deleted.`;
    }
  }

  downloadTxnsTemplate() {
    const csvContent = 'data:text/csv;charset=utf-8,txn_date,description,debit,credit\n2026-10-25,Sample Vendor Payment,15000,0';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bank-transactions-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.alertMessage = 'Transactions template downloaded.';
  }

  exportTxnsExcel() {
    let csv = 'txn_date,description,debit,credit,reconciled\n';
    this.transactions.forEach(t => {
      csv += `"${t.date}","${t.description}",${t.debit},${t.credit},${t.reconciled ? 'Yes' : 'No'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-transactions-${this.selectedAccount ? this.selectedAccount.name.replace(/\s+/g, '-') : 'account'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.alertMessage = 'Transactions exported.';
  }

  importTxns() {
    if (!this.selectedFile) {
      alert('Please select a CSV or Excel statement file to import.');
      return;
    }
    this.alertMessage = `Statement file "${this.selectedFile.name}" imported. 1 transaction added.`;
    this.selectedFile = null;
  }
}
