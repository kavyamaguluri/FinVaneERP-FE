
import { PurchaseBillsComponent } from './features/components/apps/operations/invoices/purchase-bills.component';
import { PurchaseBillFormComponent } from './features/components/apps/operations/invoices/purchase-bill-form.component';
import { PurchaseBillRcmPaymentComponent } from './features/components/apps/operations/invoices/purchase-bill-rcm.component';
import { InvoiceFormComponent } from './features/components/apps/operations/invoices/invoice-form.component';
import { OrderFormComponent } from './features/components/apps/operations/orders/order-form.component';
import { NoteFormComponent } from './features/components/apps/operations/notes/note-form.component';

import { QuotationsComponent } from './features/components/apps/operations/quotations/quotations.component';
import { OrdersComponent } from './features/components/apps/operations/orders/orders.component';
import { DirectStockComponent } from './features/components/apps/masters/inventory/direct-stock.component';
import { ProductionComponent } from './features/components/apps/operations/production/production.component';
import { FinancialsSchedule3Component } from './features/components/apps/statutory/financials-schedule3.component';
import { Gstr1Component } from './features/components/apps/statutory/gstr1.component';
import { Gstr2ReconciliationComponent } from './features/components/apps/statutory/gstr2-reconciliation.component';
import { Gstr3bComponent } from './features/components/apps/statutory/gstr3b.component';
import { EpfReportComponent } from './features/components/apps/statutory/epf-report.component';

import { BudgetFormComponent } from './features/components/apps/budgets/budget-form.component';
import { EmployeeFormComponent } from './features/components/apps/payroll/employee-form.component';
import { PayrollRunFormComponent } from './features/components/apps/payroll/payroll-run-form.component';

import { BudgetListComponent } from './features/components/apps/budgets/budget-list.component';
import { BudgetPlanComponent } from './features/components/apps/budgets/budget-plan.component';
import { PayrollRunsComponent } from './features/components/apps/payroll/payroll-runs.component';
import { PayrollReportComponent } from './features/components/apps/payroll/payroll-report.component';
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
      { path: 'invoices/new', component: InvoiceFormComponent },
      { path: 'purchase-bills', component: PurchaseBillsComponent },
      { path: 'purchase-bills/new', component: PurchaseBillFormComponent },
      { path: 'purchase-bills/rcm-payment', component: PurchaseBillRcmPaymentComponent },
      { path: 'quotations', component: QuotationsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/new', component: OrderFormComponent },
      { path: 'notes', component: NotesComponent },
      { path: 'notes/new', component: NoteFormComponent },

      // Operations: Vouchers matching Express
      { path: 'vouchers', component: DayBookComponent },
      { path: 'vouchers/new', component: VoucherEntryComponent },

      // Operations: Inventory & Locations matching Express
      { path: 'transfers', component: StockTransfersComponent },
      { path: 'inventory/direct-stock', component: DirectStockComponent },

      // Operations: Banking & Assets matching Express
      { path: 'banking', component: BankingComponent },
      { path: 'assets', component: FixedAssetsComponent },
      { path: 'assets/dashboard', component: FixedAssetsComponent },

      // Operations: Production & Payroll
      { path: 'production', component: ProductionComponent },
      { path: 'payroll/runs', component: PayrollRunsComponent },
      { path: 'payroll/report', component: PayrollReportComponent },

      // Reports matching Express
      { path: 'reports/trial-balance', component: TrialBalanceComponent },
      { path: 'reports/balance-sheet', component: BalanceSheetComponent },
      { path: 'reports/profit-loss', component: ProfitLossComponent },
      { path: 'reports/cash-flow', component: CashFlowComponent },

      // Statutory matching Express
      { path: 'reports/financials', component: FinancialsSchedule3Component },
      { path: 'reports/gstr1', component: Gstr1Component },
      { path: 'compliance/gstr2-reconciliation', component: Gstr2ReconciliationComponent },
      { path: 'reports/gstr3b', component: Gstr3bComponent },
      { path: 'reports/epf', component: EpfReportComponent },

      // Budget matching Express
      { path: 'budgets/plan', component: BudgetPlanComponent },
      { path: 'budgets', component: BudgetListComponent },
      { path: 'budgets/new', component: BudgetFormComponent },
      { path: 'budgets/:id/edit', component: BudgetFormComponent },
      { path: 'payroll/employees/new', component: EmployeeFormComponent },
      { path: 'payroll/employees/:id/edit', component: EmployeeFormComponent },
      { path: 'payroll/runs/new', component: PayrollRunFormComponent },

      // Corporate Finance matching Express
      { path: 'financial-model', component: FinancialModelComponent },

      // Admin matching Express
      { path: 'admin/users', component: UserManagementComponent },
      { path: 'admin/audit-log', component: AuditLogComponent },

      // Business Entities ("Choose a Business") matching Express
      { path: 'entities', component: EntitiesComponent },
      { path: 'entities/new', component: EntitiesComponent },
      { path: 'entities/:id/edit', component: EntitiesComponent },

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
