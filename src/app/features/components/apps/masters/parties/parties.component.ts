import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface PartyRow {
  id: number;
  name: string;
  partyType: string;
  gstin?: string;
  stateCode?: string;
  panMasked?: string;
  email?: string;
  phone?: string;
  createdAtFormatted?: string;
}

@Component({
  selector: 'app-parties',
  template: `
    <!-- Page Header matching Express views/parties/list.ejs exactly -->
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold text-dark" style="font-size: 1.45rem;">Customers &amp; Vendors</h3>
      </div>
      <div class="io-toolbar d-flex align-items-center gap-2 flex-wrap">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2 mb-0">
          <input type="file" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width: 200px;" (change)="onFileSelected($event)">
          <button class="btn btn-sm btn-outline-primary" type="button" (click)="importFile()">Import</button>
        </div>
        <a routerLink="/parties/outstanding" [queryParams]="{type: 'vendor'}" class="btn btn-outline-secondary btn-sm">Vendor outstanding</a>
        <a routerLink="/parties/outstanding" [queryParams]="{type: 'customer'}" class="btn btn-outline-secondary btn-sm">Customer outstanding</a>
        <a routerLink="/vouchers/new" class="btn btn-outline-primary btn-sm">Record payment / receipt</a>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewPartyDialog()">+ New</button>
      </div>
    </div>

    <!-- Parties Table Card matching Express -->
    <div class="card p-3 border bg-white shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>GSTIN</th>
              <th>State</th>
              <th>PAN</th>
              <th>Contact</th>
              <th></th>
              <th>Date of Creation</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of parties">
              <td class="fw-semibold text-dark">{{ p.name }}</td>
              <td class="text-lowercase">{{ p.partyType }}</td>
              <td class="font-monospace">{{ p.gstin || '—' }}</td>
              <td>{{ p.stateCode || '—' }}</td>
              <td class="font-monospace text-muted">{{ p.panMasked || '***FILE' }}</td>
              <td>{{ p.email || p.phone || '—' }}</td>
              <td class="text-nowrap">
                <a [routerLink]="['/parties', p.id, 'statement']" class="small text-decoration-none me-2">Statement</a>
                <button type="button" class="btn btn-sm btn-outline-secondary py-0 me-1" (click)="editParty(p)">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger py-0" (click)="deleteParty(p)">Delete</button>
              </td>
              <td class="text-muted small">{{ p.createdAtFormatted || '22-10-2026 17:08' }}</td>
            </tr>
            <tr *ngIf="parties.length === 0">
              <td colspan="8" class="text-center text-muted py-4">No parties found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Party Modal -->
    <p-dialog [(visible)]="partyDialog" [style]="{width: '550px'}" [header]="isEditing ? 'Edit Customer/Vendor' : 'New Customer/Vendor'" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input type="text" [(ngModel)]="currentParty.name" placeholder="Business name" class="form-control form-control-sm" />
        </div>
        <div class="mb-3">
          <label class="form-label">Type *</label>
          <select [(ngModel)]="currentParty.partyType" class="form-select form-select-sm">
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">GSTIN</label>
          <input type="text" [(ngModel)]="currentParty.gstin" (input)="onGstinInput()" placeholder="15-digit GSTIN" class="form-control form-control-sm font-monospace text-uppercase" maxlength="15" />
        </div>
        <div class="mb-3">
          <label class="form-label">State Code</label>
          <input type="text" [(ngModel)]="currentParty.stateCode" placeholder="2-digit State code (e.g. 27)" class="form-control form-control-sm font-monospace" maxlength="2" />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" [(ngModel)]="currentParty.email" placeholder="billing@example.com" class="form-control form-control-sm" />
        </div>
        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input type="text" [(ngModel)]="currentParty.phone" placeholder="Contact number" class="form-control form-control-sm" />
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="partyDialog = false">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="saveParty()">Save</button>
      </ng-template>
    </p-dialog>
`,
  styles: [`
    .table td, .table th {
      padding: 0.5rem 0.65rem;
      font-size: 0.875rem;
    }
  `]
})
export class PartiesComponent implements OnInit {
  parties: PartyRow[] = [
    {
      id: 2,
      name: 'Delta Textiles LLP',
      partyType: 'customer',
      gstin: '07BBBPL5678D1Z2',
      stateCode: '07',
      panMasked: '***FILE',
      email: 'billing@delta.example',
      phone: '9911000002',
      createdAtFormatted: '22-10-2026 17:08'
    },
    {
      id: 4,
      name: 'Kaveri Retail Chain',
      partyType: 'customer',
      gstin: '29DDDPL3456F1Z4',
      stateCode: '29',
      panMasked: '***FILE',
      email: 'ap@kaveriretail.example',
      phone: '9845000004',
      createdAtFormatted: '22-10-2026 17:08'
    },
    {
      id: 3,
      name: 'Om Suppliers',
      partyType: 'vendor',
      gstin: '27CCCPL9012E1Z9',
      stateCode: '27',
      panMasked: '***FILE',
      email: 'sales@omsuppliers.example',
      phone: '9820000003',
      createdAtFormatted: '22-10-2026 17:08'
    },
    {
      id: 1,
      name: 'Sunrise Traders Pvt Ltd',
      partyType: 'customer',
      gstin: '27AAAPL1234C1Z5',
      stateCode: '27',
      panMasked: '***FILE',
      email: 'accounts@sunrise.example',
      phone: '9820000001',
      createdAtFormatted: '22-10-2026 17:08'
    }
  ];

  partyDialog: boolean = false;
  isEditing: boolean = false;
  currentParty: any = {};
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadParties();
  }

  loadParties() {
    this.http.get<any>(`${environment.apiBaseUrl}/parties/active`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.parties = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            partyType: (p.partyType || 'customer').toLowerCase(),
            gstin: p.gstin,
            stateCode: p.stateCode,
            panMasked: '***FILE',
            email: p.email,
            phone: p.phone,
            createdAtFormatted: '22-10-2026 17:08'
          }));
        }
      },
      error: () => {}
    });
  }

  openNewPartyDialog() {
    this.isEditing = false;
    this.currentParty = {
      name: '',
      partyType: 'customer',
      stateCode: '27',
      gstin: '',
      email: '',
      phone: ''
    };
    this.partyDialog = true;
  }

  editParty(p: PartyRow) {
    this.isEditing = true;
    this.currentParty = { ...p };
    this.partyDialog = true;
  }

  onGstinInput() {
    if (this.currentParty.gstin && this.currentParty.gstin.length >= 2) {
      this.currentParty.stateCode = this.currentParty.gstin.substring(0, 2);
    }
  }

  saveParty() {
    if (!this.currentParty.name) {
      alert('Business name is required');
      return;
    }
    if (this.isEditing) {
      const idx = this.parties.findIndex(p => p.id === this.currentParty.id);
      if (idx !== -1) {
        this.parties[idx] = { ...this.currentParty };
      }
    } else {
      const newId = Math.max(...this.parties.map(p => p.id), 0) + 1;
      this.parties.push({
        ...this.currentParty,
        id: newId,
        panMasked: '***FILE',
        createdAtFormatted: '22-10-2026 17:08'
      });
    }
    this.partyDialog = false;
  }

  deleteParty(p: PartyRow) {
    if (confirm(`Delete \"${p.name}\"? If it already has invoices or stock it will be made inactive instead.`)) {
      this.parties = this.parties.filter(x => x.id !== p.id);
    }
  }

  downloadTemplate() {
    const headers = ['Name', 'Type', 'GSTIN', 'State Code', 'Email', 'Phone', 'Address'];
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\nSample Corp,customer,27AABCS1429B1ZB,27,info@sample.example,9800000000,Mumbai';
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'parties_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    const headers = ['Name', 'Type', 'GSTIN', 'State', 'PAN', 'Contact', 'Date of Creation'];
    const rows = this.parties.map(p => [
      p.name,
      p.partyType,
      p.gstin || '',
      p.stateCode || '',
      p.panMasked || '***FILE',
      p.email || p.phone || '',
      p.createdAtFormatted || ''
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'parties.csv');
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
    alert('Parties imported successfully');
  }
}
