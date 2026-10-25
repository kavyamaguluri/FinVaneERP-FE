import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../api/common/api-response.model';
import { AccountGroup, AccountLedger } from '../../api/accounts/account-ledger.model';

export interface AccountDetail {
  id: number;
  code: string;
  name: string;
  openingBalance: number;
  type: string;
  ledgerGroup1: string;
  ledgerGroup2?: string;
  ledgerGroup3?: string;
  ledgerGroup4?: string;
  ledgerCode?: string;
  plType?: string;
  sectorReportLine?: string;
  gstApplicable?: string;
  tdsApplicable?: string;
  tcsApplicable?: string;
  gstTypeOfSupply?: string;
  gstNatureOfSupply?: string;
  tdsSectionNumber?: string;
  tcsSectionNumber?: string;
  hsnCode?: string;
  igstRate?: number;
  cgstRate?: number;
  sgstRate?: number;
  cessRate?: number;
  rcmApplicable?: string;
  itcEligible?: string;
  branchName?: string;
  entityGstin?: string;
  isActive: boolean;
  currentBalance: number;
}

export interface ChartOfAccountsData {
  accounts: AccountDetail[];
  inventoryEnabled: boolean;
  openingBalanceTotal: number;
  isBalanced: boolean;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private readonly baseUrl = `${environment.apiBaseUrl}/accounts`;
  private inventoryEnabledSubject = new BehaviorSubject<boolean>(true);
  public inventoryEnabled$ = this.inventoryEnabledSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchInventorySetting();
  }

  fetchInventorySetting() {
    this.http.get<ApiResponse<{ inventoryEnabled: boolean }>>(`${this.baseUrl}/settings/inventory`).subscribe({
      next: (res) => {
        if (res && res.data && typeof res.data.inventoryEnabled === 'boolean') {
          this.inventoryEnabledSubject.next(res.data.inventoryEnabled);
        }
      },
      error: () => {}
    });
  }

  getChartOfAccounts(q?: string): Observable<ApiResponse<ChartOfAccountsData>> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<ApiResponse<ChartOfAccountsData>>(this.baseUrl, { params }).pipe(
      tap(res => {
        if (res && res.data && typeof res.data.inventoryEnabled === 'boolean') {
          this.inventoryEnabledSubject.next(res.data.inventoryEnabled);
        }
      })
    );
  }

  updateOpeningBalance(id: number, openingBalance: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/${id}/opening-balance`, { opening_balance: openingBalance });
  }

  updateInventorySetting(enabled: boolean): Observable<ApiResponse<{ inventoryEnabled: boolean }>> {
    return this.http.post<ApiResponse<{ inventoryEnabled: boolean }>>(`${this.baseUrl}/settings/inventory`, { inventory_enabled: enabled }).pipe(
      tap(res => {
        this.inventoryEnabledSubject.next(enabled);
      })
    );
  }

  toggleAccount(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/${id}/toggle`, {});
  }

  deleteAccount(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/${id}/delete`, {});
  }

  getGroups(): Observable<ApiResponse<AccountGroup[]>> {
    return this.http.get<ApiResponse<AccountGroup[]>>(`${this.baseUrl}/groups`);
  }

  getLedgers(search?: string, groupId?: number, page: number = 0, size: number = 50): Observable<ApiResponse<PageResponse<AccountLedger>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (groupId) params = params.set('groupId', groupId.toString());

    return this.http.get<ApiResponse<PageResponse<AccountLedger>>>(this.baseUrl + '/ledgers', { params });
  }

  getAllActiveLedgers(): Observable<ApiResponse<AccountLedger[]>> {
    return this.http.get<ApiResponse<AccountLedger[]>>(`${this.baseUrl}/ledgers/all`);
  }

  getLedgerById(id: number): Observable<ApiResponse<AccountLedger>> {
    return this.http.get<ApiResponse<AccountLedger>>(`${this.baseUrl}/ledgers/${id}`);
  }

  createLedger(ledger: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/ledgers`, ledger);
  }
}
