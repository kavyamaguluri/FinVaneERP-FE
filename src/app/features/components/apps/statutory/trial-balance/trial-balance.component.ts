import { Component, OnInit } from '@angular/core';
import { LedgerReportService } from '../../../../service/accounts/ledger.service';
import { TrialBalanceReport, TrialBalanceRow } from '../../../../api/accounts/trial-balance.model';

@Component({
  selector: 'app-trial-balance',
  template: `
    <div class="p-card p-4">
      <div class="flex flex-wrap justify-content-between align-items-center mb-4 no-print gap-2">
        <div>
          <h2 class="text-xl font-bold text-900 m-0">Statutory > Trial Balance</h2>
          <span class="text-sm text-500">Summary of all debit and credit balances across ledger accounts</span>
        </div>
        <div class="flex align-items-center gap-3">
          <input type="date" [(ngModel)]="asOfDate" (change)="loadReport()" class="p-2 border-1 surface-border border-round text-sm" />
          <button pButton label="Print / Save PDF" icon="pi pi-print" class="p-button-outlined p-button-sm" (click)="printReport()"></button>
        </div>
      </div>

      <!-- Printable Report Header -->
      <div class="text-center mb-4">
        <h3 class="text-2xl font-bold text-900 m-0">TRIAL BALANCE</h3>
        <p class="text-sm text-600 m-0 mt-1">As of: {{ asOfDate }} | Currency: INR (₹)</p>
      </div>

      <!-- Trial Balance Table -->
      <p-table [value]="report?.rows || []"
               [loading]="loading"
               styleClass="p-datatable-sm p-datatable-gridlines"
               responsiveLayout="scroll">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 15%">Account Code</th>
            <th style="width: 35%">Ledger Particulars</th>
            <th style="width: 20%">Account Group</th>
            <th style="width: 15%" class="text-right">Debit Balance (₹)</th>
            <th style="width: 15%" class="text-right">Credit Balance (₹)</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td class="font-mono text-xs">{{ row.ledgerCode }}</td>
            <td class="font-medium text-900">{{ row.ledgerName }}</td>
            <td class="text-xs text-600">{{ row.groupName }}</td>
            <td class="text-right font-mono font-semibold">
              <span *ngIf="row.closingDebit > 0">{{ row.closingDebit | indianCurrency }}</span>
              <span *ngIf="!row.closingDebit || row.closingDebit === 0" class="text-400">-</span>
            </td>
            <td class="text-right font-mono font-semibold">
              <span *ngIf="row.closingCredit > 0">{{ row.closingCredit | indianCurrency }}</span>
              <span *ngIf="!row.closingCredit || row.closingCredit === 0" class="text-400">-</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="footer">
          <tr class="bg-primary-50 font-bold">
            <td colspan="3" class="text-right uppercase">Grand Total:</td>
            <td class="text-right font-mono text-base text-primary">{{ report?.totalDebit || 0 | indianCurrency }}</td>
            <td class="text-right font-mono text-base text-primary">{{ report?.totalCredit || 0 | indianCurrency }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4 text-500">No transactions recorded for this period.</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Balance Status Indicator -->
      <div class="mt-4 p-3 border-round flex justify-content-between align-items-center no-print"
           [ngClass]="{'bg-green-50 border-1 border-green-200': report?.isBalanced, 'bg-red-50 border-1 border-red-200': !report?.isBalanced}">
        <div class="flex align-items-center gap-2">
          <i [class]="report?.isBalanced ? 'pi pi-check-circle text-green-600 text-xl' : 'pi pi-times-circle text-red-600 text-xl'"></i>
          <span class="font-semibold text-sm" [ngClass]="{'text-green-900': report?.isBalanced, 'text-red-900': !report?.isBalanced}">
            {{ report?.isBalanced ? 'The Trial Balance is strictly balanced (Total Debits = Total Credits).' : 'Warning: Imbalance detected in General Ledger postings.' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class TrialBalanceComponent implements OnInit {
  asOfDate: string = new Date().toISOString().substring(0, 10);
  report: TrialBalanceReport | null = null;
  loading: boolean = false;

  constructor(private ledgerService: LedgerReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.ledgerService.getTrialBalance(this.asOfDate).subscribe({
      next: (res) => {
        this.report = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  printReport() {
    window.print();
  }
}
