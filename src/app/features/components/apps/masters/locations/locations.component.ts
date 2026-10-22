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
  address: string;
  isActive: boolean;
}

@Component({
  selector: 'app-locations',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Locations</h3>
        <div class="subtitle text-muted small">Warehouses, branches &amp; offices</div>
      </div>
      <div class="io-toolbar d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary">Download Template</button>
        <button type="button" class="btn btn-sm btn-outline-secondary">Export Excel</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="openNewLocation()">+ New Location</button>
      </div>
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
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of locations">
              <td class="fw-semibold text-secondary">{{ l.code }}</td>
              <td class="fw-medium text-dark">{{ l.name }}</td>
              <td class="text-capitalize">{{ l.locationType }}</td>
              <td>{{ l.stateCode }}</td>
              <td><code>{{ l.gstin || '—' }}</code></td>
              <td>
                <span class="badge" [ngClass]="l.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                  {{ l.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-secondary me-1">
                  {{ l.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger">Delete</button>
              </td>
            </tr>
            <tr *ngIf="locations.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No locations found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LocationsComponent implements OnInit {
  locations: LocationItem[] = [
    { id: 1, code: 'LOC-01', name: 'Main Warehouse', locationType: 'Warehouse', stateCode: 'Haryana (06)', gstin: '06AAAAA0000A1Z5', address: 'Sector 18, Gurugram, Haryana', isActive: true },
    { id: 2, code: 'LOC-02', name: 'Retail Store South', locationType: 'Retail Store', stateCode: 'Delhi (07)', gstin: '07AAAAA0000A1Z6', address: 'South Extension Part II, New Delhi', isActive: true },
    { id: 3, code: 'LOC-03', name: 'North Hub', locationType: 'Warehouse', stateCode: 'Punjab (03)', gstin: '03AAAAA0000A1Z7', address: 'Focal Point Phase 5, Ludhiana, Punjab', isActive: true },
    { id: 4, code: 'LOC-04', name: 'Regional Depot West', locationType: 'Warehouse', stateCode: 'Maharashtra (27)', gstin: '27AAAAA0000A1Z8', address: 'MIDC Industrial Area, Pune, Maharashtra', isActive: true }
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
            locationType: (l.city || 'Warehouse'),
            stateCode: (l.state || 'Haryana') + ' (' + (l.pincode ? l.pincode.substring(0, 2) : '06') + ')',
            gstin: l.gstin || '06AAAAA0000A1Z5',
            address: l.address || '',
            isActive: l.isActive !== false
          }));
        }
      },
      error: () => {}
    });
  }

  openNewLocation() {
    alert('Create Location Modal');
  }
}
