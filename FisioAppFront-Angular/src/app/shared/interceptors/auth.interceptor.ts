import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get the token directly from the service (synchronous access to BehaviorSubject value)
    const token = this.authService.getToken();
    
    console.log('🔐 Auth Interceptor:', { 
      hasToken: !!token, 
      url: request.url,
      token: token ? token.substring(0, 20) + '...' : 'none'
    });

    // Si existe token, agregarlo al header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ Token added to request:', `${token.substring(0, 20)}...`);
    } else {
      console.log('❌ No token found');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es 401 (Unauthorized), limpiar sesión y redirigir a login
        if (error.status === 401) {
          console.error('🚫 Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
