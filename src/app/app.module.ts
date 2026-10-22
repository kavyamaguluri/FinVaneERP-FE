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
    AppComponent,
    AppLayoutComponent,
    AppTopbarComponent,
    DashboardComponent,
    ChartOfAccountsComponent,
    PartiesComponent,
    InventoryComponent,
    EmployeesComponent,
    InvoicesComponent,
    DayBookComponent,
    VoucherEntryComponent,
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
