import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from './features/service/auth.guard';

// Masters
import { ChartOfAccountsComponent } from './features/components/apps/masters/chart-of-accounts/chart-of-accounts.component';
import { PartiesComponent } from './features/components/apps/masters/parties/parties.component';
import { InventoryComponent } from './features/components/apps/masters/inventory/inventory.component';
import { EmployeesComponent } from './features/components/apps/payroll/employees.component';

// Operations
import { InvoicesComponent } from './features/components/apps/operations/invoices/invoices.component';
import { DayBookComponent } from './features/components/apps/vouchers/day-book/day-book.component';
import { VoucherEntryComponent } from './features/components/apps/vouchers/entry/voucher-entry.component';

// Reports
import { TrialBalanceComponent } from './features/components/apps/statutory/trial-balance/trial-balance.component';
import { BalanceSheetComponent } from './features/components/apps/reports/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './features/components/apps/reports/profit-loss/profit-loss.component';
import { CashFlowComponent } from './features/components/apps/reports/cash-flow/cash-flow.component';

// Corporate Finance, Admin, Entities, Dashboard & Auth
import { DashboardComponent } from './features/components/apps/dashboard/dashboard.component';
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
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Masters matching Express
      { path: 'accounts', component: ChartOfAccountsComponent },
      { path: 'accounts/coa-mapping', component: ModulePlaceholderComponent, data: { title: 'COA Mapping (Schedule III)', section: 'Masters', icon: 'bi bi-diagram-3', description: 'Schedule III balance sheet and P&L line item mapping' } },
      { path: 'accounts/sector-mapping', component: ModulePlaceholderComponent, data: { title: 'Sector Mapping', section: 'Masters', icon: 'bi bi-signpost-split', description: 'Map accounts to sector benchmark categories' } },
      { path: 'parties', component: PartiesComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'payroll/employees', component: EmployeesComponent },

      // Operations: Sales / Purchase matching Express
      { path: 'invoices', component: InvoicesComponent },
      { path: 'quotations', component: ModulePlaceholderComponent, data: { title: 'Sales Quotations', section: 'Operations', icon: 'bi bi-file-earmark-text', description: 'Manage sales quotations and estimates' } },
      { path: 'orders', component: ModulePlaceholderComponent, data: { title: 'Orders', section: 'Operations', icon: 'bi bi-cart-check', description: 'Manage Sales and Purchase Orders' } },
      { path: 'notes', component: ModulePlaceholderComponent, data: { title: 'Credit & Debit Notes', section: 'Operations', icon: 'bi bi-arrow-return-left', description: 'Record Credit Notes and Debit Notes for returns and adjustments' } },

      // Operations: Vouchers matching Express
      { path: 'vouchers', component: DayBookComponent },
      { path: 'vouchers/new', component: VoucherEntryComponent },

      // Operations: Inventory matching Express
      { path: 'transfers', component: ModulePlaceholderComponent, data: { title: 'Stock Transfers', section: 'Operations', icon: 'bi bi-arrow-left-right', description: 'Record inter-branch and inter-warehouse stock transfers' } },
      { path: 'locations', component: ModulePlaceholderComponent, data: { title: 'Locations', section: 'Operations', icon: 'bi bi-geo-alt', description: 'Manage branch locations, storage warehouses, and zones' } },
      { path: 'inventory/direct-stock', component: ModulePlaceholderComponent, data: { title: 'Direct Stock', section: 'Operations', icon: 'bi bi-box-seam', description: 'Direct stock entry and physical stock audit reconciliation' } },

      // Operations: Production matching Express
      { path: 'production', component: ModulePlaceholderComponent, data: { title: 'Production Orders', section: 'Operations', icon: 'bi bi-clipboard-check', description: 'Track manufacturing production orders and outputs' } },
      { path: 'production/boms', component: ModulePlaceholderComponent, data: { title: 'Bills of Material', section: 'Operations', icon: 'bi bi-diagram-3', description: 'Configure product recipes and raw material assembly ratios' } },
      { path: 'production/raw-materials', component: ModulePlaceholderComponent, data: { title: 'Raw Materials', section: 'Operations', icon: 'bi bi-basket', description: 'Raw material stock, usage allocation, and shortages' } },
      { path: 'production/profitability', component: ModulePlaceholderComponent, data: { title: 'Product Profitability', section: 'Operations', icon: 'bi bi-graph-up-arrow', description: 'Finished goods unit economics and gross profit analysis' } },

      // Operations: Payroll matching Express
      { path: 'payroll/runs', component: ModulePlaceholderComponent, data: { title: 'Payroll Runs', section: 'Operations', icon: 'bi bi-cash-coin', description: 'Process monthly payroll runs, salaries, and disbursements' } },
      { path: 'payroll/report', component: ModulePlaceholderComponent, data: { title: 'Payroll Report', section: 'Operations', icon: 'bi bi-file-earmark-text', description: 'View salary registers and deduction summaries' } },

      // Operations: Banking & Assets matching Express
      { path: 'banking', component: ModulePlaceholderComponent, data: { title: 'Banking', section: 'Operations', icon: 'bi bi-bank', description: 'Bank accounts, statements, and bank reconciliation' } },
      { path: 'assets/dashboard', component: ModulePlaceholderComponent, data: { title: 'Fixed Assets', section: 'Operations', icon: 'bi bi-building', description: 'Fixed asset register, acquisitions, depreciation, and disposals' } },

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
