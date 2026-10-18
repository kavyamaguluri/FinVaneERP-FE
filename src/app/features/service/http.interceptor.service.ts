import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tenantId = this.authService.getActiveTenant();
    const token = this.authService.getToken();
    const startTime = Date.now();

    let headers = req.headers.set('X-Entity-ID', tenantId);

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const cloned = req.clone({ headers });

    return next.handle(cloned).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`%c[API RESPONSE ${event.status}] %c${req.method} ${req.url} (${duration}ms)`, 'color: #16a34a; font-weight: bold;', 'color: #2563eb;', event.body);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        console.error(`%c[API ERROR ${error.status}] %c${req.method} ${req.url} (${duration}ms)`, 'color: #dc2626; font-weight: bold;', 'color: #2563eb;', error);
        let errorMsg = 'An unexpected error occurred';
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.status === 403) {
          errorMsg = 'Access Denied: You do not have permission for this action.';
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
