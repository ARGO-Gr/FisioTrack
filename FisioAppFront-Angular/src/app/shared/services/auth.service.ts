import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginDto {
  email: string;
  password: string;
}

export interface ConfirmDto {
  token: string;
}

export interface LockUserDto {
  email: string;
}

export interface UnlockUserDto {
  token: string;
}

export interface ResendUnlockCodeDto {
  email: string;
}

export interface SendPasswordDto {
  email: string;
}

export interface AuthResponse {
  token: string;
  message?: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

type UserRole = 'physiotherapist' | 'patient';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenSubject = new BehaviorSubject<string | null>(this.getTokenFromLocalStorage());
  private userRoleSubject = new BehaviorSubject<UserRole | null>(this.extractRoleFromToken());

  // Observable público para que el interceptor pueda escucharlo
  token$ = this.tokenSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto);
  }

  confirm(dto: ConfirmDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/confirm`, dto);
  }

  lockUser(dto: LockUserDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/lock`, dto);
  }

  unlockUser(dto: UnlockUserDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/unlock`, dto);
  }

  resendUnlockCode(dto: ResendUnlockCodeDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/resend-unlock-code`, dto);
  }

  sendPassword(dto: SendPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-password`, dto);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
    
    // Actualizar el rol del usuario
    const role = this.extractRoleFromToken(token);
    this.userRoleSubject.next(role);
  }

  getToken(): string | null {
    // Siempre obtener del localStorage primero para garantizar que tenemos el token más reciente
    const token = this.getTokenFromLocalStorage();
    if (token) {
      // Asegurar que el BehaviorSubject está sincronizado
      if (this.tokenSubject.value !== token) {
        this.tokenSubject.next(token);
      }
      return token;
    }
    return this.tokenSubject.value;
  }

  getToken$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Obtiene el ID del usuario desde el token JWT
   */
  getUserId(): string | null {
    try {
      const token = this.getTokenFromLocalStorage();
      if (!token) return null;

      const decodedToken = this.decodeToken(token);
      return decodedToken?.sub || null;
    } catch (error) {
      console.error('Error extrayendo ID del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene el rol del usuario desde el token JWT
   */
  getUserRole(): UserRole | null {
    return this.userRoleSubject.value;
  }

  /**
   * Observable del rol del usuario
   */
  getUserRole$(): Observable<UserRole | null> {
    return this.userRoleSubject.asObservable();
  }

  /**
   * Decodifica el token JWT y extrae el rol
   */
  private extractRoleFromToken(token?: string): UserRole | null {
    try {
      const tokenToDecode = token || this.getTokenFromLocalStorage();
      
      if (!tokenToDecode) {
        return null;
      }

      const decodedToken = this.decodeToken(tokenToDecode);
      
      if (decodedToken && decodedToken.role) {
        return decodedToken.role as UserRole;
      }

      return null;
    } catch (error) {
      console.error('Error extrayendo rol del token:', error);
      return null;
    }
  }

  /**
   * Decodifica un JWT sin validar la firma (solo lectura)
   */
  private decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.error('Token JWT inválido');
        return null;
      }

      const decoded = JSON.parse(atob(parts[1]));
      return decoded as DecodedToken;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    try {
      const token = this.getTokenFromLocalStorage();
      if (!token) return true;

      const decodedToken = this.decodeToken(token);
      if (!decodedToken || !decodedToken.exp) return true;

      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate <= new Date();
    } catch (error) {
      return true;
    }
  }

  getTokenFromLocalStorage(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.clear(); // Limpiar todo localStorage
    this.tokenSubject.next(null);
    this.userRoleSubject.next(null);
    sessionStorage.clear(); // Limpiar sessionStorage también
    
    // Redirigir a home
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }
}
