
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout
import { AppLayoutComponent } from './layout/app.layout.component';
import { AppTopbarComponent } from './layout/app.topbar.component';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ChartModule } from 'primeng/chart';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';

// Masters
import { ChartOfAccountsComponent } from './features/components/apps/masters/chart-of-accounts/chart-of-accounts.component';
import { CoaMappingComponent } from './features/components/apps/masters/chart-of-accounts/coa-mapping.component';
import { SectorMappingComponent } from './features/components/apps/masters/chart-of-accounts/sector-mapping.component';
import { LocationsComponent } from './features/components/apps/masters/locations/locations.component';
import { PartiesComponent } from './features/components/apps/masters/parties/parties.component';
import { InventoryComponent } from './features/components/apps/masters/inventory/inventory.component';
import { EmployeesComponent } from './features/components/apps/payroll/employees.component';

// Operations
import { InvoicesComponent } from './features/components/apps/operations/invoices/invoices.component';
import { DayBookComponent } from './features/components/apps/vouchers/day-book/day-book.component';
import { VoucherEntryComponent } from './features/components/apps/vouchers/entry/voucher-entry.component';
import { BankingComponent } from './features/components/apps/operations/banking/banking.component';
import { FixedAssetsComponent } from './features/components/apps/operations/assets/fixed-assets.component';
import { NotesComponent } from './features/components/apps/operations/notes/notes.component';
import { StockTransfersComponent } from './features/components/apps/operations/transfers/stock-transfers.component';

// Reports
import { TrialBalanceComponent } from './features/components/apps/statutory/trial-balance/trial-balance.component';
import { BalanceSheetComponent } from './features/components/apps/reports/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './features/components/apps/reports/profit-loss/profit-loss.component';
import { CashFlowComponent } from './features/components/apps/reports/cash-flow/cash-flow.component';

// Corporate Finance, Admin, Entities & Dashboard
import { DashboardComponent } from './features/components/apps/dashboard/dashboard.component';
import { FinancialModelComponent } from './features/components/apps/financial-model/financial-model.component';
import { UserManagementComponent } from './features/components/apps/admin/user-management.component';
import { AuditLogComponent } from './features/components/apps/admin/audit-log.component';
import { EntitiesComponent } from './features/components/apps/entities/entities.component';
import { ModulePlaceholderComponent } from './features/components/apps/placeholder/module-placeholder.component';
import { LoginComponent } from './features/components/auth/login.component';

// Pipes & Interceptors
import { IndianCurrencyPipe } from './shared/pipes/indian-currency.pipe';
import { HttpInterceptorService } from './features/service/http.interceptor.service';

@NgModule({
  declarations: [
    PurchaseBillsComponent,
    PurchaseBillFormComponent,
    PurchaseBillRcmPaymentComponent,
    InvoiceFormComponent,
    OrderFormComponent,
    NoteFormComponent,
    QuotationsComponent,
    OrdersComponent,
    DirectStockComponent,
    ProductionComponent,
    FinancialsSchedule3Component,
    Gstr1Component,
    Gstr2ReconciliationComponent,
    Gstr3bComponent,
    EpfReportComponent,
    BudgetFormComponent,
    EmployeeFormComponent,
    PayrollRunFormComponent,
    BudgetListComponent,
    BudgetPlanComponent,
    PayrollRunsComponent,
    PayrollReportComponent,
    AppComponent,
    AppLayoutComponent,
    AppTopbarComponent,
    DashboardComponent,
    ChartOfAccountsComponent,
    CoaMappingComponent,
    SectorMappingComponent,
    LocationsComponent,
    PartiesComponent,
    InventoryComponent,
    EmployeesComponent,
    InvoicesComponent,
    DayBookComponent,
    VoucherEntryComponent,
    BankingComponent,
    FixedAssetsComponent,
    NotesComponent,
    StockTransfersComponent,
    TrialBalanceComponent,
    BalanceSheetComponent,
    ProfitLossComponent,
    CashFlowComponent,
    FinancialModelComponent,
    UserManagementComponent,
    AuditLogComponent,
    EntitiesComponent,
    ModulePlaceholderComponent,
    LoginComponent,
    IndianCurrencyPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DialogModule,
    ChartModule,
    AvatarModule,
    BadgeModule,
    ToastModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
