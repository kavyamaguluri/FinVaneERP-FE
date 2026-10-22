import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppLayoutComponent } from './layout/app.layout.component';
import { DashboardComponent } from './features/components/apps/dashboard/dashboard.component';
import { ChartOfAccountsComponent } from './features/components/apps/masters/chart-of-accounts/chart-of-accounts.component';
import { CoaMappingComponent } from './features/components/apps/masters/chart-of-accounts/coa-mapping.component';
import { SectorMappingComponent } from './features/components/apps/masters/chart-of-accounts/sector-mapping.component';
import { LocationsComponent } from './features/components/apps/masters/locations/locations.component';
import { PartiesComponent } from './features/components/apps/masters/parties/parties.component';
import { InventoryComponent } from './features/components/apps/masters/inventory/inventory.component';
import { EmployeesComponent } from './features/components/apps/payroll/employees.component';

import { InvoicesComponent } from './features/components/apps/operations/invoices/invoices.component';
import { DayBookComponent } from './features/components/apps/vouchers/day-book/day-book.component';
import { VoucherEntryComponent } from './features/components/apps/vouchers/entry/voucher-entry.component';
import { BankingComponent } from './features/components/apps/operations/banking/banking.component';
import { FixedAssetsComponent } from './features/components/apps/operations/assets/fixed-assets.component';
import { NotesComponent } from './features/components/apps/operations/notes/notes.component';
import { StockTransfersComponent } from './features/components/apps/operations/transfers/stock-transfers.component';

import { TrialBalanceComponent } from './features/components/apps/statutory/trial-balance/trial-balance.component';
import { BalanceSheetComponent } from './features/components/apps/reports/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './features/components/apps/reports/profit-loss/profit-loss.component';
import { CashFlowComponent } from './features/components/apps/reports/cash-flow/cash-flow.component';

import { FinancialModelComponent } from './features/components/apps/financial-model/financial-model.component';
import { UserManagementComponent } from './features/components/apps/admin/user-management.component';
import { AuditLogComponent } from './features/components/apps/admin/audit-log.component';
import { EntitiesComponent } from './features/components/apps/entities/entities.component';
import { ModulePlaceholderComponent } from './features/components/apps/placeholder/module-placeholder.component';
import { LoginComponent } from './features/components/auth/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Masters matching Express
      { path: 'accounts', component: ChartOfAccountsComponent },
      { path: 'accounts/coa-mapping', component: CoaMappingComponent },
      { path: 'accounts/sector-mapping', component: SectorMappingComponent },
      { path: 'locations', component: LocationsComponent },
      { path: 'parties', component: PartiesComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'payroll/employees', component: EmployeesComponent },

      // Operations: Sales / Purchase matching Express
      { path: 'invoices', component: InvoicesComponent },
      { path: 'quotations', component: ModulePlaceholderComponent, data: { title: 'Sales Quotations', section: 'Operations', icon: 'bi bi-file-earmark-text', description: 'Manage sales quotations and estimates' } },
      { path: 'orders', component: ModulePlaceholderComponent, data: { title: 'Orders', section: 'Operations', icon: 'bi bi-cart-check', description: 'Manage Sales and Purchase Orders' } },
      { path: 'notes', component: NotesComponent },

      // Operations: Vouchers matching Express
      { path: 'vouchers', component: DayBookComponent },
      { path: 'vouchers/new', component: VoucherEntryComponent },

      // Operations: Inventory & Locations matching Express
      { path: 'transfers', component: StockTransfersComponent },
      { path: 'inventory/direct-stock', component: ModulePlaceholderComponent, data: { title: 'Direct Stock', section: 'Operations', icon: 'bi bi-box-seam', description: 'Direct stock entry and physical stock audit reconciliation' } },

      // Operations: Banking & Assets matching Express
      { path: 'banking', component: BankingComponent },
      { path: 'assets/dashboard', component: FixedAssetsComponent },

      // Operations: Production & Payroll
      { path: 'production', component: ModulePlaceholderComponent, data: { title: 'Production Orders', section: 'Operations', icon: 'bi bi-clipboard-check', description: 'Track manufacturing production orders and outputs' } },
      { path: 'payroll/runs', component: ModulePlaceholderComponent, data: { title: 'Payroll Runs', section: 'Operations', icon: 'bi bi-cash-coin', description: 'Process monthly payroll runs, salaries, and disbursements' } },
      { path: 'payroll/report', component: ModulePlaceholderComponent, data: { title: 'Payroll Report', section: 'Operations', icon: 'bi bi-file-earmark-text', description: 'View salary registers and deduction summaries' } },

      // Reports matching Express
      { path: 'reports/trial-balance', component: TrialBalanceComponent },
      { path: 'reports/balance-sheet', component: BalanceSheetComponent },
      { path: 'reports/profit-loss', component: ProfitLossComponent },
      { path: 'reports/cash-flow', component: CashFlowComponent },

      // Statutory matching Express
      { path: 'reports/financials', component: ModulePlaceholderComponent, data: { title: 'Financials (Schedule III)', section: 'Statutory', icon: 'bi bi-table', description: 'Full Schedule III balance sheet, P&L, notes, and cash flow' } },
      { path: 'reports/gstr1', component: ModulePlaceholderComponent, data: { title: 'GSTR-1', section: 'Statutory', icon: 'bi bi-file-earmark-text', description: 'Outward supplies, B2B, B2CL, B2CS, and export summaries' } },
      { path: 'compliance/gstr2-reconciliation', component: ModulePlaceholderComponent, data: { title: 'GSTR-2A/2B Reconciliation', section: 'Statutory', icon: 'bi bi-arrow-repeat', description: 'Reconcile purchase invoices with GST portal 2B data' } },
      { path: 'reports/gstr3b', component: ModulePlaceholderComponent, data: { title: 'GSTR-3B', section: 'Statutory', icon: 'bi bi-file-earmark-check', description: 'Monthly summary return of outward supplies and input tax credit' } },
      { path: 'reports/epf', component: ModulePlaceholderComponent, data: { title: 'EPF / PF Report', section: 'Statutory', icon: 'bi bi-shield-check', description: 'Employee Provident Fund contribution report and ECR data' } },

      // Budget matching Express
      { path: 'budgets/plan', component: ModulePlaceholderComponent, data: { title: 'Plan Budget', section: 'Budget', icon: 'bi bi-pencil-square', description: 'Prepare annual and monthly expense and revenue budgets' } },
      { path: 'budgets', component: ModulePlaceholderComponent, data: { title: 'Budget vs Actual', section: 'Budget', icon: 'bi bi-bar-chart-steps', description: 'Analyze variances between budgeted targets and posted actuals' } },

      // Corporate Finance matching Express
      { path: 'financial-model', component: FinancialModelComponent },

      // Admin matching Express
      { path: 'admin/users', component: UserManagementComponent },
      { path: 'admin/audit-log', component: AuditLogComponent },

      // Business Entities ("Choose a Business") matching Express
      { path: 'entities', component: EntitiesComponent },

      // Legacy redirects
      { path: 'masters/accounts', redirectTo: 'accounts', pathMatch: 'full' },
      { path: 'masters/parties', redirectTo: 'parties', pathMatch: 'full' },
      { path: 'masters/items', redirectTo: 'inventory', pathMatch: 'full' },
      { path: 'masters/locations', redirectTo: 'locations', pathMatch: 'full' },
      { path: 'operations/sales-invoices', redirectTo: 'invoices', pathMatch: 'full' },
      { path: 'operations/quotations', redirectTo: 'quotations', pathMatch: 'full' },
      { path: 'operations/purchase-bills', redirectTo: 'invoices', pathMatch: 'full' },
      { path: 'operations/settlements', redirectTo: 'vouchers', pathMatch: 'full' },
      { path: 'vouchers/entry', redirectTo: 'vouchers/new', pathMatch: 'full' },
      { path: 'statutory/general-ledger', redirectTo: 'vouchers', pathMatch: 'full' },
      { path: 'statutory/trial-balance', redirectTo: 'reports/trial-balance', pathMatch: 'full' },
      { path: 'statutory/financials', redirectTo: 'reports/financials', pathMatch: 'full' },
      { path: 'statutory/gst-returns', redirectTo: 'reports/gstr1', pathMatch: 'full' },
      { path: 'assets/register', redirectTo: 'assets/dashboard', pathMatch: 'full' },

      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
