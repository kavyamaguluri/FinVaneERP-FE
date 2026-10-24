import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

export interface BusinessEntity {
  id: number;
  tenantId: string;
  name: string;
  legalName?: string;
  sector?: string;
  businessType?: string;
  pan?: string;
  gstRegistered?: number | boolean;
  gstin?: string;
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
  logoUrl?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-entities',
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 fw-bold">Choose a Business</h3>
        <div class="subtitle text-muted small">Each business below has its own completely separate set of books &mdash; Chart of Accounts, Day Book, invoices, everything.</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-primary btn-sm" (click)="openAddModal()">+ Add Business</button>
      </div>
    </div>

    <!-- Alerts -->
    <div *ngIf="message" class="alert alert-success py-2 mb-3 d-flex justify-content-between align-items-center">
      <span>{{ message }}</span>
      <button type="button" class="btn-close btn-sm" (click)="message = ''"></button>
    </div>
    <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3 d-flex justify-content-between align-items-center">
      <span>{{ errorMessage }}</span>
      <button type="button" class="btn-close btn-sm" (click)="errorMessage = ''"></button>
    </div>

    <!-- Business Cards Grid matching Express picker.ejs exactly -->
    <div class="row g-3">
      <div *ngFor="let e of entities" class="col-md-4">
        <div class="card p-3 h-100 shadow-sm border" [class.border-primary]="currentTenantId === (e.tenantId || '' + e.id)">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h5 class="mb-1 fw-bold text-dark">{{ e.name }}</h5>
            <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="openEditModal(e)" title="Edit business details">&#9998;</button>
          </div>
          <div class="text-muted small mb-2">
            {{ e.sector || 'Sector not set' }} &middot; <span class="text-capitalize">{{ e.businessType || 'goods' }}</span>
          </div>
          <div *ngIf="e.gstin" class="small text-muted mb-2 font-monospace">
            GSTIN: <strong>{{ e.gstin }}</strong>
          </div>
          <div *ngIf="e.gstRegistered === 0" class="small text-secondary mb-2 fst-italic">
            (Not registered under GST)
          </div>

          <div class="mt-auto pt-2">
            <span *ngIf="currentTenantId === (e.tenantId || '' + e.id)" class="badge bg-primary-subtle text-primary-emphasis px-2 py-1">
              Currently viewing
            </span>
            <button *ngIf="currentTenantId !== (e.tenantId || '' + e.id)"
                    type="button"
                    class="btn btn-outline-primary btn-sm w-100"
                    (click)="switchBusiness(e)">
              Switch to this business
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="entities.length === 0 && !loading" class="col-12">
        <p class="text-muted">No businesses yet. <a href="javascript:void(0)" (click)="openAddModal()">Add one</a>.</p>
      </div>
    </div>

    <!-- Form Modal matching Express views/entities/form.ejs exactly -->
    <p-dialog [(visible)]="showFormModal"
              [modal]="true"
              [style]="{ width: '780px', maxWidth: '95vw' }"
              [header]="editing ? 'Edit Business' : 'Add a Business'"
              [closable]="true"
              (onHide)="onModalClose()">
      
      <div class="subtitle text-muted small mb-3">
        {{ editing ? 'Update this business\'s KYC details.' : 'Creates a brand new, completely separate set of books. Your existing login can access it right away.' }}
      </div>

      <div *ngIf="modalError" class="alert alert-danger py-2 mb-3">
        {{ modalError }}
      </div>

      <div class="row g-3">
        <!-- Business Name * -->
        <div class="col-md-6">
          <label class="form-label fw-semibold">Business Name <span class="text-danger">*</span></label>
          <input type="text"
                 class="form-control"
                 [(ngModel)]="currentForm.name"
                 [class.is-invalid]="submitted && !currentForm.name?.trim()"
                 placeholder="e.g. Acme Trading Co"
                 required />
          <div *ngIf="submitted && !currentForm.name?.trim()" class="invalid-feedback">Business name is required.</div>
        </div>

        <!-- Legal Name -->
        <div class="col-md-6">
          <label class="form-label">Legal Name</label>
          <input type="text"
                 class="form-control"
                 [(ngModel)]="currentForm.legalName"
                 placeholder="e.g. Acme Trading Co Pvt Ltd" />
        </div>

        <!-- Sector / Industry -->
        <div class="col-md-6">
          <label class="form-label">Sector / Industry</label>
          <select class="form-select" [(ngModel)]="currentForm.sector">
            <option value="">-- select --</option>
            <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
          </select>
        </div>

        <!-- What does this business deal in? * -->
        <div class="col-md-6">
          <label class="form-label fw-semibold">What does this business deal in? <span class="text-danger">*</span></label>
          <select class="form-select"
                  [(ngModel)]="currentForm.businessType"
                  [class.is-invalid]="submitted && !currentForm.businessType"
                  required>
            <option value="goods">Goods only (sells/stocks physical items)</option>
            <option value="services">Services only (no inventory to track)</option>
            <option value="both">Both goods and services</option>
          </select>
          <div class="form-text small">
            Choosing &quot;Services only&quot; automatically turns off Inventory tracking for this business (Dashboard, P&amp;L, Balance Sheet) -- you can change this later from Chart of Accounts.
          </div>
        </div>

        <!-- Constitution of Business -->
        <div class="col-md-6">
          <label class="form-label">Constitution of Business</label>
          <select class="form-select" [(ngModel)]="currentForm.constitution">
            <option value="">-- select --</option>
            <option *ngFor="let c of constitutions" [value]="c.value">{{ c.label }}</option>
          </select>
          <div class="form-text small">
            Determines the statutory financial statement format used under Statutory &gt; Financials -- Schedule III (Companies Act, 2013) with Notes to Accounts for a Company, or the standard format for everyone else.
          </div>
        </div>

        <!-- Financial Year Starts -->
        <div class="col-md-6">
          <label class="form-label">Financial Year Starts</label>
          <select class="form-select" [(ngModel)]="currentForm.fyStartMonth">
            <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
          </select>
        </div>

        <!-- PAN -->
        <div class="col-md-6">
          <label class="form-label">PAN</label>
          <input type="text"
                 class="form-control text-uppercase"
                 [(ngModel)]="currentForm.pan"
                 (input)="onPanInput()"
                 maxlength="10"
                 placeholder="e.g. AAAAA9999A" />
        </div>

        <!-- GST registration (NEW / REPLICATED FROM EXPRESS) -->
        <div class="col-md-6">
          <label class="form-label fw-semibold">GST registration</label>
          <select class="form-select" [(ngModel)]="currentForm.gstRegistered" (change)="onGstRegisteredChange()">
            <option [ngValue]="1">Registered under GST</option>
            <option [ngValue]="0">Not registered (no GST charged)</option>
          </select>
          <div class="form-text small">
            If not registered, invoices, quotations and orders carry no GST, and GST fields and reports are hidden.
          </div>
        </div>

        <!-- GSTIN * (shown only when registered under GST) -->
        <div class="col-md-6" *ngIf="currentForm.gstRegistered !== 0">
          <label class="form-label fw-semibold">GSTIN <span class="text-danger">*</span></label>
          <input type="text"
                 class="form-control text-uppercase"
                 [(ngModel)]="currentForm.gstin"
                 (input)="onGstinInput()"
                 maxlength="15"
                 [class.is-invalid]="submitted && currentForm.gstRegistered !== 0 && (!currentForm.gstin?.trim() || !isGstinValid(currentForm.gstin))"
                 placeholder="e.g. 27AAAAA9999A1Z5"
                 required />
          <div *ngIf="submitted && currentForm.gstRegistered !== 0 && !currentForm.gstin?.trim()" class="invalid-feedback">
            Enter the GSTIN, or choose "Not registered" if the business has no GST registration.
          </div>
          <div *ngIf="submitted && currentForm.gstRegistered !== 0 && currentForm.gstin?.trim() && !isGstinValid(currentForm.gstin)" class="invalid-feedback">
            This GSTIN is not valid. Please check all 15 characters.
          </div>
          <div class="form-text small">15 characters. First 2 digits auto-fill State Code.</div>
        </div>

        <!-- State Code -->
        <div class="col-md-6">
          <label class="form-label">State Code</label>
          <input type="text"
                 class="form-control"
                 [(ngModel)]="currentForm.stateCode"
                 placeholder="e.g. 27 (Maharashtra)" />
        </div>

        <!-- Country -->
        <div class="col-md-6">
          <label class="form-label">Country</label>
          <select class="form-select" [(ngModel)]="currentForm.country">
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Singapore">Singapore</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
          </select>
          <div class="form-text small">Drives how dates and numbers are displayed across the app.</div>
        </div>

        <!-- Address -->
        <div class="col-12">
          <label class="form-label">Address</label>
          <input type="text"
                 class="form-control"
                 [(ngModel)]="currentForm.address"
                 placeholder="Full postal address" />
        </div>

        <!-- Company Logo Section -->
        <div class="col-12">
          <hr class="my-1">
          <h6 class="mb-0 text-dark fw-bold">Company logo</h6>
        </div>
        <div class="col-12">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div style="width:150px;height:80px;border:2px dashed #adb5bd;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#f8f9fa;color:#6c757d;font-size:12px;text-align:center">
              <img *ngIf="logoPreview" [src]="logoPreview" alt="Logo" style="max-width:100%;max-height:100%" />
              <span *ngIf="!logoPreview">Your logo<br>appears here</span>
            </div>
            <div>
              <label class="btn btn-outline-primary btn-sm mb-1" for="logoUpload">Upload logo</label>
              <input type="file" id="logoUpload" accept="image/png,image/jpeg" class="d-none" (change)="onLogoSelected($event)" />
              <div class="form-text small">PNG or JPG, under 1 MB. Printed on invoices and quotations.</div>
              <button *ngIf="logoPreview" type="button" class="btn btn-link btn-sm text-danger p-0 text-decoration-none" (click)="removeLogo()">Remove current logo</button>
            </div>
          </div>
        </div>

        <!-- Bank account -->
        <div class="col-12">
          <hr class="my-1">
          <h6 class="mb-0 text-dark fw-bold">Bank account (printed on sales invoices)</h6>
          <div class="form-text small">Optional. Customers use this to pay you.</div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Bank name</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankName" placeholder="e.g. HDFC Bank" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Account holder name</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankAccountName" placeholder="e.g. Acme Trading Co Pvt Ltd" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Account number</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankAccountNo" placeholder="Account No" />
        </div>
        <div class="col-md-4">
          <label class="form-label">IFSC</label>
          <input type="text" class="form-control text-uppercase" [(ngModel)]="currentForm.bankIfsc" placeholder="e.g. HDFC0000123" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Branch</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.bankBranch" placeholder="Branch name" />
        </div>
        <div class="col-md-4">
          <label class="form-label">UPI ID</label>
          <input type="text" class="form-control" [(ngModel)]="currentForm.upiId" placeholder="e.g. acme@hdfcbank" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Date of Commencement</label>
          <input type="date" class="form-control" [(ngModel)]="currentForm.dateOfCommencement" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Date from Which Books Start</label>
          <input type="date" class="form-control" [(ngModel)]="currentForm.booksStartDate" />
          <div class="form-text small">No entry can be dated before this.</div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button type="button" class="btn btn-outline-secondary" (click)="showFormModal = false">Cancel</button>
        <button type="button" class="btn btn-primary" (click)="saveBusiness()">
          {{ editing ? 'Save Changes' : 'Create Business' }}
        </button>
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
  submitted = false;
  modalError = '';
  logoPreview: string | null = null;
  currentForm: Partial<BusinessEntity> = {};

  sectors = [
    'Manufacturing',
    'FMCG / Consumer Goods',
    'Pharma & Life Sciences',
    'Textiles & Apparel',
    'Auto Components',
    'Chemicals & Industrial Products',
    'Agro & Food Processing',
    'Agriculture',
    'Trading / Retail',
    'Wholesale / Distribution',
    'E-commerce',
    'IT & Software Services',
    'SaaS / Software Products',
    'Professional Services (Legal, Accounting, Consulting)',
    'Healthcare',
    'Education',
    'Construction & Real Estate',
    'Hospitality & Food Service',
    'Transportation & Logistics',
    'Financial Services',
    'Media & Entertainment',
    'Other'
  ];

  constitutions = [
    { value: 'private_limited', label: 'Private Limited Company' },
    { value: 'public_limited', label: 'Public Limited Company' },
    { value: 'opc', label: 'One Person Company (OPC)' },
    { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
    { value: 'partnership', label: 'Partnership Firm' },
    { value: 'proprietorship', label: 'Sole Proprietorship' },
    { value: 'huf', label: 'Hindu Undivided Family (HUF)' },
    { value: 'trust', label: 'Trust / Society' },
    { value: 'other', label: 'Other' }
  ];

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  stateMap: { [code: string]: string } = {
    '01': 'Jammu & Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu',
    '27': 'Maharashtra',
    '29': 'Karnataka',
    '30': 'Goa',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
    '38': 'Ladakh'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentTenantId = localStorage.getItem('finvane_active_tenant_id') || '1';
    this.loadEntities();

    // If navigated directly to /entities/new, open add modal immediately
    if (this.router.url.includes('/entities/new')) {
      this.openAddModal();
    }
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
    this.submitted = false;
    this.modalError = '';
    this.logoPreview = null;
    this.currentForm = {
      businessType: 'goods',
      country: 'India',
      fyStartMonth: 4,
      gstRegistered: 1,
      gstin: ''
    };
    this.showFormModal = true;
  }

  openEditModal(e: BusinessEntity) {
    this.editing = true;
    this.submitted = false;
    this.modalError = '';
    this.logoPreview = e.logoUrl || null;
    this.currentForm = {
      ...e,
      gstRegistered: e.gstRegistered !== undefined && e.gstRegistered !== null ? Number(e.gstRegistered) : (e.gstin ? 1 : 0)
    };
    this.showFormModal = true;
  }

  onModalClose() {
    this.submitted = false;
    this.modalError = '';
    if (this.router.url.includes('/entities/new')) {
      this.router.navigate(['/entities']);
    }
  }

  onGstRegisteredChange() {
    if (this.currentForm.gstRegistered === 0) {
      this.currentForm.gstin = '';
    }
  }

  onGstinInput() {
    if (!this.currentForm.gstin) return;
    const val = this.currentForm.gstin.trim().toUpperCase();
    this.currentForm.gstin = val;

    // Auto-detect State Code from first 2 digits
    if (val.length >= 2) {
      const stateCodeNum = val.slice(0, 2);
      const stateName = this.stateMap[stateCodeNum];
      if (stateName && !this.currentForm.stateCode) {
        this.currentForm.stateCode = `${stateCodeNum} (${stateName})`;
      }
    }

    // Auto-fill PAN from characters 3-12 of GSTIN
    if (val.length >= 12 && !this.currentForm.pan) {
      this.currentForm.pan = val.slice(2, 12);
    }
  }

  onPanInput() {
    if (this.currentForm.pan) {
      this.currentForm.pan = this.currentForm.pan.trim().toUpperCase();
    }
  }

  isGstinValid(gstin?: string): boolean {
    if (!gstin) return false;
    const clean = gstin.trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(clean);
  }

  onLogoSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      this.modalError = 'Logo must be under 1 MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.logoPreview = e.target.result;
      this.currentForm.logoUrl = this.logoPreview || undefined;
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.logoPreview = null;
    this.currentForm.logoUrl = undefined;
  }

  saveBusiness() {
    this.submitted = true;
    this.modalError = '';

    // Validation 1: Business Name *
    if (!this.currentForm.name || !this.currentForm.name.trim()) {
      this.modalError = 'Business name is required.';
      return;
    }

    // Validation 2: What does this business deal in? *
    if (!this.currentForm.businessType) {
      this.modalError = 'Please select what this business deals in.';
      return;
    }

    // Validation 3: GST registration & GSTIN *
    if (this.currentForm.gstRegistered !== 0) {
      if (!this.currentForm.gstin || !this.currentForm.gstin.trim()) {
        this.modalError = 'Enter the GSTIN, or choose "Not registered" if the business has no GST registration.';
        return;
      }
      if (!this.isGstinValid(this.currentForm.gstin)) {
        this.modalError = 'This GSTIN is not valid. Please check all 15 characters (e.g. 27AAAAA9999A1Z5).';
        return;
      }
    }

    const payload = {
      ...this.currentForm,
      name: this.currentForm.name.trim(),
      legalName: this.currentForm.legalName?.trim() || null,
      pan: this.currentForm.pan?.trim().toUpperCase() || null,
      gstRegistered: this.currentForm.gstRegistered === 0 ? false : true,
      gstin: this.currentForm.gstRegistered === 0 ? null : (this.currentForm.gstin?.trim().toUpperCase() || null)
    };

    if (this.editing && this.currentForm.id) {
      this.http.put<any>(`${environment.apiUrl}/entities/${this.currentForm.id}`, payload).subscribe({
        next: () => {
          this.showFormModal = false;
          this.message = 'Business details updated successfully.';
          this.loadEntities();
        },
        error: (err) => {
          this.modalError = err.error?.message || err.message || 'Failed to update business.';
        }
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/entities`, payload).subscribe({
        next: (res) => {
          this.showFormModal = false;
          this.message = 'Business created successfully.';
          this.loadEntities();
          if (this.router.url.includes('/entities/new')) {
            this.router.navigate(['/entities']);
          }
        },
        error: (err) => {
          this.modalError = err.error?.message || err.message || 'Failed to create business.';
        }
      });
    }
  }
}
