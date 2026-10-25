import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-note-form',
  template: `
    <div class="mb-3">
      <a [routerLink]="['/notes']" [queryParams]="{type: noteType}" class="btn btn-outline-secondary btn-sm">
        &larr; Back
      </a>
    </div>

    <!-- Step 1: Pick Invoice -->
    <div *ngIf="!selectedInvoice">
      <h4 class="fw-bold mb-1">{{ noteType === 'credit' ? 'New Credit Note' : 'New Debit Note' }}</h4>
      <p class="text-muted small mb-3">Select the {{ noteType === 'credit' ? 'sales' : 'purchase' }} invoice this note applies against.</p>

      <div class="card p-3 border bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Party</th>
                <th class="text-end">Total</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of invoiceList">
                <td class="fw-bold text-dark">{{ inv.invoiceNo }}</td>
                <td>{{ inv.invoiceDate }}</td>
                <td>{{ inv.partyName }}</td>
                <td class="text-end font-monospace fw-semibold">₹{{ inv.totalAmount | number:'1.2-2' }}</td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-primary" (click)="pickInvoice(inv.id)" style="background-color: #00796b; border-color: #00796b;">
                    Select
                  </button>
                </td>
              </tr>
              <tr *ngIf="invoiceList.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  No posted {{ noteType === 'credit' ? 'sales' : 'purchase' }} invoices available yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Step 2: Fill Note Form -->
    <div *ngIf="selectedInvoice">
      <h4 class="fw-bold mb-3">{{ noteType === 'credit' ? 'New Credit Note' : 'New Debit Note' }}</h4>

      <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
        {{ errorMessage }}
      </div>

      <div class="card p-4 mb-3 border bg-white shadow-sm">
        <p class="mb-3">
          <strong>Against invoice:</strong> {{ selectedInvoice.invoice_no }} &mdash; {{ selectedInvoice.party_name }} ({{ selectedInvoice.invoice_date }})
        </p>

        <form (ngSubmit)="onSubmit()">
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Note Date *</label>
              <input type="date" [(ngModel)]="noteDate" name="noteDate" class="form-control form-control-sm" required>
            </div>
            <div class="col-md-8">
              <label class="form-label small fw-semibold">Reason</label>
              <input type="text" [(ngModel)]="reason" name="reason" class="form-control form-control-sm" placeholder="e.g. Damaged goods returned / Rate correction">
            </div>
          </div>

          <div class="table-responsive mb-3">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Item</th>
                  <th class="text-end" style="width: 150px;">Invoiced Qty</th>
                  <th class="text-end" style="width: 150px;">Rate</th>
                  <th class="text-end" style="width: 220px;">Return / Correction Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ln of invoiceLines; let i = index">
                  <td>
                    <span class="fw-semibold">{{ ln.item_name || 'Item' }}</span>
                    <span *ngIf="ln.sku" class="text-muted small ms-1">({{ ln.sku }})</span>
                  </td>
                  <td class="text-end font-monospace">{{ ln.qty }}</td>
                  <td class="text-end font-monospace">₹{{ ln.rate | number:'1.2-2' }}</td>
                  <td class="text-end">
                    <input type="number" step="0.01" min="0" [max]="ln.qty" [(ngModel)]="ln.returnQty" [name]="'ret_' + i" class="form-control form-control-sm text-end" placeholder="0">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-muted small mb-4">
            Enter the quantity being returned/corrected for each line (0 to skip a line). GST is reversed proportionally at the original line rate, and returned goods are {{ noteType === 'credit' ? 'added back to stock' : 'removed from stock (FIFO)' }}.
          </p>

          <div class="d-flex align-items-center gap-2">
            <button type="submit" class="btn btn-primary" [disabled]="submitting" style="background-color: #00796b; border-color: #00796b;">
              {{ submitting ? 'Creating...' : ('Create ' + (noteType === 'credit' ? 'Credit' : 'Debit') + ' Note') }}
            </button>
            <a [routerLink]="['/notes']" [queryParams]="{type: noteType}" class="btn btn-link text-decoration-none">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class NoteFormComponent implements OnInit {
  noteType: 'credit' | 'debit' = 'credit';
  invoiceList: any[] = [];
  selectedInvoice: any = null;
  invoiceLines: any[] = [];

  noteDate: string = new Date().toISOString().slice(0, 10);
  reason: string = '';
  errorMessage: string = '';
  submitting: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.noteType = params['type'] === 'debit' ? 'debit' : 'credit';
      const invId = params['invoice_id'];
      if (invId) {
        this.pickInvoice(Number(invId));
      } else {
        this.loadInvoices();
      }
    });
  }

  loadInvoices() {
    this.http.get<any>(`${environment.apiBaseUrl}/notes/invoices?type=${this.noteType}`).subscribe({
      next: (res) => {
        if (res && res.data) this.invoiceList = res.data;
      },
      error: () => {}
    });
  }

  pickInvoice(id: number) {
    this.http.get<any>(`${environment.apiBaseUrl}/notes/invoice/${id}`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.selectedInvoice = res.data.invoice;
          this.invoiceLines = (res.data.lines || []).map((l: any) => ({
            ...l,
            returnQty: 0
          }));
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Could not load invoice.';
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    const activeLines = this.invoiceLines.filter(l => Number(l.returnQty) > 0);
    if (!activeLines.length) {
      this.errorMessage = 'Please enter return/correction quantity for at least one line.';
      return;
    }

    this.submitting = true;
    this.http.post<any>(`${environment.apiBaseUrl}/notes`, {
      noteType: this.noteType,
      invoiceId: this.selectedInvoice.id,
      partyId: this.selectedInvoice.party_id,
      locationId: this.selectedInvoice.location_id,
      noteDate: this.noteDate,
      reason: this.reason,
      lines: activeLines.map(l => ({
        itemId: l.item_id,
        qty: Number(l.returnQty),
        rate: Number(l.rate || 0),
        gstRate: Number(l.gst_rate || 18)
      }))
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/notes'], { queryParams: { type: this.noteType } });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create note.';
      }
    });
  }
}
