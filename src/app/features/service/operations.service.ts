import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Invoices
  getInvoices(type: string = 'sales'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/invoices?type=${type}`);
  }

  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/invoices/${id}`);
  }

  createInvoice(invoice: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/invoices`, invoice);
  }

  deleteInvoice(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/invoices/${id}`);
  }

  // Orders
  getOrders(type: string = 'sales'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders?type=${type}`);
  }

  getOrderById(id: number, type: string = 'sales'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/${id}?type=${type}`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders`, order);
  }

  // Quotations
  getQuotations(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quotations`);
  }

  getQuotationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quotations/${id}`);
  }

  createQuotation(quotation: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quotations`, quotation);
  }

  deleteQuotation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/quotations/${id}`);
  }

  // Inventory
  getItems(itemType?: string): Observable<any> {
    let url = `${this.baseUrl}/inventory/items`;
    if (itemType) url += `?itemType=${itemType}`;
    return this.http.get<any>(url);
  }

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inventory/items/${id}`);
  }

  saveItem(item: any): Observable<any> {
    if (item.id) {
      return this.http.put<any>(`${this.baseUrl}/inventory/items/${item.id}`, item);
    }
    return this.http.post<any>(`${this.baseUrl}/inventory/items`, item);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/inventory/items/${id}`);
  }

  getDirectStock(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inventory/direct-stock`);
  }

  saveDirectStock(entry: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/inventory/direct-stock`, entry);
  }

  // Production
  getBoms(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/production/boms`);
  }

  createBom(bom: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/production/boms`, bom);
  }

  getProductionOrders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/production/orders`);
  }

  createProductionOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/production/orders`, order);
  }

  completeProductionOrder(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/production/orders/${id}/complete`, null);
  }

  // Reports
  getTrialBalance(from?: string, to?: string): Observable<any> {
    let params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/reports/trial-balance`, { params });
  }

  getProfitLoss(from?: string, to?: string): Observable<any> {
    let params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/reports/profit-loss`, { params });
  }

  getBalanceSheet(to?: string): Observable<any> {
    let params: any = {};
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/reports/balance-sheet`, { params });
  }

  getCashFlow(from?: string, to?: string): Observable<any> {
    let params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/reports/cash-flow`, { params });
  }

  getFinancialsSchedule3(to?: string): Observable<any> {
    let params: any = {};
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/reports/financials`, { params });
  }

  // Compliance
  getGstr1(from?: string, to?: string): Observable<any> {
    let params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/compliance/gstr1`, { params });
  }

  getGstr2Reconcile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/compliance/gstr2-reconcile`);
  }

  getGstr3b(month?: number, year?: number): Observable<any> {
    let params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.http.get<any>(`${this.baseUrl}/compliance/gstr3b`, { params });
  }

  // Banking & Assets
  getBankAccounts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/banking/accounts`);
  }

  getBankTransactions(accountId?: number): Observable<any> {
    let url = `${this.baseUrl}/banking/transactions`;
    if (accountId) url += `?accountId=${accountId}`;
    return this.http.get<any>(url);
  }

  getFixedAssets(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/assets`);
  }

  saveFixedAsset(asset: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/assets`, asset);
  }

  getDepreciationRuns(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/assets/depreciation-runs`);
  }

  runDepreciation(month: number, year: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/assets/run-depreciation?month=${month}&year=${year}`, null);
  }
}
