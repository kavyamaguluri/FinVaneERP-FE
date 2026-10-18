import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="layout-sidebar border-right-1 surface-border surface-card h-full overflow-y-auto"
         [class.layout-sidebar-inactive]="layoutService.state.staticMenuDesktopInactive"
         [class.layout-sidebar-mobile-active]="layoutService.state.staticMenuMobileActive">
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
      z-index: 999;
      background-color: var(--surface-card, #ffffff);
      transition: transform 0.25s cubic-bezier(0.05, 0.74, 0.2, 0.99);
    }

    .layout-sidebar.layout-sidebar-inactive {
      transform: translateX(-100%);
    }

    @media (max-width: 991px) {
      .layout-sidebar {
        transform: translateX(-100%);
      }
      .layout-sidebar.layout-sidebar-mobile-active {
        transform: translateX(0);
      }
    }
  `]
})
export class AppSidebarComponent {
  constructor(public layoutService: LayoutService) {}
}
