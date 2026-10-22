import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-module-placeholder',
  template: `
    <div class="page-header">
      <div>
        <h3 class="mb-0">{{ title }}</h3>
        <div class="subtitle">{{ description }}</div>
      </div>
      <div class="io-toolbar">
        <button type="button" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-download me-1"></i>Download Template
        </button>
        <button type="button" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-upload me-1"></i>Import
        </button>
        <button type="button" class="btn btn-sm btn-primary">
          <i class="bi bi-plus-lg me-1"></i>+ New Entry
        </button>
      </div>
    </div>

    <div class="card p-4">
      <div class="d-flex flex-column align-items-center justify-content-center text-center py-5">
        <div class="d-inline-flex align-items-center justify-content-center bg-brand-soft rounded-circle mb-3" style="width: 4rem; height: 4rem; border: 1px solid var(--brand-100);">
          <i [class]="icon" class="text-brand fs-2"></i>
        </div>
        <h5 class="fw-bold mb-1 text-dark">{{ title }}</h5>
        <p class="text-muted small max-w-28rem mx-auto mb-4" style="max-width: 480px;">
          No active records found for the current period and entity. Click "+ New Entry" above or import in bulk using the standard CSV template.
        </p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-clockwise me-1"></i>Refresh Data
          </button>
          <button type="button" class="btn btn-sm btn-primary">
            <i class="bi bi-plus-circle me-1"></i>Create New Record
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModulePlaceholderComponent implements OnInit {
  title = 'Module';
  section = 'Operations';
  icon = 'bi bi-folder2-open';
  description = 'Manage business operations and accounting records';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) this.title = data['title'];
      if (data['section']) this.section = data['section'];
      if (data['icon']) this.icon = data['icon'];
      if (data['description']) this.description = data['description'];
    });
  }
}
