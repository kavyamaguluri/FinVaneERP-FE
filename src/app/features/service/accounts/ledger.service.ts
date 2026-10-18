import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../api/common/api-response.model';
import { TrialBalanceReport } from '../../api/accounts/trial-balance.model';

@Injectable({
  providedIn: 'root'
})
export class LedgerReportService {

  private readonly baseUrl = `${environment.apiBaseUrl}/ledger`;

  constructor(private http: HttpClient) {}

  getStatement(ledgerId: number, fromDate?: string, toDate?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/statement/${ledgerId}`, { params });
  }

  getTrialBalance(asOfDate?: string): Observable<ApiResponse<TrialBalanceReport>> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);

    return this.http.get<ApiResponse<TrialBalanceReport>>(`${this.baseUrl}/trial-balance`, { params });
  }
}
