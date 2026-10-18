import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { DashboardComponent } from './features/components/apps/dashboard/dashboard.component';
import { ChartOfAccountsComponent } from './features/components/apps/masters/chart-of-accounts/chart-of-accounts.component';
import { PartiesComponent } from './features/components/apps/masters/parties/parties.component';
import { VoucherEntryComponent } from './features/components/apps/vouchers/entry/voucher-entry.component';
import { TrialBalanceComponent } from './features/components/apps/statutory/trial-balance/trial-balance.component';
import { ModulePlaceholderComponent } from './features/components/apps/placeholder/module-placeholder.component';
import { LoginComponent } from './features/components/auth/login.component';
import { AuthGuard } from './features/service/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'masters/accounts', component: ChartOfAccountsComponent },
      { path: 'masters/parties', component: PartiesComponent },
      { path: 'masters/items', component: ModulePlaceholderComponent, data: { title: 'Items & Services', section: 'Masters', icon: 'pi pi-box', description: 'Manage inventory items, services, HSN/SAC codes, and tax rates' } },
      { path: 'masters/locations', component: ModulePlaceholderComponent, data: { title: 'Locations & Warehouses', section: 'Masters', icon: 'pi pi-map-marker', description: 'Manage branch locations, storage warehouses, and zones' } },
      
      { path: 'operations/sales-invoices', component: ModulePlaceholderComponent, data: { title: 'Sales Invoices', section: 'Operations (GST)', icon: 'pi pi-file-edit', description: 'Create and issue GST-compliant tax invoices, e-Invoices, and bills of supply' } },
      { path: 'operations/quotations', component: ModulePlaceholderComponent, data: { title: 'Sales Quotations', section: 'Operations (GST)', icon: 'pi pi-percentage', description: 'Create sales estimates and price quotations for customers' } },
      { path: 'operations/purchase-bills', component: ModulePlaceholderComponent, data: { title: 'Purchase Bills', section: 'Operations (GST)', icon: 'pi pi-shopping-bag', description: 'Record vendor purchase bills, ITC claims, and import duties' } },
      { path: 'operations/settlements', component: ModulePlaceholderComponent, data: { title: 'Settlements', section: 'Operations (GST)', icon: 'pi pi-check-circle', description: 'Manage customer receipts, vendor payments, and invoice reconciliation' } },

      { path: 'vouchers/entry', component: VoucherEntryComponent },
      { path: 'vouchers', component: VoucherEntryComponent },
      { path: 'statutory/general-ledger', component: TrialBalanceComponent },
      { path: 'statutory/trial-balance', component: TrialBalanceComponent },

      { path: 'statutory/financials', component: ModulePlaceholderComponent, data: { title: 'Financial Statements (Schedule III)', section: 'Statutory & Compliance', icon: 'pi pi-chart-bar', description: 'Balance sheet, profit & loss statement, and cash flow statements' } },
      { path: 'statutory/gst-returns', component: ModulePlaceholderComponent, data: { title: 'GSTR-1 & 3B Returns', section: 'Statutory & Compliance', icon: 'pi pi-id-card', description: 'Generate GSTR-1, GSTR-3B summaries, and export JSON for filing' } },
      { path: 'assets/register', component: ModulePlaceholderComponent, data: { title: 'Fixed Assets Register', section: 'Statutory & Compliance', icon: 'pi pi-database', description: 'Track asset acquisitions, depreciation schedules, and disposals' } },

      { path: '**', redirectTo: '' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
