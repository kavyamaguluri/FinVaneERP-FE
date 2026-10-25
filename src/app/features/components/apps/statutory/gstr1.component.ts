import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gstr1',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">GSTR-1</h3>
        <div class="subtitle text-muted small">Details of outward supplies, arranged as on the GST portal</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-primary">Convert to JSON</button>
        <button type="button" class="btn btn-sm btn-outline-primary">Convert to Excel</button>
      </div>
    </div>

    <!-- Summary Tiles matching Express views/reports/gstr1.ejs -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">4A, 4B &mdash; B2B Invoices</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ activeTenantId === '2' ? '45,000' : '37,90,000' }}</div>
          <div class="small text-muted">Registered taxable supplies</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">5A, 5B &mdash; B2CL Invoices</div>
          <div class="fs-4 fw-bold text-dark">&#8377;0</div>
          <div class="small text-muted">Large inter-state unregistered</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">7 &mdash; B2CS Supplies</div>
          <div class="fs-4 fw-bold text-dark">&#8377;0</div>
          <div class="small text-muted">Small unregistered outward</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 shadow-sm border-0 bg-white">
          <div class="small text-muted fw-semibold">12 &mdash; HSN Summary</div>
          <div class="fs-4 fw-bold text-dark">&#8377;{{ activeTenantId === '2' ? '45,000' : '37,90,000' }}</div>
          <div class="small text-muted">Services &amp; Goods supplies</div>
        </div>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <h6 class="fw-bold mb-3">Table 4: B2B Outward Supplies</h6>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>GSTIN/UIN</th>
              <th>Receiver Name</th>
              <th>Invoice No.</th>
              <th>Invoice Date</th>
              <th class="text-end">Invoice Value</th>
              <th>Place of Supply</th>
              <th class="text-end">Taxable Value</th>
              <th class="text-end">Integrated Tax</th>
              <th class="text-end">Central Tax</th>
              <th class="text-end">State Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="activeTenantId === '2'">
              <td><code>36AAACN1234F1Z5</code></td>
              <td class="fw-bold">Northwind Consulting Client</td>
              <td>JV-00002</td>
              <td>2026-09-15</td>
              <td class="text-end fw-semibold">₹45,000.00</td>
              <td>36-Telangana</td>
              <td class="text-end">₹45,000.00</td>
              <td class="text-end">₹0.00</td>
              <td class="text-end">₹0.00</td>
              <td class="text-end">₹0.00</td>
            </tr>
            <tr *ngIf="activeTenantId === '1'">
              <td><code>27AABCU9603R1ZM</code></td>
              <td class="fw-bold">Apex Distributors</td>
              <td>INV-2026-001</td>
              <td>2026-10-02</td>
              <td class="text-end fw-semibold">₹1,18,000.00</td>
              <td>27-Maharashtra</td>
              <td class="text-end">₹1,00,000.00</td>
              <td class="text-end">₹0.00</td>
              <td class="text-end">₹9,000.00</td>
              <td class="text-end">₹9,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class Gstr1Component implements OnInit {
  activeTenantId = '1';
  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
  }
}
