import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="layout-wrapper min-h-screen flex flex-column">
      <app-topbar></app-topbar>
      <div class="layout-main-content flex flex-1">
        <app-sidebar></app-sidebar>
        <div class="layout-main flex-1 p-4" [style.margin-left]="layoutService.state.staticMenuDesktopInactive ? '0' : '260px'">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-main {
      transition: margin-left 0.2s;
      min-height: calc(100vh - 4rem);
    }
  `]
})
export class AppLayoutComponent {
  constructor(public layoutService: LayoutService) {}
}
