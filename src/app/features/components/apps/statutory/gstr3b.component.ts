import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gstr3b',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">GSTR-3B</h3>
        <div class="subtitle text-muted small">Laid out like the GST-portal return &mdash; computed from your books (outward from invoices, ITC from purchase bills with RCM / eligibility)</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-primary" (click)="downloadPdf()">Download PDF</button>
        <a routerLink="/compliance/gstr2-reconciliation" class="btn btn-sm btn-outline-secondary">GSTR-2A/2B Reconciliation</a>
      </div>
    </div>

    <!-- Table 3.1 Outward Supplies -->
    <div class="card p-3 shadow-sm border-0 bg-white mb-3">
      <h6 class="fw-bold mb-2">3.1 Details of Outward Supplies and inward supplies liable to reverse charge</h6>
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Nature of Supplies</th>
              <th class="text-end">Total Taxable Value (₹)</th>
              <th class="text-end">Integrated Tax (₹)</th>
              <th class="text-end">Central Tax (₹)</th>
              <th class="text-end">State/UT Tax (₹)</th>
              <th class="text-end">Cess (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</td>
              <td class="text-end fw-semibold">{{ activeTenantId === '2' ? '45,000.00' : '37,90,000.00' }}</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
            <tr>
              <td>(b) Outward taxable supplies (zero rated)</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
            <tr>
              <td>(c) Other outward supplies (Nil rated, exempted)</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
            <tr>
              <td>(d) Inward supplies (liable to reverse charge)</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Table 4 Eligible ITC -->
    <div class="card p-3 shadow-sm border-0 bg-white">
      <h6 class="fw-bold mb-2">4. Eligible ITC</h6>
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Details</th>
              <th class="text-end">Integrated Tax (₹)</th>
              <th class="text-end">Central Tax (₹)</th>
              <th class="text-end">State/UT Tax (₹)</th>
              <th class="text-end">Cess (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>(A) ITC Available (whether in full or part)</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
            <tr>
              <td>(B) ITC Reversed</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
            <tr class="fw-bold table-light">
              <td>(C) Net ITC Available (A) &minus; (B)</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
              <td class="text-end">0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class Gstr3bComponent implements OnInit {
  activeTenantId = '1';
  ngOnInit() {
    this.activeTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
  }
  downloadPdf() { window.print(); }
}
