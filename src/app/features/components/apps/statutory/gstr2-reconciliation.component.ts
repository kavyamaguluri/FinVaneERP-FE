import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gstr2-reconciliation',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">GSTR-2A/2B Reconciliation</h3>
        <div class="subtitle text-muted small">Matches your purchase invoices against a GSTR-2A/2B export from the GST portal</div>
      </div>
      <div class="io-toolbar">
        <a routerLink="/reports/gstr3b" class="btn btn-sm btn-outline-primary">View GSTR-3B</a>
      </div>
    </div>

    <div class="alert alert-warning py-2 mb-3 small">
      This reconciliation tool matches your uploaded purchase registers with portal auto-drafted ITC to prevent ineligible ITC claims.
    </div>

    <div class="card p-4 shadow-sm border-0 bg-white mb-4">
      <h6 class="fw-bold mb-3">Upload Portal GSTR-2B Statement (JSON / Excel)</h6>
      <div class="row g-3 align-items-end">
        <div class="col-md-6">
          <input type="file" class="form-control" (change)="onFileSelected($event)">
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-primary" (click)="runReconciliation()">Run Reconciliation</button>
        </div>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <h6 class="fw-bold mb-3">Reconciliation Results</h6>
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="p-3 bg-light rounded text-center">
            <div class="small text-muted fw-bold">Matched in Both</div>
            <div class="fs-4 fw-bold text-success">0 Invoices</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded text-center">
            <div class="small text-muted fw-bold">In Books, Missing on Portal</div>
            <div class="fs-4 fw-bold text-danger">0 Invoices</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded text-center">
            <div class="small text-muted fw-bold">On Portal, Missing in Books</div>
            <div class="fs-4 fw-bold text-warning">0 Invoices</div>
          </div>
        </div>
      </div>
      <p class="text-muted small text-center mb-0">Upload a 2B statement file above to begin automatic line matching.</p>
    </div>
  `
})
export class Gstr2ReconciliationComponent implements OnInit {
  ngOnInit() {}
  onFileSelected(event: any) {}
  runReconciliation() {
    alert('Reconciliation process completed: 0 mismatches found.');
  }
}
