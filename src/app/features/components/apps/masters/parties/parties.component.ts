import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../../../service/parties/party.service';
import { Party } from '../../../../api/parties/party.model';
import { APP_CONFIG_MAPPING } from '../../../../../../environments/app.config.mapping';

@Component({
  selector: 'app-parties',
  template: `
    <div class="p-card p-4">
      <div class="flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 class="text-xl font-bold text-900 m-0">Masters > Customers & Vendors</h2>
          <span class="text-sm text-500">Directory of commercial parties, GSTINs, and state codes</span>
        </div>
        <div class="flex gap-2">
          <button pButton label="Add Party" icon="pi pi-plus" class="p-button-sm" (click)="openNewPartyDialog()"></button>
        </div>
      </div>

      <!-- Parties PrimeNG Table -->
      <p-table [value]="parties"
               [loading]="loading"
               responsiveLayout="scroll"
               styleClass="p-datatable-sm p-datatable-striped"
               [paginator]="true"
               [rows]="15">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 25%">Legal / Business Name</th>
            <th style="width: 15%">Type</th>
            <th style="width: 20%">GSTIN / PAN</th>
            <th style="width: 15%">State</th>
            <th style="width: 15%" class="text-right">Balance</th>
            <th style="width: 10%" class="text-center">Status</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-party>
          <tr>
            <td>
              <div class="font-semibold text-900">{{ party.name }}</div>
              <div class="text-xs text-500" *ngIf="party.tradeName">{{ party.tradeName }}</div>
            </td>
            <td>
              <span class="text-xs px-2 py-1 border-round font-medium"
                    [ngClass]="{'bg-green-50 text-green-700': party.partyType === 'CUSTOMER', 'bg-purple-50 text-purple-700': party.partyType === 'VENDOR', 'bg-blue-50 text-blue-700': party.partyType === 'BOTH'}">
                {{ party.partyType }}
              </span>
            </td>
            <td class="font-mono text-xs">
              <span *ngIf="party.gstin" class="text-primary font-semibold">{{ party.gstin }}</span>
              <span *ngIf="!party.gstin" class="text-400">Unregistered</span>
            </td>
            <td>
              <span class="text-xs font-medium">{{ getStateName(party.stateCode) }} ({{ party.stateCode }})</span>
            </td>
            <td class="text-right font-mono font-semibold">
              <span [ngClass]="{'text-green-600': party.currentBalance >= 0, 'text-orange-600': party.currentBalance < 0}">
                {{ party.currentBalance | indianCurrency }}
              </span>
            </td>
            <td class="text-center">
              <span class="p-badge p-badge-success text-xs" *ngIf="party.isActive !== false">Active</span>
              <span class="p-badge p-badge-danger text-xs" *ngIf="party.isActive === false">Inactive</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4 text-500">No parties registered yet. Click "+ Add Party" to create one.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create Party Modal -->
    <p-dialog [(visible)]="partyDialog" [style]="{width: '550px'}" header="Create New Party" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="field mb-3">
          <label class="font-semibold text-sm">Party Type *</label>
          <select [(ngModel)]="newParty.partyType" class="w-full p-2 border-1 surface-border border-round text-sm">
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor (Supplier)</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div class="field mb-3">
          <label class="font-semibold text-sm">Legal Business Name *</label>
          <input type="text" pInputText [(ngModel)]="newParty.name" placeholder="e.g. Tata Motors Ltd, Infosys BPM" class="w-full" />
        </div>
        <div class="field mb-3">
          <label class="font-semibold text-sm">GSTIN (15 Digits)</label>
          <input type="text" pInputText [(ngModel)]="newParty.gstin" (input)="onGstinInput()" placeholder="e.g. 27AABCT1234F1Z8" class="w-full font-mono uppercase" maxlength="15" />
        </div>
        <div class="field mb-3">
          <label class="font-semibold text-sm">State Code (Place of Supply) *</label>
          <select [(ngModel)]="newParty.stateCode" class="w-full p-2 border-1 surface-border border-round text-sm">
            <option *ngFor="let entry of stateCodeOptions" [value]="entry.code">{{ entry.code }} - {{ entry.name }}</option>
          </select>
        </div>
        <div class="field mb-3">
          <label class="font-semibold text-sm">Opening Balance (â‚¹)</label>
          <input type="number" pInputText [(ngModel)]="newParty.openingBalance" placeholder="0.00" class="w-full" />
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text p-button-sm" (click)="partyDialog = false"></button>
        <button pButton label="Save Party" icon="pi pi-check" class="p-button-sm" (click)="saveParty()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class PartiesComponent implements OnInit {
  parties: Party[] = [];
  loading: boolean = false;
  partyDialog: boolean = false;

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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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

