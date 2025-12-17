// src/app/core/services/storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // ============ LOCALSTORAGE METHODS ============

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // ============ SESSIONSTORAGE METHODS ============

  setSessionItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  getSessionItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }

  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  // ============ UTILITY METHODS ============

  // Verificar si localStorage está disponible
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Verificar si sessionStorage está disponible
  isSessionStorageAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Obtener el tamaño usado en localStorage
  getLocalStorageSize(): number {
    let total = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
    }
    return total;
  }

  // Obtener todas las keys de localStorage
  getAllLocalStorageKeys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
    }
    return keys;
  }

  // Guardar objeto como JSON
  setObject(key: string, obj: any): void {
    try {
      this.setItem(key, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving object to localStorage:', error);
    }
  }

  // Obtener objeto desde JSON
  getObject<T>(key: string): T | null {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error parsing object from localStorage:', error);
      return null;
    }
  }
}