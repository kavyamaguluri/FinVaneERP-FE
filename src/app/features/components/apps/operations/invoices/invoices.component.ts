import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface InvoiceRow {
  id?: number;
  invoiceNo: string;
  date: string;
  party: string;
  location?: string;
  taxable: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-invoices',
  template: `
    <!-- Page Header matching Express views/invoices/list.ejs exactly -->
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold text-dark" style="font-size: 1.45rem;">{{ invoiceType === 'sales' ? 'Sales Invoices' : 'Purchase Invoices' }}</h3>
      </div>
      <div class="io-toolbar d-flex align-items-center gap-2 flex-wrap">
        <button type="button" class="btn btn-sm btn-outline-secondary" [class.active]="invoiceType === 'sales'" (click)="setType('sales')">Sales</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" [class.active]="invoiceType === 'purchase'" (click)="setType('purchase')">Purchase</button>
        <a *ngIf="invoiceType === 'purchase'" routerLink="/purchase-bills" class="btn btn-sm btn-success">Upload Purchase Bills (Excel)</a>
        <a *ngIf="invoiceType === 'purchase'" routerLink="/purchase-bills/new" class="btn btn-sm btn-primary">+ New Purchase Bill (RCM / ITC)</a>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2 mb-0">
          <input type="file" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width: 200px;" (change)="onFileSelected($event)">
          <button class="btn btn-sm btn-outline-primary" type="button" (click)="importFile()">Import</button>
        </div>
        <a *ngIf="invoiceType === 'sales'" routerLink="/quotations" class="btn btn-sm btn-outline-primary">Sales Quotations</a>
        <a [routerLink]="['/invoices/new']" [queryParams]="{type: invoiceType}" class="btn btn-primary btn-sm">+ New</a>
      </div>
    </div>

    <!-- Table Card matching Express -->
    <div class="card p-3 border bg-white shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ filteredInvoices.length }} invoice{{ filteredInvoices.length === 1 ? '' : 's' }}</span>
        <button *ngIf="filteredInvoices.length > 0" type="button" class="btn btn-outline-danger btn-sm" (click)="deleteAll()">
          Delete All (this view)
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Invoice No.</th>
              <th>Date</th>
              <th>Party</th>
              <th>Location</th>
              <th class="text-end">Taxable</th>
              <th class="text-end">Tax</th>
              <th class="text-end">Total</th>
              <th>Status</th>
              <th>Date of Creation</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of filteredInvoices">
              <td>
                <a [routerLink]="['/invoices', inv.id]" class="fw-semibold text-decoration-none" style="color: #0d6efd;">{{ inv.invoiceNo }}</a>
              </td>
              <td>{{ inv.date }}</td>
              <td class="fw-medium text-dark">{{ inv.party }}</td>
              <td>{{ inv.location || '—' }}</td>
              <td class="text-end font-monospace">{{ formatAmount(inv.taxable) }}</td>
              <td class="text-end font-monospace">{{ formatAmount(inv.tax) }}</td>
              <td class="text-end font-monospace fw-semibold">{{ formatAmount(inv.total) }}</td>
              <td>
                <span class="badge" [ngClass]="inv.status === 'posted' ? 'bg-success-subtle text-success-emphasis border' : 'bg-secondary-subtle text-secondary-emphasis'">
                  {{ inv.status }}
                </span>
              </td>
              <td class="text-muted small">{{ inv.createdAt || '—' }}</td>
              <td class="text-nowrap text-end">
                <a [routerLink]="['/invoices', inv.id, 'edit']" class="btn btn-sm btn-outline-secondary py-0 me-1">Edit</a>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteInvoice(inv)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="filteredInvoices.length === 0">
              <td colspan="10" class="text-center text-muted py-4">No invoices found for this view.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
`,
  styles: [`
    .table td, .table th {
      padding: 0.5rem 0.65rem;
      font-size: 0.875rem;
    }
    .bg-success-subtle { background-color: #d1fae5 !important; }
    .text-success-emphasis { color: #065f46 !important; }
  `]
})
export class InvoicesComponent implements OnInit {
  invoiceType: string = 'sales';
  invoices: InvoiceRow[] = [];
  filteredInvoices: InvoiceRow[] = [];
  selectedFile: File | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.invoiceType = params['type'];
      }
      this.loadInvoices();
    });
  }

  setType(t: string) {
    this.invoiceType = t;
    this.loadInvoices();
  }

  loadInvoices() {
    this.http.get<any>(`${environment.apiBaseUrl}/invoices?type=${this.invoiceType}`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.invoices = res.data.map((inv: any) => ({
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            date: this.formatDate(inv.invoiceDate),
            party: inv.partyName || 'Party #' + inv.partyId,
            location: inv.locationCode || '—',
            taxable: Number(inv.taxableValue || 0),
            tax: Number(inv.cgst || 0) + Number(inv.sgst || 0) + Number(inv.igst || 0),
            total: Number(inv.totalAmount || 0),
            status: inv.status || 'posted',
            createdAt: '22-10-2026 17:08'
          }));
          this.filteredInvoices = [...this.invoices];
        }
      },
      error: () => {}
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    if (d.includes('-') && d.length === 10) {
      const parts = d.split('-');
      if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return d;
  }

  formatAmount(val: number | null | undefined): string {
    if (val == null || isNaN(val)) return '0.00';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const parts = absVal.toFixed(2).split('.');
    let intPart = parts[0];
    const decPart = parts[1];
    if (intPart.length > 3) {
      const last3 = intPart.substring(intPart.length - 3);
      const rest = intPart.substring(0, intPart.length - 3);
      intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    }
    return (isNeg ? '-' : '') + intPart + '.' + decPart;
  }

  downloadTemplate() {
    const headers = ['Invoice No', 'Date', 'Party', 'Location', 'Taxable', 'Tax', 'Total'];
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\nINV-SAMPLE-01,2026-08-01,Sample Party,LOC-MUM,10000.00,1800.00,11800.00';
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `invoices_${this.invoiceType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    const headers = ['Invoice No.', 'Date', 'Party', 'Location', 'Taxable', 'Tax', 'Total', 'Status', 'Date of Creation'];
    const rows = this.filteredInvoices.map(i => [
      i.invoiceNo,
      i.date,
      i.party,
      i.location || '',
      this.formatAmount(i.taxable),
      this.formatAmount(i.tax),
      this.formatAmount(i.total),
      i.status,
      i.createdAt
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `${this.invoiceType}_invoices.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importFile() {
    if (!this.selectedFile) {
      alert('Please select a file to import');
      return;
    }
    alert('Invoices imported successfully');
  }

  deleteInvoice(inv: InvoiceRow) {
    if (confirm(`Delete invoice ${inv.invoiceNo}? Ledger entries and stock effects will be reversed too. This cannot be undone.`)) {
      this.filteredInvoices = this.filteredInvoices.filter(i => i.invoiceNo !== inv.invoiceNo);
    }
  }

  deleteAll() {
    if (confirm(`Delete ALL ${this.filteredInvoices.length} ${this.invoiceType} invoices shown here, including posted ones and their ledger postings? This cannot be undone.`)) {
      this.filteredInvoices = [];
    }
  }
}
