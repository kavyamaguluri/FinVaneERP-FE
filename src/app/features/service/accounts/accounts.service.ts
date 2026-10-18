import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../api/common/api-response.model';
import { AccountGroup, AccountLedger } from '../../api/accounts/account-ledger.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private readonly baseUrl = `${environment.apiBaseUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getGroups(): Observable<ApiResponse<AccountGroup[]>> {
    return this.http.get<ApiResponse<AccountGroup[]>>(`${this.baseUrl}/groups`);
  }

  getLedgers(search?: string, groupId?: number, page: number = 0, size: number = 50): Observable<ApiResponse<PageResponse<AccountLedger>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (groupId) params = params.set('groupId', groupId.toString());

    return this.http.get<ApiResponse<PageResponse<AccountLedger>>>(`${this.baseUrl}/ledgers`, { params });
  }

  getAllActiveLedgers(): Observable<ApiResponse<AccountLedger[]>> {
    return this.http.get<ApiResponse<AccountLedger[]>>(`${this.baseUrl}/ledgers/all`);
  }

  getLedgerById(id: number): Observable<ApiResponse<AccountLedger>> {
    return this.http.get<ApiResponse<AccountLedger>>(`${this.baseUrl}/ledgers/${id}`);
  }

  createLedger(ledger: AccountLedger): Observable<ApiResponse<AccountLedger>> {
    return this.http.post<ApiResponse<AccountLedger>>(`${this.baseUrl}/ledgers`, ledger);
  }
}
