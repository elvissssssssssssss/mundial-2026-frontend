// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from './storage.service';


export interface User { 
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://api.example.com'; // Cambia esto por tu URL de API real
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'current-user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Cargar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  // ============ MÉTODOS DE AUTENTICACIÓN ============

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  adminLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/admin-login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  logout(): void {
    // Llamar al endpoint de logout si existe
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe();
    
    // Limpiar datos locales
    this.clearAuthData();
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/reset-password`, { token, password });
  }

  // ============ MÉTODOS DE VERIFICACIÓN ============

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    return !this.isTokenExpired(token);
  }

// En tu auth.service.ts
isAdmin(): boolean {
  // Para pruebas, cambia temporalmente a false
  return false; // Cambiar a true para probar como admin
}
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.storageService.getItem(this.TOKEN_KEY);
  }

  // ============ MÉTODOS PRIVADOS ============

  private handleAuthSuccess(response: AuthResponse): void {
    // Guardar token y usuario
    this.storageService.setItem(this.TOKEN_KEY, response.token);
    this.storageService.setItem(this.USER_KEY, JSON.stringify(response.user));
    
    // Actualizar el BehaviorSubject
    this.currentUserSubject.next(response.user);
  }

  private loadUserFromStorage(): void {
    const userJson = this.storageService.getItem(this.USER_KEY);
    if (userJson && this.isAuthenticated()) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.clearAuthData();
      }
    }
  }

  private clearAuthData(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Si hay error al decodificar, considerar expirado
    }
  }

  // ============ MÉTODOS DE UTILIDAD ============

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getItem('refresh-token');
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/auth/profile`, userData)
      .pipe(
        tap(user => {
          this.storageService.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }
}