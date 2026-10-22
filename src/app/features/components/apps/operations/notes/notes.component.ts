import { Component, OnInit } from '@angular/core';

export interface NoteRow {
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
        <h3 class="mb-0 fw-bold">{{ noteType === 'credit' ? 'Credit Notes' : 'Debit Notes' }}</h3>
        <div class="subtitle text-muted small">Sales returns, vendor debit adjustments, and rate difference notes</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary" [class.active]="noteType === 'credit'" (click)="noteType = 'credit'">Credit Notes (147)</button>
        <button class="btn btn-sm btn-outline-secondary" [class.active]="noteType === 'debit'" (click)="noteType = 'debit'">Debit Notes (147)</button>
        <button class="btn btn-primary btn-sm">+ New {{ noteType === 'credit' ? 'Credit Note' : 'Debit Note' }}</button>
      </div>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Note No</th>
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
              <td><strong class="text-primary">{{ n.noteNo }}</strong></td>
              <td>{{ n.noteDate }}</td>
              <td class="fw-semibold text-dark">{{ n.party }}</td>
              <td class="text-muted small">{{ n.reason }}</td>
              <td class="text-end">₹{{ n.taxable | number:'1.2-2' }}</td>
              <td class="text-end fw-bold">₹{{ n.total | number:'1.2-2' }}</td>
              <td><span class="badge text-bg-success">{{ n.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class NotesComponent implements OnInit {
  noteType: 'credit' | 'debit' = 'credit';

  creditNotes: NoteRow[] = [
  {
    "noteNo": "CN-00147",
    "noteDate": "2026-08-24",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00146",
    "noteDate": "2026-08-19",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00145",
    "noteDate": "2026-08-14",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00144",
    "noteDate": "2026-08-09",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00143",
    "noteDate": "2026-08-04",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00142",
    "noteDate": "2026-07-24",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00141",
    "noteDate": "2026-07-19",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00140",
    "noteDate": "2026-07-14",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00139",
    "noteDate": "2026-07-09",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00138",
    "noteDate": "2026-07-04",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00137",
    "noteDate": "2026-06-24",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00136",
    "noteDate": "2026-06-19",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00135",
    "noteDate": "2026-06-14",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00134",
    "noteDate": "2026-06-09",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00133",
    "noteDate": "2026-06-04",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00132",
    "noteDate": "2026-05-24",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00131",
    "noteDate": "2026-05-19",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00130",
    "noteDate": "2026-05-14",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00129",
    "noteDate": "2026-05-09",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00128",
    "noteDate": "2026-05-04",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00127",
    "noteDate": "2026-04-24",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00126",
    "noteDate": "2026-04-19",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00125",
    "noteDate": "2026-04-14",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00124",
    "noteDate": "2026-04-09",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00123",
    "noteDate": "2026-04-04",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00122",
    "noteDate": "2026-03-24",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00121",
    "noteDate": "2026-03-19",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00120",
    "noteDate": "2026-03-14",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00119",
    "noteDate": "2026-03-09",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00118",
    "noteDate": "2026-03-04",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00117",
    "noteDate": "2026-02-24",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00116",
    "noteDate": "2026-02-19",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00115",
    "noteDate": "2026-02-14",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00114",
    "noteDate": "2026-02-09",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00113",
    "noteDate": "2026-02-04",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00112",
    "noteDate": "2026-01-24",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00111",
    "noteDate": "2026-01-19",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00110",
    "noteDate": "2026-01-14",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00109",
    "noteDate": "2026-01-09",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00108",
    "noteDate": "2026-01-04",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00107",
    "noteDate": "2025-12-24",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00106",
    "noteDate": "2025-12-19",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00105",
    "noteDate": "2025-12-14",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00104",
    "noteDate": "2025-12-09",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00103",
    "noteDate": "2025-12-04",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00102",
    "noteDate": "2025-11-24",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00101",
    "noteDate": "2025-11-19",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 11500,
    "total": 13570,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00100",
    "noteDate": "2025-11-14",
    "party": "Kaveri Retail Chain",
    "reason": "Partial return / price adjustment",
    "taxable": 1250,
    "total": 1400,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00099",
    "noteDate": "2025-11-09",
    "party": "Delta Textiles LLP",
    "reason": "Partial return / price adjustment",
    "taxable": 4800,
    "total": 5664,
    "status": "Posted"
  },
  {
    "noteNo": "CN-00098",
    "noteDate": "2025-11-04",
    "party": "Sunrise Traders Pvt Ltd",
    "reason": "Partial return / price adjustment",
    "taxable": 15000,
    "total": 17700,
    "status": "Posted"
  }
];

  debitNotes: NoteRow[] = [
  {
    "noteNo": "DN-00147",
    "noteDate": "2026-08-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00146",
    "noteDate": "2026-08-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00145",
    "noteDate": "2026-08-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00144",
    "noteDate": "2026-08-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00143",
    "noteDate": "2026-08-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00142",
    "noteDate": "2026-07-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00141",
    "noteDate": "2026-07-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00140",
    "noteDate": "2026-07-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00139",
    "noteDate": "2026-07-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00138",
    "noteDate": "2026-07-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00137",
    "noteDate": "2026-06-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00136",
    "noteDate": "2026-06-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00135",
    "noteDate": "2026-06-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00134",
    "noteDate": "2026-06-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00133",
    "noteDate": "2026-06-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00132",
    "noteDate": "2026-05-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00131",
    "noteDate": "2026-05-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00130",
    "noteDate": "2026-05-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00129",
    "noteDate": "2026-05-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00128",
    "noteDate": "2026-05-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00127",
    "noteDate": "2026-04-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00126",
    "noteDate": "2026-04-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00125",
    "noteDate": "2026-04-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00124",
    "noteDate": "2026-04-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00123",
    "noteDate": "2026-04-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00122",
    "noteDate": "2026-03-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00121",
    "noteDate": "2026-03-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00120",
    "noteDate": "2026-03-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00119",
    "noteDate": "2026-03-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00118",
    "noteDate": "2026-03-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00117",
    "noteDate": "2026-02-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00116",
    "noteDate": "2026-02-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00115",
    "noteDate": "2026-02-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00114",
    "noteDate": "2026-02-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00113",
    "noteDate": "2026-02-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00112",
    "noteDate": "2026-01-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00111",
    "noteDate": "2026-01-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00110",
    "noteDate": "2026-01-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00109",
    "noteDate": "2026-01-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00108",
    "noteDate": "2026-01-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00107",
    "noteDate": "2025-12-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00106",
    "noteDate": "2025-12-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00105",
    "noteDate": "2025-12-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00104",
    "noteDate": "2025-12-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00103",
    "noteDate": "2025-12-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00102",
    "noteDate": "2025-11-25",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00101",
    "noteDate": "2025-11-20",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00100",
    "noteDate": "2025-11-15",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 950,
    "total": 1064,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00099",
    "noteDate": "2025-11-10",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 3200,
    "total": 3776,
    "status": "Posted"
  },
  {
    "noteNo": "DN-00098",
    "noteDate": "2025-11-05",
    "party": "Om Suppliers",
    "reason": "Damaged / short receipt adjustment",
    "taxable": 8500,
    "total": 10030,
    "status": "Posted"
  }
];

  get currentList(): NoteRow[] {
    return this.noteType === 'credit' ? this.creditNotes : this.debitNotes;
  }

  ngOnInit() {}
}
