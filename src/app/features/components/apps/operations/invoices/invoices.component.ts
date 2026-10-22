import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface InvoiceRow {
  invoiceNo: string;
  date: string;
  party: string;
  location: string;
  taxable: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-invoices',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">{{ invoiceType === 'sales' ? 'Sales Invoices' : 'Purchase Invoices' }}</h3>
        <div class="subtitle text-muted small">Manage and view GST-compliant commercial invoices</div>
      </div>
      <div class="io-toolbar d-flex gap-2 align-items-center">
        <button type="button" class="btn btn-sm btn-outline-secondary" [class.active]="invoiceType === 'sales'" (click)="setType('sales')">Sales</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" [class.active]="invoiceType === 'purchase'" (click)="setType('purchase')">Purchase</button>
        <button *ngIf="invoiceType === 'purchase'" type="button" class="btn btn-sm btn-success">Upload Purchase Bills (Excel)</button>
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-primary btn-sm">+ New</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex gap-2 align-items-center">
          <input type="search" [(ngModel)]="searchQuery" (input)="onSearch()" class="form-control form-control-sm" placeholder="Search invoice, party…" style="max-width: 280px;">
          <span class="small text-muted fw-medium">{{ filteredList.length }} invoice(s)</span>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm">Delete All (this view)</button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Party</th>
              <th>Location</th>
              <th class="text-end">Taxable</th>
              <th class="text-end">Tax</th>
              <th class="text-end">Total</th>
              <th>Status</th>
              <th>Created</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of pagedList">
              <td><strong class="text-primary">{{ inv.invoiceNo }}</strong></td>
              <td>{{ inv.date }}</td>
              <td class="fw-medium text-dark">{{ inv.party }}</td>
              <td>{{ inv.location }}</td>
              <td class="text-end">₹{{ inv.taxable | number:'1.2-2' }}</td>
              <td class="text-end">₹{{ inv.tax | number:'1.2-2' }}</td>
              <td class="text-end fw-bold">₹{{ inv.total | number:'1.2-2' }}</td>
              <td><span class="badge" [ngClass]="inv.status === 'Posted' ? 'text-bg-success' : 'text-bg-secondary'">{{ inv.status }}</span></td>
              <td class="small text-muted">{{ inv.createdAt }}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">View</button>
                <button type="button" class="btn btn-sm btn-outline-danger">Del</button>
              </td>
            </tr>
            <tr *ngIf="filteredList.length === 0">
              <td colspan="10" class="text-center text-muted py-4">No invoices match your filter.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top" *ngIf="filteredList.length > pageSize">
        <span class="small text-muted">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredList.length) }} of {{ filteredList.length }} entries
        </span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">&laquo; Prev</button>
          <span class="btn btn-sm btn-light disabled">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">Next &raquo;</button>
        </div>
      </div>
    </div>
  `
})
export class InvoicesComponent implements OnInit {
  invoiceType: 'sales' | 'purchase' = 'sales';
  searchQuery = '';
  currentPage = 1;
  pageSize = 25;
  Math = Math;

  salesList: InvoiceRow[] = [
  {
    "invoiceNo": "SI-BULK-0145",
    "date": "2026-08-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 355200,
    "tax": 63936,
    "total": 419136,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0144",
    "date": "2026-08-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 90000,
    "tax": 16200,
    "total": 106200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0143",
    "date": "2026-08-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 88750,
    "tax": 10650,
    "total": 99400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0142",
    "date": "2026-08-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 331200,
    "tax": 59616,
    "total": 390816,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0141",
    "date": "2026-08-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 782000,
    "tax": 140760,
    "total": 922760,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-00003",
    "date": "2026-08-02",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 22000,
    "tax": 3960,
    "total": 25960,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "SI-00002",
    "date": "2026-07-28",
    "party": "Delta Textiles LLP",
    "location": "Mumbai Central Warehouse",
    "taxable": 25000,
    "tax": 3000,
    "total": 28000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "SI-BULK-0140",
    "date": "2026-07-23",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 135000,
    "tax": 24300,
    "total": 159300,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0139",
    "date": "2026-07-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 307200,
    "tax": 55296,
    "total": 362496,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-00001",
    "date": "2026-07-15",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 58500,
    "tax": 10530,
    "total": 69030,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "SI-BULK-0138",
    "date": "2026-07-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 724500,
    "tax": 130410,
    "total": 854910,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0137",
    "date": "2026-07-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 76250,
    "tax": 9150,
    "total": 85400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0136",
    "date": "2026-07-03",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 180000,
    "tax": 32400,
    "total": 212400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0135",
    "date": "2026-06-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 667000,
    "tax": 120060,
    "total": 787060,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0134",
    "date": "2026-06-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 70000,
    "tax": 8400,
    "total": 78400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0133",
    "date": "2026-06-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 264000,
    "tax": 47520,
    "total": 311520,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0132",
    "date": "2026-06-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 90000,
    "tax": 16200,
    "total": 106200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0131",
    "date": "2026-06-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 65000,
    "tax": 7800,
    "total": 72800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "SI-BULK-0130",
    "date": "2026-05-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 240000,
    "tax": 43200,
    "total": 283200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0129",
    "date": "2026-05-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 563500,
    "tax": 101430,
    "total": 664930,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0128",
    "date": "2026-05-13",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 135000,
    "tax": 24300,
    "total": 159300,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0127",
    "date": "2026-05-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 220800,
    "tax": 39744,
    "total": 260544,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0126",
    "date": "2026-05-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 506000,
    "tax": 91080,
    "total": 597080,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0125",
    "date": "2026-04-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 53750,
    "tax": 6450,
    "total": 60200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0124",
    "date": "2026-04-18",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 165000,
    "tax": 29700,
    "total": 194700,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0123",
    "date": "2026-04-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 448500,
    "tax": 80730,
    "total": 529230,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0122",
    "date": "2026-04-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 47500,
    "tax": 5700,
    "total": 53200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0121",
    "date": "2026-04-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 172800,
    "tax": 31104,
    "total": 203904,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0120",
    "date": "2026-03-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 90000,
    "tax": 16200,
    "total": 106200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0119",
    "date": "2026-03-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 111250,
    "tax": 13350,
    "total": 124600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0118",
    "date": "2026-03-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 422400,
    "tax": 76032,
    "total": 498432,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0117",
    "date": "2026-03-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 989000,
    "tax": 178020,
    "total": 1167020,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0116",
    "date": "2026-03-03",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 120000,
    "tax": 21600,
    "total": 141600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0115",
    "date": "2026-02-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 398400,
    "tax": 71712,
    "total": 470112,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0114",
    "date": "2026-02-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 931500,
    "tax": 167670,
    "total": 1099170,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0113",
    "date": "2026-02-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 100000,
    "tax": 12000,
    "total": 112000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0112",
    "date": "2026-02-08",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 165000,
    "tax": 29700,
    "total": 194700,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0111",
    "date": "2026-02-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 885500,
    "tax": 159390,
    "total": 1044890,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0110",
    "date": "2026-01-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 93750,
    "tax": 11250,
    "total": 105000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "SI-BULK-0109",
    "date": "2026-01-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 355200,
    "tax": 63936,
    "total": 419136,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0108",
    "date": "2026-01-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 75000,
    "tax": 13500,
    "total": 88500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0107",
    "date": "2026-01-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 88750,
    "tax": 10650,
    "total": 99400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0106",
    "date": "2026-01-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 331200,
    "tax": 59616,
    "total": 390816,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0105",
    "date": "2025-12-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 782000,
    "tax": 140760,
    "total": 922760,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0104",
    "date": "2025-12-18",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 120000,
    "tax": 21600,
    "total": 141600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0103",
    "date": "2025-12-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 307200,
    "tax": 55296,
    "total": 362496,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0102",
    "date": "2025-12-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 724500,
    "tax": 130410,
    "total": 854910,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0101",
    "date": "2025-12-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 76250,
    "tax": 9150,
    "total": 85400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0100",
    "date": "2025-11-23",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 165000,
    "tax": 29700,
    "total": 194700,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0099",
    "date": "2025-11-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 678500,
    "tax": 122130,
    "total": 800630,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0098",
    "date": "2025-11-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 71250,
    "tax": 8550,
    "total": 79800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0097",
    "date": "2025-11-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 268800,
    "tax": 48384,
    "total": 317184,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0096",
    "date": "2025-11-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 75000,
    "tax": 13500,
    "total": 88500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0095",
    "date": "2025-10-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 66250,
    "tax": 7950,
    "total": 74200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0094",
    "date": "2025-10-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 244800,
    "tax": 44064,
    "total": 288864,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0093",
    "date": "2025-10-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 575000,
    "tax": 103500,
    "total": 678500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0092",
    "date": "2025-10-08",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 120000,
    "tax": 21600,
    "total": 141600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0091",
    "date": "2025-10-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 225600,
    "tax": 40608,
    "total": 266208,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0090",
    "date": "2025-09-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 529000,
    "tax": 95220,
    "total": 624220,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0089",
    "date": "2025-09-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 55000,
    "tax": 6600,
    "total": 61600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0088",
    "date": "2025-09-13",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 150000,
    "tax": 27000,
    "total": 177000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0087",
    "date": "2025-09-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 471500,
    "tax": 84870,
    "total": 556370,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0086",
    "date": "2025-09-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 50000,
    "tax": 6000,
    "total": 56000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "SI-BULK-0085",
    "date": "2025-08-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 187200,
    "tax": 33696,
    "total": 220896,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0084",
    "date": "2025-08-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 75000,
    "tax": 13500,
    "total": 88500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0083",
    "date": "2025-08-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 45000,
    "tax": 5400,
    "total": 50400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0082",
    "date": "2025-08-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 163200,
    "tax": 29376,
    "total": 192576,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0081",
    "date": "2025-08-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 379500,
    "tax": 68310,
    "total": 447810,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0080",
    "date": "2025-07-23",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 120000,
    "tax": 21600,
    "total": 141600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0079",
    "date": "2025-07-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 388800,
    "tax": 69984,
    "total": 458784,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0078",
    "date": "2025-07-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 908500,
    "tax": 163530,
    "total": 1072030,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0077",
    "date": "2025-07-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 97500,
    "tax": 11700,
    "total": 109200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0076",
    "date": "2025-07-03",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 150000,
    "tax": 27000,
    "total": 177000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0075",
    "date": "2025-06-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 862500,
    "tax": 155250,
    "total": 1017750,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0074",
    "date": "2025-06-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 92500,
    "tax": 11100,
    "total": 103600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0073",
    "date": "2025-06-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 345600,
    "tax": 62208,
    "total": 407808,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0072",
    "date": "2025-06-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 75000,
    "tax": 13500,
    "total": 88500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0071",
    "date": "2025-06-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 86250,
    "tax": 10350,
    "total": 96600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0070",
    "date": "2025-05-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 326400,
    "tax": 58752,
    "total": 385152,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0069",
    "date": "2025-05-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 759000,
    "tax": 136620,
    "total": 895620,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-FY2526-01",
    "date": "2025-05-15",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 74800,
    "tax": 13464,
    "total": 88264,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "SI-BULK-0068",
    "date": "2025-05-13",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 105000,
    "tax": 18900,
    "total": 123900,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0067",
    "date": "2025-05-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 307200,
    "tax": 55296,
    "total": 362496,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0066",
    "date": "2025-05-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 713000,
    "tax": 128340,
    "total": 841340,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "SI-BULK-0065",
    "date": "2025-04-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 76250,
    "tax": 9150,
    "total": 85400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0064",
    "date": "2025-04-18",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 150000,
    "tax": 27000,
    "total": 177000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0063",
    "date": "2025-04-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 667000,
    "tax": 120060,
    "total": 787060,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0062",
    "date": "2025-04-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 71250,
    "tax": 8550,
    "total": 79800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0061",
    "date": "2025-04-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 264000,
    "tax": 47520,
    "total": 311520,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0060",
    "date": "2025-03-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 75000,
    "tax": 13500,
    "total": 88500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0059",
    "date": "2025-03-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 66250,
    "tax": 7950,
    "total": 74200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0058",
    "date": "2025-03-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 244800,
    "tax": 44064,
    "total": 288864,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0057",
    "date": "2025-03-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 575000,
    "tax": 103500,
    "total": 678500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0056",
    "date": "2025-03-03",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 105000,
    "tax": 18900,
    "total": 123900,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0055",
    "date": "2025-02-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 225600,
    "tax": 40608,
    "total": 266208,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0054",
    "date": "2025-02-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 529000,
    "tax": 95220,
    "total": 624220,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0053",
    "date": "2025-02-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 56250,
    "tax": 6750,
    "total": 63000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0052",
    "date": "2025-02-08",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 135000,
    "tax": 24300,
    "total": 159300,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0051",
    "date": "2025-02-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 483000,
    "tax": 86940,
    "total": 569940,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0050",
    "date": "2025-01-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 51250,
    "tax": 6150,
    "total": 57400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0049",
    "date": "2025-01-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 192000,
    "tax": 34560,
    "total": 226560,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0048",
    "date": "2025-01-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 75000,
    "tax": 13500,
    "total": 88500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0047",
    "date": "2025-01-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 46250,
    "tax": 5550,
    "total": 51800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0046",
    "date": "2025-01-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 172800,
    "tax": 31104,
    "total": 203904,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0045",
    "date": "2024-12-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 402500,
    "tax": 72450,
    "total": 474950,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0044",
    "date": "2024-12-18",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 105000,
    "tax": 18900,
    "total": 123900,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0043",
    "date": "2024-12-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 153600,
    "tax": 27648,
    "total": 181248,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0042",
    "date": "2024-12-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 356500,
    "tax": 64170,
    "total": 420670,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0041",
    "date": "2024-12-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 37500,
    "tax": 4500,
    "total": 42000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "SI-BULK-0040",
    "date": "2024-11-23",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 135000,
    "tax": 24300,
    "total": 159300,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0039",
    "date": "2024-11-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 828000,
    "tax": 149040,
    "total": 977040,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0038",
    "date": "2024-11-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 88750,
    "tax": 10650,
    "total": 99400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0037",
    "date": "2024-11-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 336000,
    "tax": 60480,
    "total": 396480,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0036",
    "date": "2024-11-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 60000,
    "tax": 10800,
    "total": 70800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0035",
    "date": "2024-10-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 83750,
    "tax": 10050,
    "total": 93800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0034",
    "date": "2024-10-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 316800,
    "tax": 57024,
    "total": 373824,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0033",
    "date": "2024-10-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 736000,
    "tax": 132480,
    "total": 868480,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0032",
    "date": "2024-10-08",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 105000,
    "tax": 18900,
    "total": 123900,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0031",
    "date": "2024-10-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 297600,
    "tax": 53568,
    "total": 351168,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0030",
    "date": "2024-09-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 701500,
    "tax": 126270,
    "total": 827770,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0029",
    "date": "2024-09-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 73750,
    "tax": 8850,
    "total": 82600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0028",
    "date": "2024-09-13",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 135000,
    "tax": 24300,
    "total": 159300,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0027",
    "date": "2024-09-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 655500,
    "tax": 117990,
    "total": 773490,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0026",
    "date": "2024-09-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 68750,
    "tax": 8250,
    "total": 77000,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0025",
    "date": "2024-08-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 259200,
    "tax": 46656,
    "total": 305856,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0024",
    "date": "2024-08-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 60000,
    "tax": 10800,
    "total": 70800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0023",
    "date": "2024-08-13",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 65000,
    "tax": 7800,
    "total": 72800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0022",
    "date": "2024-08-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 240000,
    "tax": 43200,
    "total": 283200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0021",
    "date": "2024-08-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 563500,
    "tax": 101430,
    "total": 664930,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "SI-BULK-0020",
    "date": "2024-07-23",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 90000,
    "tax": 16200,
    "total": 106200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0019",
    "date": "2024-07-18",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 225600,
    "tax": 40608,
    "total": 266208,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0018",
    "date": "2024-07-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 529000,
    "tax": 95220,
    "total": 624220,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0017",
    "date": "2024-07-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 55000,
    "tax": 6600,
    "total": 61600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0016",
    "date": "2024-07-03",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 120000,
    "tax": 21600,
    "total": 141600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0015",
    "date": "2024-06-23",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 483000,
    "tax": 86940,
    "total": 569940,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0014",
    "date": "2024-06-18",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 51250,
    "tax": 6150,
    "total": 57400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0013",
    "date": "2024-06-13",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 192000,
    "tax": 34560,
    "total": 226560,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0012",
    "date": "2024-06-08",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Main Warehouse",
    "taxable": 60000,
    "tax": 10800,
    "total": 70800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0011",
    "date": "2024-06-03",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 46250,
    "tax": 5550,
    "total": 51800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0010",
    "date": "2024-05-23",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 172800,
    "tax": 31104,
    "total": 203904,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0009",
    "date": "2024-05-18",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 402500,
    "tax": 72450,
    "total": 474950,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-FY2425-01",
    "date": "2024-05-15",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 74800,
    "tax": 13464,
    "total": 88264,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "SI-BULK-0008",
    "date": "2024-05-13",
    "party": "Kaveri Retail Chain",
    "location": "Main Warehouse",
    "taxable": 90000,
    "tax": 16200,
    "total": 106200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0007",
    "date": "2024-05-08",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 158400,
    "tax": 28512,
    "total": 186912,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0006",
    "date": "2024-05-03",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 368000,
    "tax": 66240,
    "total": 434240,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0005",
    "date": "2024-04-23",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 38750,
    "tax": 4650,
    "total": 43400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0004",
    "date": "2024-04-18",
    "party": "Delta Textiles LLP",
    "location": "Main Warehouse",
    "taxable": 120000,
    "tax": 21600,
    "total": 141600,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0003",
    "date": "2024-04-13",
    "party": "Sunrise Traders Pvt Ltd",
    "location": "Mumbai Central Warehouse",
    "taxable": 322000,
    "tax": 57960,
    "total": 379960,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0002",
    "date": "2024-04-08",
    "party": "Kaveri Retail Chain",
    "location": "Bengaluru Retail Store",
    "taxable": 33750,
    "tax": 4050,
    "total": 37800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "SI-BULK-0001",
    "date": "2024-04-03",
    "party": "Delta Textiles LLP",
    "location": "Pune Regional Warehouse",
    "taxable": 124800,
    "tax": 22464,
    "total": 147264,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  }
];
  purchaseList: InvoiceRow[] = [
  {
    "invoiceNo": "PI-BULK-0145",
    "date": "2026-08-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 214400,
    "tax": 38592,
    "total": 252992,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0144",
    "date": "2026-08-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 552500,
    "tax": 99450,
    "total": 651950,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0143",
    "date": "2026-08-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 59850,
    "tax": 7182,
    "total": 67032,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0142",
    "date": "2026-08-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 198400,
    "tax": 35712,
    "total": 234112,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0141",
    "date": "2026-08-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 510000,
    "tax": 91800,
    "total": 601800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0140",
    "date": "2026-07-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 56050,
    "tax": 6726,
    "total": 62776,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0139",
    "date": "2026-07-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 182400,
    "tax": 32832,
    "total": 215232,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0138",
    "date": "2026-07-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 467500,
    "tax": 84150,
    "total": 551650,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0137",
    "date": "2026-07-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 51300,
    "tax": 6156,
    "total": 57456,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-00001",
    "date": "2026-07-05",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 113500,
    "tax": 18720,
    "total": 132220,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "PI-BULK-0136",
    "date": "2026-07-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 166400,
    "tax": 29952,
    "total": 196352,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0135",
    "date": "2026-06-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 433500,
    "tax": 78030,
    "total": 511530,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0134",
    "date": "2026-06-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 108300,
    "tax": 12996,
    "total": 121296,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0133",
    "date": "2026-06-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 361600,
    "tax": 65088,
    "total": 426688,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0132",
    "date": "2026-06-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 943500,
    "tax": 169830,
    "total": 1113330,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0131",
    "date": "2026-06-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 103550,
    "tax": 12426,
    "total": 115976,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:17"
  },
  {
    "invoiceNo": "PI-BULK-0130",
    "date": "2026-05-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 345600,
    "tax": 62208,
    "total": 407808,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0129",
    "date": "2026-05-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 901000,
    "tax": 162180,
    "total": 1063180,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0128",
    "date": "2026-05-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 98800,
    "tax": 11856,
    "total": 110656,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0127",
    "date": "2026-05-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 326400,
    "tax": 58752,
    "total": 385152,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0126",
    "date": "2026-05-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 858500,
    "tax": 154530,
    "total": 1013030,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0125",
    "date": "2026-04-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 94050,
    "tax": 11286,
    "total": 105336,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0124",
    "date": "2026-04-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 313600,
    "tax": 56448,
    "total": 370048,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0123",
    "date": "2026-04-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 816000,
    "tax": 146880,
    "total": 962880,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0122",
    "date": "2026-04-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 89300,
    "tax": 10716,
    "total": 100016,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0121",
    "date": "2026-04-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 297600,
    "tax": 53568,
    "total": 351168,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0120",
    "date": "2026-03-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 773500,
    "tax": 139230,
    "total": 912730,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0119",
    "date": "2026-03-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 84550,
    "tax": 10146,
    "total": 94696,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0118",
    "date": "2026-03-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 281600,
    "tax": 50688,
    "total": 332288,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0117",
    "date": "2026-03-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 731000,
    "tax": 131580,
    "total": 862580,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0116",
    "date": "2026-03-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 80750,
    "tax": 9690,
    "total": 90440,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0115",
    "date": "2026-02-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 265600,
    "tax": 47808,
    "total": 313408,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0114",
    "date": "2026-02-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 688500,
    "tax": 123930,
    "total": 812430,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0113",
    "date": "2026-02-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 76000,
    "tax": 9120,
    "total": 85120,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0112",
    "date": "2026-02-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 249600,
    "tax": 44928,
    "total": 294528,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0111",
    "date": "2026-02-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 654500,
    "tax": 117810,
    "total": 772310,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0110",
    "date": "2026-01-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 71250,
    "tax": 8550,
    "total": 79800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0109",
    "date": "2026-01-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 236800,
    "tax": 42624,
    "total": 279424,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0108",
    "date": "2026-01-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 612000,
    "tax": 110160,
    "total": 722160,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0107",
    "date": "2026-01-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 67450,
    "tax": 8094,
    "total": 75544,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0106",
    "date": "2026-01-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 220800,
    "tax": 39744,
    "total": 260544,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:16"
  },
  {
    "invoiceNo": "PI-BULK-0105",
    "date": "2025-12-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 578000,
    "tax": 104040,
    "total": 682040,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0104",
    "date": "2025-12-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 62700,
    "tax": 7524,
    "total": 70224,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0103",
    "date": "2025-12-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 204800,
    "tax": 36864,
    "total": 241664,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0102",
    "date": "2025-12-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 535500,
    "tax": 96390,
    "total": 631890,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0101",
    "date": "2025-12-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 57950,
    "tax": 6954,
    "total": 64904,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0100",
    "date": "2025-11-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 192000,
    "tax": 34560,
    "total": 226560,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0099",
    "date": "2025-11-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 501500,
    "tax": 90270,
    "total": 591770,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0098",
    "date": "2025-11-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 54150,
    "tax": 6498,
    "total": 60648,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0097",
    "date": "2025-11-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 179200,
    "tax": 32256,
    "total": 211456,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0096",
    "date": "2025-11-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 459000,
    "tax": 82620,
    "total": 541620,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0095",
    "date": "2025-10-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 50350,
    "tax": 6042,
    "total": 56392,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0094",
    "date": "2025-10-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 163200,
    "tax": 29376,
    "total": 192576,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0093",
    "date": "2025-10-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 425000,
    "tax": 76500,
    "total": 501500,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0092",
    "date": "2025-10-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 45600,
    "tax": 5472,
    "total": 51072,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0091",
    "date": "2025-10-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 150400,
    "tax": 27072,
    "total": 177472,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0090",
    "date": "2025-09-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 391000,
    "tax": 70380,
    "total": 461380,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0089",
    "date": "2025-09-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 96900,
    "tax": 11628,
    "total": 108528,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0088",
    "date": "2025-09-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 323200,
    "tax": 58176,
    "total": 381376,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0087",
    "date": "2025-09-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 841500,
    "tax": 151470,
    "total": 992970,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0086",
    "date": "2025-09-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 93100,
    "tax": 11172,
    "total": 104272,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:15"
  },
  {
    "invoiceNo": "PI-BULK-0085",
    "date": "2025-08-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 307200,
    "tax": 55296,
    "total": 362496,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0084",
    "date": "2025-08-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 807500,
    "tax": 145350,
    "total": 952850,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0083",
    "date": "2025-08-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 88350,
    "tax": 10602,
    "total": 98952,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0082",
    "date": "2025-08-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 294400,
    "tax": 52992,
    "total": 347392,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0081",
    "date": "2025-08-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 765000,
    "tax": 137700,
    "total": 902700,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0080",
    "date": "2025-07-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 84550,
    "tax": 10146,
    "total": 94696,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0079",
    "date": "2025-07-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 278400,
    "tax": 50112,
    "total": 328512,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0078",
    "date": "2025-07-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 731000,
    "tax": 131580,
    "total": 862580,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0077",
    "date": "2025-07-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 79800,
    "tax": 9576,
    "total": 89376,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0076",
    "date": "2025-07-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 265600,
    "tax": 47808,
    "total": 313408,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0075",
    "date": "2025-06-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 688500,
    "tax": 123930,
    "total": 812430,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0074",
    "date": "2025-06-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 76000,
    "tax": 9120,
    "total": 85120,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0073",
    "date": "2025-06-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 249600,
    "tax": 44928,
    "total": 294528,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0072",
    "date": "2025-06-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 654500,
    "tax": 117810,
    "total": 772310,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0071",
    "date": "2025-06-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 71250,
    "tax": 8550,
    "total": 79800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0070",
    "date": "2025-05-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 236800,
    "tax": 42624,
    "total": 279424,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0069",
    "date": "2025-05-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 620500,
    "tax": 111690,
    "total": 732190,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0068",
    "date": "2025-05-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 67450,
    "tax": 8094,
    "total": 75544,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-FY2526-01",
    "date": "2025-05-10",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 125750,
    "tax": 21210,
    "total": 146960,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0067",
    "date": "2025-05-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 224000,
    "tax": 40320,
    "total": 264320,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0066",
    "date": "2025-05-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 578000,
    "tax": 104040,
    "total": 682040,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0065",
    "date": "2025-04-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 63650,
    "tax": 7638,
    "total": 71288,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0064",
    "date": "2025-04-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 211200,
    "tax": 38016,
    "total": 249216,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0063",
    "date": "2025-04-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 544000,
    "tax": 97920,
    "total": 641920,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0062",
    "date": "2025-04-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 59850,
    "tax": 7182,
    "total": 67032,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0061",
    "date": "2025-04-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 195200,
    "tax": 35136,
    "total": 230336,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:14"
  },
  {
    "invoiceNo": "PI-BULK-0060",
    "date": "2025-03-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 510000,
    "tax": 91800,
    "total": 601800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0059",
    "date": "2025-03-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 56050,
    "tax": 6726,
    "total": 62776,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0058",
    "date": "2025-03-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 182400,
    "tax": 32832,
    "total": 215232,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0057",
    "date": "2025-03-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 476000,
    "tax": 85680,
    "total": 561680,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0056",
    "date": "2025-03-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 52250,
    "tax": 6270,
    "total": 58520,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0055",
    "date": "2025-02-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 169600,
    "tax": 30528,
    "total": 200128,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0054",
    "date": "2025-02-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 442000,
    "tax": 79560,
    "total": 521560,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0053",
    "date": "2025-02-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 48450,
    "tax": 5814,
    "total": 54264,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0052",
    "date": "2025-02-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 156800,
    "tax": 28224,
    "total": 185024,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0051",
    "date": "2025-02-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 408000,
    "tax": 73440,
    "total": 481440,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0050",
    "date": "2025-01-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 44650,
    "tax": 5358,
    "total": 50008,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0049",
    "date": "2025-01-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 144000,
    "tax": 25920,
    "total": 169920,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0048",
    "date": "2025-01-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 374000,
    "tax": 67320,
    "total": 441320,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0047",
    "date": "2025-01-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 40850,
    "tax": 4902,
    "total": 45752,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0046",
    "date": "2025-01-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 134400,
    "tax": 24192,
    "total": 158592,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0045",
    "date": "2024-12-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 340000,
    "tax": 61200,
    "total": 401200,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0044",
    "date": "2024-12-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 86450,
    "tax": 10374,
    "total": 96824,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0043",
    "date": "2024-12-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 284800,
    "tax": 51264,
    "total": 336064,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0042",
    "date": "2024-12-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 748000,
    "tax": 134640,
    "total": 882640,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0041",
    "date": "2024-12-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 81700,
    "tax": 9804,
    "total": 91504,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:13"
  },
  {
    "invoiceNo": "PI-BULK-0040",
    "date": "2024-11-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 272000,
    "tax": 48960,
    "total": 320960,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0039",
    "date": "2024-11-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 714000,
    "tax": 128520,
    "total": 842520,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0038",
    "date": "2024-11-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 77900,
    "tax": 9348,
    "total": 87248,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0037",
    "date": "2024-11-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 259200,
    "tax": 46656,
    "total": 305856,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0036",
    "date": "2024-11-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 680000,
    "tax": 122400,
    "total": 802400,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0035",
    "date": "2024-10-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 74100,
    "tax": 8892,
    "total": 82992,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0034",
    "date": "2024-10-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 246400,
    "tax": 44352,
    "total": 290752,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0033",
    "date": "2024-10-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 637500,
    "tax": 114750,
    "total": 752250,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0032",
    "date": "2024-10-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 70300,
    "tax": 8436,
    "total": 78736,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0031",
    "date": "2024-10-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 233600,
    "tax": 42048,
    "total": 275648,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0030",
    "date": "2024-09-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 612000,
    "tax": 110160,
    "total": 722160,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0029",
    "date": "2024-09-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 66500,
    "tax": 7980,
    "total": 74480,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0028",
    "date": "2024-09-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 220800,
    "tax": 39744,
    "total": 260544,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0027",
    "date": "2024-09-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 578000,
    "tax": 104040,
    "total": 682040,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0026",
    "date": "2024-09-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 62700,
    "tax": 7524,
    "total": 70224,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0025",
    "date": "2024-08-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 208000,
    "tax": 37440,
    "total": 245440,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0024",
    "date": "2024-08-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 544000,
    "tax": 97920,
    "total": 641920,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0023",
    "date": "2024-08-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 58900,
    "tax": 7068,
    "total": 65968,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0022",
    "date": "2024-08-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 195200,
    "tax": 35136,
    "total": 230336,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0021",
    "date": "2024-08-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 510000,
    "tax": 91800,
    "total": 601800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:12"
  },
  {
    "invoiceNo": "PI-BULK-0020",
    "date": "2024-07-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 56050,
    "tax": 6726,
    "total": 62776,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0019",
    "date": "2024-07-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 182400,
    "tax": 32832,
    "total": 215232,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0018",
    "date": "2024-07-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 476000,
    "tax": 85680,
    "total": 561680,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0017",
    "date": "2024-07-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 52250,
    "tax": 6270,
    "total": 58520,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0016",
    "date": "2024-07-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 172800,
    "tax": 31104,
    "total": 203904,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0015",
    "date": "2024-06-23",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 450500,
    "tax": 81090,
    "total": 531590,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0014",
    "date": "2024-06-18",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 48450,
    "tax": 5814,
    "total": 54264,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0013",
    "date": "2024-06-13",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 160000,
    "tax": 28800,
    "total": 188800,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0012",
    "date": "2024-06-08",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 416500,
    "tax": 74970,
    "total": 491470,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0011",
    "date": "2024-06-03",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 45600,
    "tax": 5472,
    "total": 51072,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0010",
    "date": "2024-05-23",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 150400,
    "tax": 27072,
    "total": 177472,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0009",
    "date": "2024-05-18",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 382500,
    "tax": 68850,
    "total": 451350,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0008",
    "date": "2024-05-13",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 41800,
    "tax": 5016,
    "total": 46816,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-FY2425-01",
    "date": "2024-05-10",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 125750,
    "tax": 21210,
    "total": 146960,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:10"
  },
  {
    "invoiceNo": "PI-BULK-0007",
    "date": "2024-05-08",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 137600,
    "tax": 24768,
    "total": 162368,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0006",
    "date": "2024-05-03",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 357000,
    "tax": 64260,
    "total": 421260,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0005",
    "date": "2024-04-23",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 38950,
    "tax": 4674,
    "total": 43624,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0004",
    "date": "2024-04-18",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 128000,
    "tax": 23040,
    "total": 151040,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0003",
    "date": "2024-04-13",
    "party": "Om Suppliers",
    "location": "Mumbai Central Warehouse",
    "taxable": 323000,
    "tax": 58140,
    "total": 381140,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0002",
    "date": "2024-04-08",
    "party": "Om Suppliers",
    "location": "Bengaluru Retail Store",
    "taxable": 35150,
    "tax": 4218,
    "total": 39368,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  },
  {
    "invoiceNo": "PI-BULK-0001",
    "date": "2024-04-03",
    "party": "Om Suppliers",
    "location": "Pune Regional Warehouse",
    "taxable": 115200,
    "tax": 20736,
    "total": 135936,
    "status": "Posted",
    "createdAt": "2026-10-22 17:08:11"
  }
];

  get currentList(): InvoiceRow[] {
    return this.invoiceType === 'sales' ? this.salesList : this.purchaseList;
  }

  get filteredList(): InvoiceRow[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.currentList;
    return this.currentList.filter(inv =>
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.party.toLowerCase().includes(q) ||
      inv.location.toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
  }

  get pagedList(): InvoiceRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredList.slice(start, start + this.pageSize);
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'purchase') {
        this.invoiceType = 'purchase';
      } else {
        this.invoiceType = 'sales';
      }
      this.currentPage = 1;
    });
  }

  setType(t: 'sales' | 'purchase') {
    this.invoiceType = t;
    this.currentPage = 1;
    this.searchQuery = '';
  }

  onSearch() {
    this.currentPage = 1;
  }
}
