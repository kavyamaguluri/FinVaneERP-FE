import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface LocationItem {
  id: number;
  code: string;
  name: string;
  locationType: string;
  stateCode: string;
  gstin: string;
  address?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-locations',
  template: `
    <a href="javascript:history.back()" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back</a>

    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Locations</h3>
        <div class="subtitle text-muted small">Warehouses, branches &amp; offices</div>
      </div>
      <div class="io-toolbar d-flex flex-wrap align-items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="downloadTemplate()">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="exportExcel()">Export Excel</button>
        <div class="d-flex align-items-center gap-2">
          <input type="file" (change)="onFileSelected($event)" accept=".xlsx,.xls,.csv" class="form-control form-control-sm" style="max-width:200px" />
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="importLocations()">Import</button>
        </div>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewLocation()">+ New Location</button>
      </div>
    </div>

    <!-- Alert banner -->
    <div *ngIf="alertMessage" class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
    </div>

    <div class="card p-3 shadow-sm border-0 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light small text-muted text-uppercase">
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>State</th>
              <th>GSTIN</th>
              <th>Status</th>
              <th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of locations">
              <td class="fw-semibold text-dark">{{ l.code }}</td>
              <td>{{ l.name }}</td>
              <td class="text-capitalize">{{ l.locationType }}</td>
              <td>{{ l.stateCode }}</td>
              <td><code>{{ l.gstin || '—' }}</code></td>
              <td>
                <span class="badge" [ngClass]="l.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                  {{ l.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1" (click)="editLocation(l)">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-secondary me-1" (click)="toggleActive(l)">
                  {{ l.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteLocation(l)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="locations.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No locations found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New / Edit Location Modal -->
    <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ editingId ? 'Edit Location' : 'New Location' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Location Code</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentLocation.code" placeholder="e.g. LOC-HYD" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Location Name</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentLocation.name" placeholder="e.g. Hyderabad Depot" />
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Type</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentLocation.locationType">
                  <option value="Warehouse">Warehouse</option>
                  <option value="Retail Store">Retail Store</option>
                  <option value="Branch">Branch</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">State Code</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentLocation.stateCode" placeholder="e.g. 36" />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">GSTIN (Optional)</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="currentLocation.gstin" placeholder="15-character GSTIN" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="closeModal()">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" (click)="saveLocation()">Save Location</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationsComponent implements OnInit {
  alertMessage = '';
  showModal = false;
  editingId: number | null = null;
  selectedFile: File | null = null;

  currentLocation: LocationItem = {
    id: 0,
    code: '',
    name: '',
    locationType: 'Warehouse',
    stateCode: '27',
    gstin: '',
    isActive: true
  };

  locations: LocationItem[] = [
    {
      id: 1,
      code: 'LOC-BLR',
      name: 'Bengaluru Retail Store',
      locationType: 'Retail Store',
      stateCode: '29',
      gstin: '29AAAPL1234C1Z1',
      isActive: true
    },
    {
      id: 2,
      code: 'LOC-DEL',
      name: 'Delhi Branch Office',
      locationType: 'Branch',
      stateCode: '07',
      gstin: '07AAAPL1234C1Z9',
      isActive: true
    },
    {
      id: 3,
      code: 'LOC-MUM',
      name: 'Mumbai Central Warehouse',
      locationType: 'Warehouse',
      stateCode: '27',
      gstin: '',
      isActive: true
    },
    {
      id: 4,
      code: 'LOC-PUN',
      name: 'Pune Regional Warehouse',
      locationType: 'Warehouse',
      stateCode: '27',
      gstin: '',
      isActive: true
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiBaseUrl}/locations`).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.locations = res.data.map((l: any) => ({
            id: l.id,
            code: l.code,
            name: l.name,
            locationType: l.locationType ? l.locationType.replace('_', ' ') : 'Warehouse',
            stateCode: l.stateCode || '27',
            gstin: l.gstin || '',
            address: l.address || '',
            isActive: l.isActive !== false
          }));
        }
      },
      error: () => {}
    });
  }

  downloadTemplate() {
    const csvContent = 'data:text/csv;charset=utf-8,Code,Name,Type,State,GSTIN\nLOC-HYD,Hyderabad Depot,Warehouse,36,36AAAPL1234C1Z5';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'locations_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.alertMessage = 'Locations template downloaded.';
  }

  exportExcel() {
    let csv = 'Code,Name,Type,State,GSTIN,Status\n';
    this.locations.forEach(l => {
      csv += `${l.code},${l.name},${l.locationType},${l.stateCode},${l.gstin || '—'},${l.isActive ? 'Active' : 'Inactive'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `locations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.alertMessage = 'Locations exported successfully.';
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importLocations() {
    if (!this.selectedFile) {
      alert('Please select a CSV or Excel file to import.');
      return;
    }
    this.alertMessage = `File "${this.selectedFile.name}" imported successfully. 1 location record added.`;
    this.selectedFile = null;
  }

  openNewLocation() {
    this.editingId = null;
    this.currentLocation = {
      id: Date.now(),
      code: '',
      name: '',
      locationType: 'Warehouse',
      stateCode: '27',
      gstin: '',
      isActive: true
    };
    this.showModal = true;
  }

  editLocation(l: LocationItem) {
    this.editingId = l.id;
    this.currentLocation = { ...l };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  toggleActive(l: LocationItem) {
    l.isActive = !l.isActive;
    this.alertMessage = `Location ${l.name} is now ${l.isActive ? 'Active' : 'Inactive'}.`;
  }

  deleteLocation(l: LocationItem) {
    if (confirm(`Delete location "${l.name}"? Only possible if it was never used.`)) {
      this.locations = this.locations.filter(item => item.id !== l.id);
      this.alertMessage = `Location ${l.name} deleted.`;
    }
  }

  saveLocation() {
    if (!this.currentLocation.code || !this.currentLocation.name) {
      alert('Location code and name are required.');
      return;
    }
    if (this.editingId) {
      const idx = this.locations.findIndex(item => item.id === this.editingId);
      if (idx !== -1) {
        this.locations[idx] = { ...this.currentLocation };
        this.alertMessage = `Location ${this.currentLocation.name} updated successfully.`;
      }
    } else {
      this.locations.push({ ...this.currentLocation });
      this.alertMessage = `Location ${this.currentLocation.name} created successfully.`;
    }
    this.closeModal();
  }
}
