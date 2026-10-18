import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-module-placeholder',
  template: `
    <div class="p-card p-4">
      <div class="flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div class="text-xs uppercase font-semibold text-500 mb-1">{{ section }}</div>
          <h2 class="text-2xl font-bold text-900 m-0 flex align-items-center gap-2">
            <i [class]="icon" class="text-primary text-xl"></i>
            {{ title }}
          </h2>
          <p class="text-500 text-sm mt-1 mb-0">{{ description }}</p>
        </div>
        <button pButton label="+ New Entry" icon="pi pi-plus" class="p-button-primary p-button-sm"></button>
      </div>

      <div class="border-1 surface-border border-round p-5 text-center surface-50 my-4">
        <div class="inline-flex align-items-center justify-content-center bg-blue-50 border-circle w-4rem h-4rem mb-3">
          <i [class]="icon" class="text-2xl text-blue-600"></i>
        </div>
        <h3 class="text-lg font-semibold text-900 mb-1">{{ title }}</h3>
        <p class="text-500 text-sm max-w-28rem mx-auto mb-4">
          No records found for active entity. Create a new record or import data to get started.
        </p>
        <div class="flex justify-content-center gap-2">
          <button pButton label="Refresh Data" icon="pi pi-refresh" class="p-button-outlined p-button-sm"></button>
          <button pButton label="Create New Record" icon="pi pi-plus" class="p-button-primary p-button-sm"></button>
        </div>
      </div>
    </div>
  `
})
export class ModulePlaceholderComponent implements OnInit {
  title = 'Module';
  section = 'Operations';
  icon = 'pi pi-folder';
  description = 'Manage records and transactions';

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
