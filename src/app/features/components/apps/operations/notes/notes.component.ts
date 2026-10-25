import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface NoteRow {
  id?: number;
  noteNo: string;
  noteDate: string;
  party: string;
  reason: string;
  taxable: number;
  total: number;
  status: string;
}

@Component({
  selector: 'app-notes',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold" style="font-size: 1.45rem;">{{ noteType === 'credit' ? 'Credit Notes' : 'Debit Notes' }}</h3>
        <div class="subtitle text-muted small">Sales returns, vendor debit adjustments, and rate difference notes</div>
      </div>
      <div class="io-toolbar d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" [class.active]="noteType === 'credit'" (click)="setNoteType('credit')">
          Credit Notes ({{ creditCount }})
        </button>
        <button class="btn btn-sm btn-outline-secondary" [class.active]="noteType === 'debit'" (click)="setNoteType('debit')">
          Debit Notes ({{ debitCount }})
        </button>
        <a [routerLink]="['/notes/new']" [queryParams]="{type: noteType}" class="btn btn-primary btn-sm" style="background-color: #00796b; border-color: #00796b;">
          + New {{ noteType === 'credit' ? 'Credit Note' : 'Debit Note' }}
        </a>
      </div>
    </div>

    <div class="card p-3 shadow-sm border bg-white">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small text-muted">{{ currentList.length }} {{ noteType }} note{{ currentList.length === 1 ? '' : 's' }}</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small text-uppercase">
            <tr>
              <th>Note No.</th>
              <th>Date</th>
              <th>Party</th>
              <th>Reason</th>
              <th class="text-end">Taxable</th>
              <th class="text-end">Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let n of currentList">
              <td><strong class="text-primary font-monospace">{{ n.noteNo }}</strong></td>
              <td>{{ n.noteDate }}</td>
              <td class="fw-medium text-dark">{{ n.party }}</td>
              <td class="text-muted small">{{ n.reason || '—' }}</td>
              <td class="text-end font-monospace">₹{{ n.taxable | number:'1.2-2' }}</td>
              <td class="text-end fw-semibold font-monospace">₹{{ n.total | number:'1.2-2' }}</td>
              <td>
                <span class="badge" [ngClass]="n.status === 'posted' ? 'bg-success-subtle text-success-emphasis border' : 'bg-secondary-subtle text-secondary-emphasis'">
                  {{ n.status }}
                </span>
              </td>
            </tr>
            <tr *ngIf="currentList.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No {{ noteType }} notes found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table td, .table th { padding: 0.5rem 0.65rem; font-size: 0.875rem; }
    .bg-success-subtle { background-color: #d1fae5 !important; }
    .text-success-emphasis { color: #065f46 !important; }
  `]
})
export class NotesComponent implements OnInit {
  noteType: 'credit' | 'debit' = 'credit';
  creditCount: number = 147;
  debitCount: number = 147;
  currentList: NoteRow[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'debit') {
        this.noteType = 'debit';
      } else {
        this.noteType = 'credit';
      }
      this.loadNotes();
    });
  }

  setNoteType(t: 'credit' | 'debit') {
    this.noteType = t;
    this.loadNotes();
  }

  loadNotes() {
    this.http.get<any>(`${environment.apiBaseUrl}/notes?type=${this.noteType}`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.currentList = res.data.map((n: any) => ({
            id: n.id,
            noteNo: n.noteNo,
            noteDate: n.noteDate,
            party: n.partyName,
            reason: n.reason,
            taxable: Number(n.taxableValue || 0),
            total: Number(n.totalAmount || 0),
            status: n.status || 'posted'
          }));
          if (this.noteType === 'credit') {
            this.creditCount = this.currentList.length;
          } else {
            this.debitCount = this.currentList.length;
          }
        }
      },
      error: () => {}
    });
  }
}
