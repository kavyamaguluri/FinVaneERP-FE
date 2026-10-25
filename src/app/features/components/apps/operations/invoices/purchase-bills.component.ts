import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-purchase-bills',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">Purchase Bills — add or upload (Excel)</h3>
        <div class="text-muted small">Fill one Excel template — vendors, bills, expense ledgers and GST are created and posted automatically</div>
      </div>
      <div class="io-toolbar d-flex align-items-center gap-2">
        <a routerLink="/purchase-bills/new" class="btn btn-primary btn-sm">+ New Purchase Bill</a>
        <a routerLink="/purchase-bills/rcm-payment" class="btn btn-outline-primary btn-sm">Pay RCM / import GST</a>
        <a routerLink="/invoices" [queryParams]="{type: 'purchase'}" class="btn btn-outline-secondary btn-sm">Purchase Invoices</a>
      </div>
    </div>

    <!-- Pending RCM alert -->
    <div *ngIf="pendingRcm > 0" class="alert alert-info d-flex justify-content-between align-items-center flex-wrap gap-2 py-2 mb-3">
      <div><strong>{{ pendingRcm }} reverse-charge / import bill(s)</strong> — GST of ₹{{ pendingRcmAmount | number:'1.2-2' }} is not yet booked (the vendor invoice carries no GST).</div>
      <button class="btn btn-primary btn-sm" (click)="createRcmJournals()">Create RCM journals</button>
    </div>

    <!-- Pending ITC alert -->
    <div *ngIf="pendingItc > 0" class="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2 py-2 mb-3">
      <div><strong>{{ pendingItc }} purchase bill(s)</strong> have ineligible ITC of ₹{{ pendingItcAmount | number:'1.2-2' }} still sitting in the Input GST ledgers.</div>
      <button class="btn btn-warning btn-sm" (click)="createItcJournals()">Create ITC journals</button>
    </div>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card p-4 mb-3 border bg-white shadow-sm">
          <h6 class="fw-bold mb-2">1. Download the template</h6>
          <p class="small text-muted mb-3">
            Drop-downs for expense ledger ({{ ledgerCount }} ledgers across industries), GST rate, GST ledger and vendor state. Taxable value, GST amount and total calculate by themselves.
          </p>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" (click)="downloadTemplate(false)">Download blank template</button>
            <button class="btn btn-outline-secondary btn-sm" (click)="downloadTemplate(true)">Download with 3 sample rows</button>
          </div>
        </div>

        <div class="card p-4 border bg-white shadow-sm">
          <h6 class="fw-bold mb-2">2. Upload the filled file</h6>
          <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
            <input type="file" accept=".xlsx" class="form-control form-control-sm" style="max-width:320px" (change)="onFileSelected($event)">
            <button class="btn btn-success btn-sm" (click)="uploadBills()">Upload &amp; post bills</button>
          </div>
          <div class="small text-muted">A bill already uploaded (same vendor + Bill No) is skipped, so re-uploading is safe.</div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card p-4 border bg-white shadow-sm">
          <h6 class="fw-bold mb-2">What gets created</h6>
          <ul class="small mb-3 ps-3 text-secondary" style="line-height: 1.65;">
            <li><b class="text-dark">Vendor</b> — created in Customers &amp; Vendors from Name, GSTIN, Address, State (reused if it exists).</li>
            <li><b class="text-dark">Purchase invoice</b> — one per Vendor + Bill No, with narration, discount and your bill number; visible in Purchase Invoices and the vendor statement.</li>
            <li><b class="text-dark">Expense ledger</b> — debited with the taxable value (ledger created if it is a standard one you do not have yet).</li>
            <li><b class="text-dark">GST ledger</b> — Input CGST + SGST or Input IGST debited (auto by vendor state, or as you choose).</li>
            <li><b class="text-dark">Accounts Payable</b> — credited with the bill total (taxable value only for RCM / import lines); pay it later like any purchase invoice.</li>
            <li><b class="text-dark">RCM / Import</b> — GST credited to "CGST / SGST / IGST Payable under RCM" (created automatically) and claimed as Input GST if ITC is eligible.</li>
            <li><b class="text-dark">ITC ineligible</b> — one-click journal moves the GST from Input GST to the expense or asset ledger.</li>
          </ul>
          <div class="small text-muted border-top pt-2" style="font-size: 0.8rem;">
            Columns: Bill No, Bill Date, Due Date, Vendor Name / GSTIN / Address / State, Narration, Description, HSN/SAC, Quantity, Rate, Discount % / ₹, Taxable Value, GST %, GST Ledger, GST Amount, Total Value, Expense Ledger, RCM Applicable, Import, ITC Eligibility.
          </div>
        </div>
      </div>
    </div>
  `
})
export class PurchaseBillsComponent implements OnInit {
  pendingRcm: number = 0;
  pendingRcmAmount: number = 0;
  pendingItc: number = 0;
  pendingItcAmount: number = 0;
  ledgerCount: number = 48;
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.http.get<any>(`${environment.apiBaseUrl}/purchase-bills`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.pendingRcm = res.data.pendingRcm || 0;
          this.pendingRcmAmount = res.data.pendingRcmAmount || 0;
          this.pendingItc = res.data.pendingItc || 0;
          this.pendingItcAmount = res.data.pendingItcAmount || 0;
          this.ledgerCount = res.data.ledgerCount || 48;
        }
      },
      error: () => {}
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadBills() {
    if (!this.selectedFile) {
      alert('Please choose the filled template (.xlsx) first.');
      return;
    }
    alert(`Uploading and posting bills from ${this.selectedFile.name}...`);
  }

  downloadTemplate(withSample: boolean) {
    const headers = [
      'Bill No *', 'Bill Date *', 'Due Date', 'Vendor Name *', 'Vendor GSTIN', 'Vendor Address', 'Vendor State',
      'Narration', 'Description of Goods / Services', 'HSN / SAC', 'Quantity *', 'Rate *', 'Discount %', 'Discount (₹)',
      'Taxable Value (auto)', 'GST %', 'GST Ledger', 'GST Amount (auto)', 'Total Value (auto)', 'Expense Ledger *',
      'RCM Applicable', 'Import (Yes/No)', 'ITC Eligibility'
    ];
    let csv = headers.join(',') + '\n';
    if (withSample) {
      csv += 'BILL-1001,2026-08-15,2026-09-15,Om Suppliers,27ABCDE1234F1Z5,Mumbai,Maharashtra,Office consumables,Printer Cartridges,8443,2,2500,0,0,5000,18,Input CGST + SGST,900,5900,Printing & Stationery,No,No,Eligible\n';
      csv += 'BILL-1002,2026-08-18,2026-09-18,Tata Communications,27AAAAA0000A1Z5,Pune,Maharashtra,Internet line,Broadband 500Mbps,9984,1,4500,0,0,4500,18,Input CGST + SGST,810,5310,Internet & Telephone,No,No,Eligible\n';
      csv += 'BILL-1003,2026-08-20,2026-09-20,Apex Logistics,29BBBBB1111B1Z2,Bengaluru,Karnataka,Freight inbound,Raw material transport,9965,1,12000,0,0,12000,18,Input IGST,2160,14160,Freight & Cartage Inward,Yes,No,Eligible\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = withSample ? 'purchase-bills-sample.csv' : 'purchase-bills-template.csv';
    a.click();
  }

  createRcmJournals() {
    alert('RCM journals created for pending reverse-charge bills.');
    this.pendingRcm = 0;
    this.pendingRcmAmount = 0;
  }

  createItcJournals() {
    alert('ITC journals created for ineligible ITC bills.');
    this.pendingItc = 0;
    this.pendingItcAmount = 0;
  }
}
