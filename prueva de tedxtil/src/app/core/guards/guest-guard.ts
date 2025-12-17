// src/app/core/guards/guest.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const GuestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si NO está autenticado, puede acceder (es un invitado)
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si está autenticado, redirigir según su rol
  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/profile/account']);
  }
  
  return false;
};