import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../api/common/api-response.model';
import { Party } from '../../api/parties/party.model';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  private readonly baseUrl = `${environment.apiBaseUrl}/parties`;

  constructor(private http: HttpClient) {}

  getParties(partyType?: string, search?: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Party>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (partyType) params = params.set('partyType', partyType);
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<PageResponse<Party>>>(this.baseUrl, { params });
  }

  getActiveParties(partyType?: string): Observable<ApiResponse<Party[]>> {
    let params = new HttpParams();
    if (partyType) params = params.set('partyType', partyType);

    return this.http.get<ApiResponse<Party[]>>(`${this.baseUrl}/active`, { params });
  }

  createParty(party: Party): Observable<ApiResponse<Party>> {
    return this.http.post<ApiResponse<Party>>(this.baseUrl, party);
  }

  getPartyById(id: number): Observable<ApiResponse<Party>> {
    return this.http.get<ApiResponse<Party>>(`${this.baseUrl}/${id}`);
  }
}
