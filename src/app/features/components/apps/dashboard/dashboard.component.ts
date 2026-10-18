import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface DashboardMetrics {
  cashBankBalance: number;
  totalReceivables: number;
  totalPayables: number;
  netProfit: number;
  totalLedgers: number;
  totalParties: number;
  totalVouchers: number;
  chartMonths: string[];
  monthlySales: number[];
  monthlyExpenses: number[];
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="grid">
      <!-- Top Dynamic KPI Metric Cards -->
      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3 h-full">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Cash & Bank Balances</span>
              <div class="text-900 font-bold text-xl">{{ metrics.cashBankBalance | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round w-2rem h-2rem">
              <i class="pi pi-wallet text-blue-600"></i>
            </div>
          </div>
          <span class="text-500 text-xs" *ngIf="metrics.cashBankBalance === 0">No balance recorded</span>
          <span class="text-green-600 font-medium text-xs" *ngIf="metrics.cashBankBalance > 0"><i class="pi pi-check mr-1"></i>Liquid Assets</span>
          <span class="text-red-600 font-medium text-xs" *ngIf="metrics.cashBankBalance < 0"><i class="pi pi-exclamation-triangle mr-1"></i>Overdrawn</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3 h-full">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Total Receivables (Debtors)</span>
              <div class="text-900 font-bold text-xl">{{ metrics.totalReceivables | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-green-100 border-round w-2rem h-2rem">
              <i class="pi pi-arrow-down-left text-green-600"></i>
            </div>
          </div>
          <span class="text-500 text-xs">{{ metrics.totalParties }} Commercial Parties</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3 h-full">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Total Payables (Creditors)</span>
              <div class="text-900 font-bold text-xl">{{ metrics.totalPayables | indianCurrency }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round w-2rem h-2rem">
              <i class="pi pi-arrow-up-right text-orange-600"></i>
            </div>
          </div>
          <span class="text-500 text-xs">Outstanding liabilities</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="p-card p-3 h-full">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-1 text-sm">Net Profit / (Loss)</span>
              <div class="text-900 font-bold text-xl" [ngClass]="{'text-green-600': metrics.netProfit >= 0, 'text-red-600': metrics.netProfit < 0}">
                {{ metrics.netProfit | indianCurrency }}
              </div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-100 border-round w-2rem h-2rem">
              <i class="pi pi-chart-line text-purple-600"></i>
            </div>
          </div>
          <span class="text-500 text-xs">Based on posted vouchers</span>
        </div>
      </div>

      <!-- Quick Operations Bar -->
      <div class="col-12">
        <div class="p-card p-3 flex flex-wrap gap-2 align-items-center justify-content-between">
          <div class="font-semibold text-700">Quick Operations</div>
          <div class="flex flex-wrap gap-2">
            <button pButton label="New Voucher" icon="pi pi-plus" class="p-button-outlined p-button-sm" routerLink="/vouchers/entry"></button>
            <button pButton label="Chart of Accounts" icon="pi pi-sitemap" class="p-button-outlined p-button-sm" routerLink="/masters/accounts"></button>
            <button pButton label="Parties Directory" icon="pi pi-users" class="p-button-outlined p-button-sm" routerLink="/masters/parties"></button>
            <button pButton label="Trial Balance" icon="pi pi-sliders-h" class="p-button-secondary p-button-outlined p-button-sm" routerLink="/statutory/trial-balance"></button>
          </div>
        </div>
      </div>

      <!-- Live Dynamic Chart -->
      <div class="col-12 lg:col-8">
        <div class="p-card p-4">
          <div class="flex justify-content-between align-items-center mb-3">
            <div class="text-lg font-semibold text-900">Monthly Revenue & Expense Trend</div>
            <span class="text-xs text-500">Live Data</span>
          </div>
          <p-chart type="line" [data]="chartData" [options]="chartOptions" height="300px"></p-chart>
        </div>
      </div>

      <!-- Dynamic System Status -->
      <div class="col-12 lg:col-4">
        <div class="p-card p-4 h-full">
          <div class="text-lg font-semibold text-900 mb-3">Live System Database Status</div>
          <div class="flex flex-column gap-3">
            <div class="p-3 border-round bg-blue-50 border-1 border-blue-200">
              <div class="flex justify-content-between align-items-center">
                <span class="font-semibold text-blue-900 text-sm">General Ledger Accounts</span>
                <span class="p-badge p-badge-info text-xs">{{ metrics.totalLedgers }}</span>
              </div>
              <div class="text-xs text-blue-700 mt-1">Active ledger accounts configured in chart of accounts.</div>
            </div>

            <div class="p-3 border-round bg-green-50 border-1 border-green-200">
              <div class="flex justify-content-between align-items-center">
                <span class="font-semibold text-green-900 text-sm">Customers & Vendors</span>
                <span class="p-badge p-badge-success text-xs">{{ metrics.totalParties }}</span>
              </div>
              <div class="text-xs text-green-700 mt-1">Registered commercial parties with GSTINs.</div>
            </div>

            <div class="p-3 border-round bg-indigo-50 border-1 border-indigo-200">
              <div class="flex justify-content-between align-items-center">
                <span class="font-semibold text-indigo-900 text-sm">Journal & Payment Vouchers</span>
                <span class="p-badge text-xs" style="background-color: #6366f1; color: white;">{{ metrics.totalVouchers }}</span>
              </div>
              <div class="text-xs text-indigo-700 mt-1">Total posted transactions with double-entry balance.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics = {
    cashBankBalance: 0,
    totalReceivables: 0,
    totalPayables: 0,
    netProfit: 0,
    totalLedgers: 0,
    totalParties: 0,
    totalVouchers: 0,
    chartMonths: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    monthlySales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    monthlyExpenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  chartData: any;
  chartOptions: any;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initChart();
    this.loadMetrics();
  }

  loadMetrics() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/dashboard/metrics`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.metrics = res.data;
          this.updateChart(res.data);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  initChart() {
    this.chartData = {
      labels: this.metrics.chartMonths,
      datasets: [
        {
          label: 'Sales / Income (₹)',
          data: this.metrics.monthlySales,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Operating Expenses (₹)',
          data: this.metrics.monthlyExpenses,
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#475569' } }
      },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } }
      }
    };
  }

  updateChart(data: DashboardMetrics) {
    this.chartData = {
      labels: data.chartMonths || this.metrics.chartMonths,
      datasets: [
        {
          label: 'Sales / Income (₹)',
          data: data.monthlySales || this.metrics.monthlySales,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Operating Expenses (₹)',
          data: data.monthlyExpenses || this.metrics.monthlyExpenses,
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
  }
}
