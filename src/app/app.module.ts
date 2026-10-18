import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout Components
import { AppLayoutComponent } from './layout/app.layout.component';
import { AppTopbarComponent } from './layout/app.topbar.component';
import { AppSidebarComponent } from './layout/app.sidebar.component';
import { AppMenuComponent } from './layout/app.menu.component';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ChartModule } from 'primeng/chart';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';

// Feature Components
import { DashboardComponent } from './features/components/apps/dashboard/dashboard.component';
import { ChartOfAccountsComponent } from './features/components/apps/masters/chart-of-accounts/chart-of-accounts.component';
import { PartiesComponent } from './features/components/apps/masters/parties/parties.component';
import { VoucherEntryComponent } from './features/components/apps/vouchers/entry/voucher-entry.component';
import { TrialBalanceComponent } from './features/components/apps/statutory/trial-balance/trial-balance.component';
import { ModulePlaceholderComponent } from './features/components/apps/placeholder/module-placeholder.component';

// Pipes & Interceptors
import { IndianCurrencyPipe } from './shared/pipes/indian-currency.pipe';
import { HttpInterceptorService } from './features/service/http.interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    AppTopbarComponent,
    AppSidebarComponent,
    AppMenuComponent,
    DashboardComponent,
    ChartOfAccountsComponent,
    PartiesComponent,
    VoucherEntryComponent,
    TrialBalanceComponent,
    ModulePlaceholderComponent,
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
