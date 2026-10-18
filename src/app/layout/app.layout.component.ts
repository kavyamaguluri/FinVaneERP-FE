import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="layout-wrapper min-h-screen flex flex-column">
      <app-topbar></app-topbar>
      <div class="layout-main-content flex flex-1">
        <app-sidebar></app-sidebar>
        
        <!-- Mobile Overlay to close sidebar on click outside -->
        <div *ngIf="layoutService.state.staticMenuMobileActive" 
             class="layout-mask fixed top-0 left-0 w-full h-full z-4"
             style="background: rgba(0,0,0,0.3);"
             (click)="layoutService.state.staticMenuMobileActive = false">
        </div>

        <div class="layout-main flex-1 p-4" 
             [style.margin-left]="getMainMargin()">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-main {
      transition: margin-left 0.25s cubic-bezier(0.05, 0.74, 0.2, 0.99);
      min-height: calc(100vh - 4rem);
    }
  `]
})
export class AppLayoutComponent {
  constructor(public layoutService: LayoutService) {}

  getMainMargin(): string {
    if (!this.layoutService.isDesktop()) {
      return '0';
    }
    return this.layoutService.state.staticMenuDesktopInactive ? '0' : '260px';
  }
}
