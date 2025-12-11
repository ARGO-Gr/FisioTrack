import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Debes iniciar sesión');
      this.router.navigate(['/']);
      return false;
    }

    // Obtener el rol requerido de los datos de la ruta
    const requiredRole = route.data['requiredRole'];
    
    if (!requiredRole) {
      return true; // No hay rol requerido
    }

    // Obtener el rol del usuario desde el token
    const userRole = this.authService.getUserRole();

    // Validar que el rol coincida
    if (userRole !== requiredRole) {
      this.toastService.error(`No tienes permisos para acceder a esta sección. Se requiere rol: ${requiredRole}`);
      
      // Redirigir al dashboard correspondiente al rol del usuario
      const redirectPath = userRole === 'physiotherapist' 
        ? '/fisioterapeuta/dashboard' 
        : '/paciente/dashboard';
      
      this.router.navigate([redirectPath]);
      return false;
    }

    return true;
  }
}

