import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
  selector: 'app-layout',
  template: `
    <div class="layout-wrapper min-h-screen d-flex flex-column" style="background-color: var(--bg);">
      <app-topbar></app-topbar>
      <div class="container-fluid py-4 px-4 flex-grow-1">
        <button *ngIf="showBackButton"
                type="button"
                id="global-back-btn"
                class="btn btn-sm btn-outline-secondary mb-3"
                title="Go back to the previous page"
                (click)="onBack()">
          &larr; Back
        </button>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    #global-back-btn {
      font-weight: 500;
      transition: all 0.15s ease;
    }
    #global-back-btn:hover {
      background: var(--ink-100);
      color: var(--ink-900);
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  private readonly STORAGE_KEY = 'finvane_nav_stack';
  showBackButton: boolean = false;

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    this.updateStack(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateStack(event.urlAfterRedirects);
      });
  }

  private updateStack(url: string) {
    // Show back button on all subpages (not on the root dashboard)
    const cleanPath = url.split('?')[0];
    this.showBackButton = cleanPath !== '/' && cleanPath !== '/dashboard';

    let stack: string[] = [];
    try {
      stack = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      stack = [];
    }

    if (stack[stack.length - 1] !== url) {
      stack.push(url);
      if (stack.length > 50) stack = stack.slice(-50);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(stack));
    }
  }

  onBack() {
    let stack: string[] = [];
    try {
      stack = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      stack = [];
    }

    const currentPath = this.router.url.split('?')[0];
    let target: string | null = null;
    let cutIndex = -1;

    for (let i = stack.length - 2; i >= 0; i--) {
      const entryPath = stack[i].split('?')[0];
      if (entryPath !== currentPath && !/\/(edit|new)$/.test(entryPath)) {
        target = stack[i];
        cutIndex = i;
        break;
      }
    }

    if (target) {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(stack.slice(0, cutIndex + 1)));
      this.router.navigateByUrl(target);
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }
}
