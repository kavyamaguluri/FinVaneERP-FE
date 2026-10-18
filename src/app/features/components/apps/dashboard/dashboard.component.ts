import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="grid">
      <!-- Top KPI Metric Cards -->
      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Cash & Bank Balances</span>
              <div class="text-900 font-bold text-xl">{{ 300000 | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round w-2rem h-2rem">
              <i class="pi pi-wallet text-blue-600"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium text-xs"><i class="pi pi-check mr-1"></i>Healthy </span>
          <span class="text-500 text-xs">Reconciled up to date</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Total Receivables (Debtors)</span>
              <div class="text-900 font-bold text-xl">{{ 485200 | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-green-100 border-round w-2rem h-2rem">
              <i class="pi pi-arrow-down-left text-green-600"></i>
            </div>
          </div>
          <span class="text-500 text-xs">12 Active Invoices</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Total Payables (Creditors)</span>
              <div class="text-900 font-bold text-xl">{{ 142000 | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round w-2rem h-2rem">
              <i class="pi pi-arrow-up-right text-orange-600"></i>
            </div>
          </div>
          <span class="text-500 text-xs">Due in next 15 days</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Net Profit (FY 26-27)</span>
              <div class="text-900 font-bold text-xl text-green-600">{{ 184500 | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-100 border-round w-2rem h-2rem">
              <i class="pi pi-chart-line text-purple-600"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium text-xs">+14.2% </span>
          <span class="text-500 text-xs">vs last quarter</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-12">
        <div class="p-card p-3 flex flex-wrap gap-2 align-items-center justify-content-between">
          <div class="font-semibold text-700">Quick Operations</div>
          <div class="flex gap-2">
            <button pButton label="New Voucher" icon="pi pi-plus" class="p-button-outlined p-button-sm" routerLink="/vouchers/entry"></button>
            <button pButton label="New Sales Invoice" icon="pi pi-file-edit" class="p-button-sm" routerLink="/operations/sales-invoices"></button>
            <button pButton label="Trial Balance" icon="pi pi-sliders-h" class="p-button-secondary p-button-outlined p-button-sm" routerLink="/statutory/trial-balance"></button>
          </div>
        </div>
      </div>

      <!-- Financial Chart -->
      <div class="col-12 lg:col-8">
        <div class="p-card p-4">
          <div class="text-lg font-semibold text-900 mb-3">Monthly Cash Flow & Sales Inflow (FY 2026-27)</div>
          <p-chart type="line" [data]="chartData" [options]="chartOptions" height="300px"></p-chart>
        </div>
      </div>

      <!-- Recent Vouchers & Activity -->
      <div class="col-12 lg:col-4">
        <div class="p-card p-4 h-full">
          <div class="text-lg font-semibold text-900 mb-3">System Compliance Status</div>
          <div class="flex flex-column gap-3">
            <div class="p-3 border-round bg-blue-50 border-1 border-blue-200">
              <div class="font-semibold text-blue-900 text-sm">GSTR-1 Ready for Export</div>
              <div class="text-xs text-blue-700 mt-1">18 B2B tax invoices logged. Zero HSN mismatch errors.</div>
            </div>
            <div class="p-3 border-round bg-green-50 border-1 border-green-200">
              <div class="font-semibold text-green-900 text-sm">Books Start Date Locked</div>
              <div class="text-xs text-green-700 mt-1">Starting from 01/04/2026. Prior period modification protected.</div>
            </div>
            <div class="p-3 border-round bg-indigo-50 border-1 border-indigo-200">
              <div class="font-semibold text-indigo-900 text-sm">Schedule III Auto-Balance</div>
              <div class="text-xs text-indigo-700 mt-1">Total Assets equal Total Equity & Liabilities.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.chartData = {
      labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Sales Inflow (₹)',
          data: [250000, 310000, 420000, 390000, 480000, 520000, 610000],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Operating Expenses (₹)',
          data: [180000, 200000, 250000, 240000, 310000, 300000, 340000],
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: { labels: { color: '#475569' } }
      },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } }
      }
    };
  }
}
