import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly SOCKET_URL = 'http://localhost:4000';

  constructor() {
    // Inicializar conexión Socket.IO
    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    // Event listeners para debugging
    this.socket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO');
      console.log('🔌 Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado de Socket.IO');
      console.log('📛 Razón:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('🔄 Intentando reconectar...', attemptNumber);
    });
  }

  /**
   * Suscribirse a eventos de un partido específico
   */
  subscribeToMatch(matchId: string): void {
    this.socket.emit('subscribe_match', matchId);
    console.log(`⚽ Suscrito al partido: ${matchId}`);
  }

  /**
   * Desuscribirse de eventos de un partido
   */
  unsubscribeFromMatch(matchId: string): void {
    this.socket.emit('unsubscribe_match', matchId);
    console.log(`🔌 Desuscrito del partido: ${matchId}`);
  }

  /**
   * Escuchar eventos del partido en tiempo real
   */
  onMatchEvent(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('match_event', (data: any) => {
        console.log('📥 Evento recibido del servidor:', data);
        observer.next(data);
      });

      // Cleanup cuando se desuscriba
      return () => {
        this.socket.off('match_event');
      };
    });
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket.connected;
  }

  /**
   * Obtener el ID del socket
   */
  getSocketId(): string | undefined {
    return this.socket.id;
  }

  /**
   * Desconectar manualmente (útil para cleanup)
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Socket desconectado manualmente');
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      console.log('🔄 Intentando reconectar...');
    }
  }

  /**
   * Emitir evento personalizado (para futuras funcionalidades)
   */
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
    console.log(`📤 Evento emitido: ${event}`, data);
  }

  /**
   * Escuchar evento personalizado (para futuras funcionalidades)
   */
  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    });
  }
}
