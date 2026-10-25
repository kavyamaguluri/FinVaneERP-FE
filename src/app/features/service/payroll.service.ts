import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Employee {
  id?: number;
  name: string;
  email?: string;
  designation?: string;
  gender?: string;
  pan?: string;
  bankAccount?: string;
  bankMasked?: string;
  ifsc?: string;
  monthlyCtc: number;
  dateOfJoining?: string;
  dateOfExit?: string;
  isActive?: number;
}

export interface PayrollRun {
  id?: number;
  periodMonth: number;
  periodYear: number;
  status: string;
  voucherId?: number;
  totalGross?: number;
  totalPf?: number;
  totalTds?: number;
  totalNet?: number;
  employeeCount?: number;
  payslips?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private baseUrl = `${environment.apiBaseUrl}/payroll`;

  constructor(private http: HttpClient) {}

  getEmployees(showExited: boolean = false): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/employees?showExited=${showExited}`);
  }

  getEmployeeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/employees/${id}`);
  }

  saveEmployee(employee: Employee): Observable<any> {
    if (employee.id) {
      return this.http.put<any>(`${this.baseUrl}/employees/${employee.id}`, employee);
    }
    return this.http.post<any>(`${this.baseUrl}/employees`, employee);
  }

  markEmployeeExited(id: number, exitDate?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employees/${id}/exit`, null, {
      params: exitDate ? { exitDate } : {}
    });
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/employees/${id}`);
  }

  getPayrollRuns(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/runs`);
  }

  getPayrollRunById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/runs/${id}`);
  }

  createPayrollRun(month: number, year: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/runs?month=${month}&year=${year}`, null);
  }

  postPayrollRun(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/runs/${id}/post`, null);
  }

  deletePayrollRun(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/runs/${id}`);
  }

  getPayrollReport(from?: string, to?: string): Observable<any> {
    let params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<any>(`${this.baseUrl}/report`, { params });
  }

  getEpfReport(month?: number, year?: number): Observable<any> {
    let params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.http.get<any>(`${this.baseUrl}/epf`, { params });
  }
}
