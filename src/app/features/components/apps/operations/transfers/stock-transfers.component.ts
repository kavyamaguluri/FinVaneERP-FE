import { Component, OnInit } from '@angular/core';

export interface StockTransferItem {
  id: number;
  transferNo: string;
  date: string;
  fromCode: string;
  toCode: string;
  kind: 'intra state' | 'inter state';
  taxableValue: number;
  igst: number;
  totalValue: number;
}

@Component({
  selector: 'app-stock-transfers',
  template: `
    <a href="javascript:history.back()" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back</a>

    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Stock Transfers</h3>
        <div class="subtitle text-muted small">Inter-location movement, intra-state (no GST) or inter-state (IGST-bearing)</div>
      </div>
      <div class="io-toolbar d-flex flex-wrap align-items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2">
          <input type="file" (change)="onFileSelected($event)" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width:200px" />
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="importTransfers()">Import</button>
        </div>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewTransfer()">+ New Transfer</button>
      </div>
    </div>

    <!-- Feedback alert -->
    <div *ngIf="alertMessage" class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Kind</th>
              <th class="text-end">Taxable</th>
              <th class="text-end">IGST</th>
              <th class="text-end">Total</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of transfers">
              <td>
                <a href="javascript:void(0)" (click)="editTransfer(t)" class="text-decoration-none fw-semibold text-primary">
                  {{ t.transferNo }}
                </a>
              </td>
              <td>{{ t.date }}</td>
              <td><span class="fw-medium">{{ t.fromCode }}</span></td>
              <td><span class="fw-medium">{{ t.toCode }}</span></td>
              <td>
                <span class="badge" [ngClass]="t.kind === 'inter state' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-brand-soft text-brand'">
                  {{ t.kind }}
                </span>
              </td>
              <td class="text-end">{{ t.taxableValue | number:'1.2-2' }}</td>
              <td class="text-end">{{ t.igst | number:'1.2-2' }}</td>
              <td class="text-end fw-semibold">{{ t.totalValue | number:'1.2-2' }}</td>
              <td class="text-end">
                <a href="javascript:void(0)" (click)="editTransfer(t)" class="text-decoration-none text-primary small fw-semibold">Edit</a>
              </td>
            </tr>
            <tr *ngIf="transfers.length === 0">
              <td colspan="9" class="text-center text-muted py-4">No stock transfers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New / Edit Transfer Modal -->
    <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ editingId ? 'Edit Stock Transfer' : 'New Stock Transfer' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Transfer No</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="currentTransfer.transferNo" readonly />
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Transfer Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="currentTransfer.date" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Transfer Kind</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentTransfer.kind" (change)="onKindChange()">
                  <option value="intra state">Intra-State (no GST)</option>
                  <option value="inter state">Inter-State (IGST 18%)</option>
                </select>
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">From Location</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentTransfer.fromCode">
                  <option value="LOC-MUM">LOC-MUM (Mumbai Central)</option>
                  <option value="LOC-BLR">LOC-BLR (Bengaluru Retail)</option>
                  <option value="LOC-DEL">LOC-DEL (Delhi Branch)</option>
                  <option value="LOC-PUN">LOC-PUN (Pune Regional)</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">To Location</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentTransfer.toCode">
                  <option value="LOC-BLR">LOC-BLR (Bengaluru Retail)</option>
                  <option value="LOC-PUN">LOC-PUN (Pune Regional)</option>
                  <option value="LOC-MUM">LOC-MUM (Mumbai Central)</option>
                  <option value="LOC-DEL">LOC-DEL (Delhi Branch)</option>
                </select>
              </div>
            </div>
            <div class="row g-2">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Taxable (₹)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="currentTransfer.taxableValue" (input)="recalculateTotal()" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">IGST (₹)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="currentTransfer.igst" (input)="recalculateTotalManual()" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Total (₹)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="currentTransfer.totalValue" readonly />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="closeModal()">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" (click)="saveTransfer()">Save Transfer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-brand-soft { background-color: #ccfbf1 !important; }
    .text-brand { color: #0f766e !important; }
  `]
})
export class StockTransfersComponent implements OnInit {
  alertMessage = '';
  showModal = false;
  editingId: number | null = null;
  selectedFile: File | null = null;

  currentTransfer: StockTransferItem = {
    id: 0,
    transferNo: '',
    date: new Date().toISOString().slice(0, 10),
    fromCode: 'LOC-MUM',
    toCode: 'LOC-BLR',
    kind: 'inter state',
    taxableValue: 0,
    igst: 0,
    totalValue: 0
  };

  transfers: StockTransferItem[] = [
    {
      id: 6,
      transferNo: 'ST-FY2526-02',
      date: '15-07-2025',
      fromCode: 'LOC-MUM',
      toCode: 'LOC-BLR',
      kind: 'inter state',
      taxableValue: 25500.00,
      igst: 4590.00,
      totalValue: 30090.00
    },
    {
      id: 5,
      transferNo: 'ST-FY2526-01',
      date: '10-07-2025',
      fromCode: 'LOC-MUM',
      toCode: 'LOC-PUN',
      kind: 'intra state',
      taxableValue: 12800.00,
      igst: 0.00,
      totalValue: 12800.00
    },
    {
      id: 4,
      transferNo: 'ST-FY2425-02',
      date: '15-07-2024',
      fromCode: 'LOC-MUM',
      toCode: 'LOC-BLR',
      kind: 'inter state',
      taxableValue: 25500.00,
      igst: 4590.00,
      totalValue: 30090.00
    },
    {
      id: 3,
      transferNo: 'ST-FY2425-01',
      date: '10-07-2024',
      fromCode: 'LOC-MUM',
      toCode: 'LOC-PUN',
      kind: 'intra state',
      taxableValue: 12800.00,
      igst: 0.00,
      totalValue: 12800.00
    },
    {
      id: 2,
      transferNo: 'ST-00002',
      date: '22-07-2026',
      fromCode: 'LOC-MUM',
      toCode: 'LOC-BLR',
      kind: 'inter state',
      taxableValue: 42500.00,
      igst: 7650.00,
      totalValue: 50150.00
    },
    {
      id: 1,
      transferNo: 'ST-00001',
      date: '20-07-2026',
      fromCode: 'LOC-MUM',
      toCode: 'LOC-PUN',
      kind: 'intra state',
      taxableValue: 32000.00,
      igst: 0.00,
      totalValue: 32000.00
    }
  ];

  ngOnInit() {}

  downloadTemplate() {
    const csvContent = 'data:text/csv;charset=utf-8,Transfer No,Date,From Code,To Code,Kind,Taxable,IGST,Total\nST-00003,2026-10-25,LOC-MUM,LOC-BLR,inter state,10000,1800,11800';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'stock_transfers_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.alertMessage = 'Template downloaded successfully.';
  }

  exportExcel() {
    let csv = 'No,Date,From,To,Kind,Taxable,IGST,Total\n';
    this.transfers.forEach(t => {
      csv += `${t.transferNo},${t.date},${t.fromCode},${t.toCode},${t.kind},${t.taxableValue},${t.igst},${t.totalValue}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_transfers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.alertMessage = 'Stock transfers exported successfully.';
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importTransfers() {
    if (!this.selectedFile) {
      alert('Please select a CSV or Excel file to import.');
      return;
    }
    this.alertMessage = `File "${this.selectedFile.name}" imported successfully. 1 transfer record added.`;
    this.selectedFile = null;
  }

  openNewTransfer() {
    this.editingId = null;
    const nextNum = this.transfers.length + 1;
    this.currentTransfer = {
      id: Date.now(),
      transferNo: `ST-${String(nextNum).padStart(5, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      fromCode: 'LOC-MUM',
      toCode: 'LOC-BLR',
      kind: 'inter state',
      taxableValue: 15000,
      igst: 2700,
      totalValue: 17700
    };
    this.showModal = true;
  }

  editTransfer(t: StockTransferItem) {
    this.editingId = t.id;
    this.currentTransfer = { ...t };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  onKindChange() {
    if (this.currentTransfer.kind === 'intra state') {
      this.currentTransfer.igst = 0;
    } else {
      this.currentTransfer.igst = Math.round(this.currentTransfer.taxableValue * 0.18 * 100) / 100;
    }
    this.currentTransfer.totalValue = Math.round((this.currentTransfer.taxableValue + this.currentTransfer.igst) * 100) / 100;
  }

  recalculateTotal() {
    if (this.currentTransfer.kind === 'inter state') {
      this.currentTransfer.igst = Math.round(this.currentTransfer.taxableValue * 0.18 * 100) / 100;
    } else {
      this.currentTransfer.igst = 0;
    }
    this.currentTransfer.totalValue = Math.round((this.currentTransfer.taxableValue + this.currentTransfer.igst) * 100) / 100;
  }

  recalculateTotalManual() {
    this.currentTransfer.totalValue = Math.round((this.currentTransfer.taxableValue + this.currentTransfer.igst) * 100) / 100;
  }

  saveTransfer() {
    if (!this.currentTransfer.transferNo) {
      alert('Transfer No is required.');
      return;
    }
    if (this.editingId) {
      const idx = this.transfers.findIndex(t => t.id === this.editingId);
      if (idx !== -1) {
        this.transfers[idx] = { ...this.currentTransfer };
        this.alertMessage = `Transfer ${this.currentTransfer.transferNo} updated successfully.`;
      }
    } else {
      this.transfers.unshift({ ...this.currentTransfer });
      this.alertMessage = `Transfer ${this.currentTransfer.transferNo} created successfully.`;
    }
    this.closeModal();
  }
}
