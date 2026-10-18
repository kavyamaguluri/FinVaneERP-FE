import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="layout-sidebar border-right-1 surface-border surface-card h-full overflow-y-auto">
      <app-menu></app-menu>
    </div>
  `,
  styles: [`
    .layout-sidebar {
      width: 260px;
      position: fixed;
      top: 4rem;
      left: 0;
      bottom: 0;
      z-index: 4;
      transition: transform 0.2s;
    }
  `]
})
export class AppSidebarComponent {}
