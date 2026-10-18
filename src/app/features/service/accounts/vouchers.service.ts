import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../api/common/api-response.model';
import { VoucherRequest } from '../../api/accounts/voucher.model';

@Injectable({
  providedIn: 'root'
})
export class VouchersService {

  private readonly baseUrl = `${environment.apiBaseUrl}/vouchers`;

  constructor(private http: HttpClient) {}

  createVoucher(voucher: VoucherRequest): Observable<ApiResponse<VoucherRequest>> {
    return this.http.post<ApiResponse<VoucherRequest>>(this.baseUrl, voucher);
  }

  getVoucherById(id: number): Observable<ApiResponse<VoucherRequest>> {
    return this.http.get<ApiResponse<VoucherRequest>>(`${this.baseUrl}/${id}`);
  }

  searchVouchers(voucherType?: string, startDate?: string, endDate?: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<VoucherRequest>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (voucherType) params = params.set('voucherType', voucherType);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<PageResponse<VoucherRequest>>>(this.baseUrl, { params });
  }
}
