import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../../../service/parties/party.service';
import { Party } from '../../../../api/parties/party.model';
import { APP_CONFIG_MAPPING } from '../../../../../../environments/app.config.mapping';

@Component({
  selector: 'app-parties',
  template: `
    <!-- Page Header matching Express parties view -->
    <div class="page-header">
      <div>
        <h3 class="mb-0">Customers &amp; Vendors</h3>
        <div class="subtitle">Directory of commercial parties, GSTINs, state codes, and balances</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-sm btn-outline-secondary"><i class="bi bi-download me-1"></i>Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary"><i class="bi bi-upload me-1"></i>Import</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="openNewPartyDialog()">+ New Party</button>
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
               placeholder="Search legal name, trade name or GSTIN…"
               style="max-width: 340px;">
        <span class="text-muted small ms-auto">{{ filteredParties.length }} party/parties found</span>
      </div>

      <!-- Parties Table -->
      <p-table [value]="filteredParties"
               [loading]="loading"
               responsiveLayout="scroll"
               styleClass="p-datatable-sm"
               [paginator]="true"
               [rows]="15">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 25%">Legal / Business Name</th>
            <th style="width: 15%">Type</th>
            <th style="width: 20%">GSTIN / PAN</th>
            <th style="width: 15%">State</th>
            <th style="width: 15%" class="text-end">Balance</th>
            <th style="width: 10%" class="text-center">Status</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-party>
          <tr>
            <td>
              <div class="fw-semibold text-dark">{{ party.name }}</div>
              <div class="text-muted small" *ngIf="party.tradeName">{{ party.tradeName }}</div>
            </td>
            <td>
              <span class="badge"
                    [ngClass]="{'bg-brand-soft text-brand': party.partyType === 'CUSTOMER', 'bg-purple-subtle text-purple-emphasis': party.partyType === 'VENDOR', 'bg-orange-subtle text-orange-emphasis': party.partyType === 'BOTH'}">
                {{ party.partyType }}
              </span>
            </td>
            <td class="font-monospace small">
              <span *ngIf="party.gstin" class="fw-semibold text-brand">{{ party.gstin }}</span>
              <span *ngIf="!party.gstin" class="text-muted">Unregistered</span>
            </td>
            <td>
              <span class="small">{{ getStateName(party.stateCode) }} ({{ party.stateCode }})</span>
            </td>
            <td class="text-end font-monospace fw-semibold" [ngClass]="{'text-success': party.currentBalance >= 0, 'text-danger': party.currentBalance < 0}">
              {{ party.currentBalance | indianCurrency }}
            </td>
            <td class="text-center">
              <span class="badge badge-status-active" *ngIf="party.isActive !== false">Active</span>
              <span class="badge badge-status-rejected" *ngIf="party.isActive === false">Inactive</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4 text-muted">No parties registered yet. Click "+ New Party" to create one.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create Party Modal -->
    <p-dialog [(visible)]="partyDialog" [style]="{width: '550px'}" header="Create New Party" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="mb-3">
          <label class="form-label">Party Type *</label>
          <select [(ngModel)]="newParty.partyType" class="form-select form-select-sm">
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor (Supplier)</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Legal Business Name *</label>
          <input type="text" pInputText [(ngModel)]="newParty.name" placeholder="e.g. Tata Motors Ltd, Infosys BPM" class="w-full" />
        </div>
        <div class="mb-3">
          <label class="form-label">GSTIN (15 Digits)</label>
          <input type="text" pInputText [(ngModel)]="newParty.gstin" (input)="onGstinInput()" placeholder="e.g. 27AABCT1234F1Z8" class="w-full font-monospace text-uppercase" maxlength="15" />
        </div>
        <div class="mb-3">
          <label class="form-label">State Code (Place of Supply) *</label>
          <select [(ngModel)]="newParty.stateCode" class="form-select form-select-sm">
            <option *ngFor="let entry of stateCodeOptions" [value]="entry.code">{{ entry.code }} - {{ entry.name }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Opening Balance (₹)</label>
          <input type="number" pInputText [(ngModel)]="newParty.openingBalance" placeholder="0.00" class="w-full" />
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="partyDialog = false">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="saveParty()">Save Party</button>
      </ng-template>
    </p-dialog>
  `
})
export class PartiesComponent implements OnInit {
  parties: Party[] = [];
  filteredParties: Party[] = [];
  loading: boolean = false;
  partyDialog: boolean = false;
  searchQuery: string = '';

  stateCodeOptions = Object.entries(APP_CONFIG_MAPPING.stateCodes).map(([code, name]) => ({ code, name }));

  newParty: Party = {
    name: '',
    partyType: 'CUSTOMER',
    stateCode: '27',
    openingBalance: 0,
    currentBalance: 0
  };

  constructor(private partyService: PartyService) {}

  ngOnInit() {
    this.loadParties();
  }

  loadParties() {
    this.loading = true;
    this.partyService.getActiveParties().subscribe({
      next: (res) => {
        this.parties = res.data || [];
        this.filteredParties = [...this.parties];
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
      this.filteredParties = [...this.parties];
    } else {
      this.filteredParties = this.parties.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.tradeName && p.tradeName.toLowerCase().includes(q)) ||
        (p.gstin && p.gstin.toLowerCase().includes(q))
      );
    }
  }

  openNewPartyDialog() {
    this.newParty = {
      name: '',
      partyType: 'CUSTOMER',
      stateCode: '27',
      openingBalance: 0,
      currentBalance: 0
    };
    this.partyDialog = true;
  }

  onGstinInput() {
    if (this.newParty.gstin && this.newParty.gstin.length >= 2) {
      const statePrefix = this.newParty.gstin.substring(0, 2);
      if (APP_CONFIG_MAPPING.stateCodes[statePrefix as keyof typeof APP_CONFIG_MAPPING.stateCodes]) {
        this.newParty.stateCode = statePrefix;
      }
    }
  }

  saveParty() {
    if (!this.newParty.name) {
      alert('Business name is required');
      return;
    }

    this.partyService.createParty(this.newParty).subscribe({
      next: () => {
        this.partyDialog = false;
        this.loadParties();
      },
      error: (err) => {
        alert(err.message || 'Error saving party');
      }
    });
  }

  getStateName(code: string): string {
    return (APP_CONFIG_MAPPING.stateCodes as any)[code] || 'Other';
  }
}
