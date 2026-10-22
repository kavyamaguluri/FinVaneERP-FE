import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

export interface BusinessEntity {
  id: number;
  tenantId: string;
  name: string;
  legalName?: string;
  sector?: string;
  businessType?: string;
  gstin?: string;
  pan?: string;
  constitution?: string;
  address?: string;
  stateCode?: string;
  country?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankBranch?: string;
  upiId?: string;
  dateOfCommencement?: string;
  booksStartDate?: string;
  fyStartMonth?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-entities',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">Choose a Business</h3>
        <div class="subtitle">Each business below has its own completely separate set of books -- Chart of Accounts, Day Book, invoices, everything.</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-primary btn-sm" (click)="openAddModal()">+ Add Business</button>
      </div>
    </div>

    <!-- Feedback -->
    <div *ngIf="message" class="alert alert-success py-2 mb-3">{{ message }}</div>
    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">{{ errorMessage }}</div>

    <!-- Business Cards Grid matching Express picker.ejs exactly -->
    <div class="row g-3">
      <div *ngFor="let e of entities" class="col-md-4">
        <div class="card p-3 h-100" [ngClass]="currentTenantId === e.tenantId ? 'border-primary shadow-sm' : ''">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="mb-1 text-dark fw-bold">{{ e.name }}</h5>
            <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" title="Edit business details" (click)="openEditModal(e)">
              &#9998;
            </button>
          </div>
          <div class="text-muted small mb-2">
            {{ e.sector || 'Sector not set' }} &middot; <span class="text-capitalize">{{ e.businessType || 'goods' }}</span>
          </div>
          <div *ngIf="e.gstin" class="small text-muted mb-2">GSTIN: {{ e.gstin }}</div>
          <div class="mt-auto pt-2">
            <button type="button" class="btn btn-outline-primary btn-sm w-100" (click)="switchBusiness(e)">
              Switch to this business
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && entities.length === 0" class="col-12">
        <p class="text-muted">No businesses yet. <a href="javascript:void(0)" (click)="openAddModal()">Add one</a>.</p>
      </div>
    </div>

    <!-- Add / Edit Business Modal matching Express form.ejs exactly -->
    <p-dialog [(visible)]="showFormModal" [modal]="true" [header]="editing ? 'Edit Business' : 'Add a Business'" [style]="{width: '780px', maxWidth: '95vw'}" [closable]="true">
      <div class="subtitle text-muted mb-3">
        {{ editing ? "Update this business's KYC details." : "Creates a brand new, completely separate set of books. Your existing login can access it right away." }}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Business Name *</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.name" placeholder="e.g. Acme Trading Co" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Legal Name</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.legalName" placeholder="e.g. Acme Trading Co Pvt Ltd" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Sector / Industry</label>
          <select class="form-select" [(ngModel)]="currentForm.sector">
            <option value="">-- select --</option>
            <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">What does this business deal in? *</label>
          <select class="form-select" [(ngModel)]="currentForm.businessType">
            <option value="goods">Goods only (sells/stocks physical items)</option>
            <option value="services">Services only (no inventory to track)</option>
            <option value="both">Both goods and services</option>
          </select>
          <div class="form-text small">Choosing "Services only" automatically turns off Inventory tracking for this business.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Constitution of Business</label>
          <select class="form-select" [(ngModel)]="currentForm.constitution">
            <option value="">-- select --</option>
            <option *ngFor="let c of constitutions" [value]="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Financial Year Starts</label>
          <select class="form-select" [(ngModel)]="currentForm.fyStartMonth">
            <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">PAN</label>
          <input type="text" class="form-control text-uppercase" [(ngModel)]="currentForm.pan" placeholder="e.g. AAAAA9999A" />
        </div>
        <div class="col-md-6">
          <label class="form-label">GSTIN</label>
          <input type="text" class="form-control text-uppercase" [(ngModel)]="currentForm.gstin" placeholder="e.g. 27AAAAA9999A1Z5" />
        </div>
        <div class="col-md-6">
          <label class="form-label">State Code</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.stateCode" placeholder="e.g. 27 (Maharashtra)" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Country</label>
          <select class="form-select" [(ngModel)]="currentForm.country">
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Address</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.address" placeholder="Full postal address" />
        </div>
        <div class="col-12">
          <hr class="my-2">
          <h6 class="mb-2 text-dark">Bank account (printed on sales invoices)</h6>
        </div>
        <div class="col-md-6">
          <label class="form-label">Bank name</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankName" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Account holder name</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankAccountName" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Account number</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankAccountNo" />
        </div>
        <div class="col-md-4">
          <label class="form-label">IFSC</label>
          <input type="text" class="form-control text-uppercase" [(ngModel)]="currentForm.bankIfsc" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Branch</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankBranch" />
        </div>
        <div class="col-md-6">
          <label class="form-label">UPI ID</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.upiId" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Date of Commencement</label>
          <input type="date" class="form-control" [(ngModel)]="currentForm.dateOfCommencement" />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button type="button" class="btn btn-outline-secondary" (click)="showFormModal = false">Cancel</button>
        <button type="button" class="btn btn-primary" (click)="saveBusiness()">{{ editing ? 'Save Changes' : 'Create Business' }}</button>
      </ng-template>
    </p-dialog>
  `
})
export class EntitiesComponent implements OnInit {
  entities: BusinessEntity[] = [];
  currentTenantId: string = '1';
  loading = false;
  message = '';
  errorMessage = '';

  showFormModal = false;
  editing = false;
  currentForm: Partial<BusinessEntity> = {};

  sectors = [
    'Trading / Retail',
    'Professional Services (Legal, Accounting, Consulting)',
    'Manufacturing & Engineering',
    'Information Technology & Software',
    'Fast-Moving Consumer Goods (FMCG)',
    'Construction & Real Estate',
    'Chemicals & Petrochemicals',
    'Pharmaceuticals & Healthcare',
    'Power & Energy',
    'Textiles & Apparel',
    'Transportation & Logistics',
    'Other'
  ];

  constitutions = [
    { value: 'pvt_ltd', label: 'Private Limited Company' },
    { value: 'public_ltd', label: 'Public Limited Company' },
    { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
    { value: 'partnership', label: 'Partnership Firm' },
    { value: 'proprietorship', label: 'Sole Proprietorship' },
    { value: 'trust', label: 'Trust / Society / Non-Profit' },
    { value: 'other', label: 'Other' }
  ];

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.currentTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    this.loadEntities();
  }

  loadEntities() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/entities`).subscribe({
      next: (res) => {
        this.loading = false;
        this.entities = res.data || [];
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Error loading businesses';
      }
    });
  }

  switchBusiness(entity: BusinessEntity) {
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/entities/switch/${entity.id}`, {}).subscribe({
      next: () => {
        this.currentTenantId = entity.tenantId || String(entity.id);
        localStorage.setItem('finvane_active_tenant_id', this.currentTenantId);
        localStorage.setItem('finvane_active_entity_name', entity.name);
        window.location.href = '/dashboard';
      },
      error: () => {
        this.currentTenantId = entity.tenantId || String(entity.id);
        localStorage.setItem('finvane_active_tenant_id', this.currentTenantId);
        localStorage.setItem('finvane_active_entity_name', entity.name);
        window.location.href = '/dashboard';
      }
    });
  }

  openAddModal() {
    this.editing = false;
    this.currentForm = {
      businessType: 'goods',
      country: 'India',
      fyStartMonth: 4
    };
    this.showFormModal = true;
  }

  openEditModal(e: BusinessEntity) {
    this.editing = true;
    this.currentForm = { ...e };
    this.showFormModal = true;
  }

  saveBusiness() {
    if (!this.currentForm.name) {
      this.errorMessage = 'Business name is required.';
      return;
    }

    if (this.editing && this.currentForm.id) {
      this.http.put<any>(`${environment.apiUrl}/entities/${this.currentForm.id}`, this.currentForm).subscribe({
        next: () => {
          this.showFormModal = false;
          this.message = 'Business details updated successfully.';
          this.loadEntities();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update business.';
        }
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/entities`, this.currentForm).subscribe({
        next: () => {
          this.showFormModal = false;
          this.message = 'Business created successfully.';
          this.loadEntities();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to create business.';
        }
      });
    }
  }
}
