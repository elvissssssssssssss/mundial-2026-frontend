import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-live-match',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-match.component.html',
  styleUrls: ['./live-match.component.css']
})
export class LiveMatchComponent implements OnInit, OnDestroy {
  matchId = '2';
  events: any[] = [];
  score = { home: 0, away: 0 };
  homeTeam = 'Perú 🇵🇪';
  awayTeam = 'Argentina 🇦🇷';
  matchStatus = 'EN VIVO';
  minute = 0;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    console.log('🚀 Componente LiveMatch iniciado');
    
    // Suscribirse al partido
    this.socketService.subscribeToMatch(this.matchId);

    // Escuchar eventos en tiempo real
    this.socketService.onMatchEvent().subscribe(event => {
      this.handleEvent(event);
    });
  }

  handleEvent(event: any): void {
    console.log('⚡ Manejando evento:', event);
    
    // Agregar al inicio de la lista (eventos más recientes primero)
    this.events.unshift(event);

    // Actualizar minuto
    if (event.data?.minute) {
      this.minute = event.data.minute;
    }

    // Actualizar marcador si es gol
    if (event.eventType === 'goal' && event.data.score) {
      this.score = event.data.score;
      this.playGoalAnimation();
    }

    // Actualizar estado del partido
    if (event.eventType === 'match_status') {
      this.updateMatchStatus(event.data.status);
    }

    // Limitar a 50 eventos para no sobrecargar la UI
    if (this.events.length > 50) {
      this.events = this.events.slice(0, 50);
    }
  }

  updateMatchStatus(status: string): void {
    const statusMap: any = {
      'first_half_start': 'PRIMER TIEMPO',
      'half_time': 'MEDIO TIEMPO',
      'second_half_start': 'SEGUNDO TIEMPO',
      'full_time': 'FINAL',
      'live': 'EN VIVO'
    };
    this.matchStatus = statusMap[status] || 'EN VIVO';
  }

  playGoalAnimation(): void {
    // Agregar clase de animación al scoreboard
    const scoreboard = document.querySelector('.scoreboard');
    if (scoreboard) {
      scoreboard.classList.add('goal-animation');
      setTimeout(() => {
        scoreboard.classList.remove('goal-animation');
      }, 1000);
    }
  }

  getEventIcon(eventType: string): string {
    const icons: any = {
      'goal': '⚽',
      'card': '🟨',
      'red_card': '🟥',
      'substitution': '🔄',
      'match_status': '⏱️',
      'penalty': '⚠️',
      'corner': '📐',
      'offside': '🚩'
    };
    return icons[eventType] || '📋';
  }

  getEventClass(eventType: string): string {
    const classes: any = {
      'goal': 'event-goal',
      'card': 'event-card',
      'red_card': 'event-red-card',
      'substitution': 'event-sub',
      'match_status': 'event-status',
      'penalty': 'event-penalty'
    };
    return classes[eventType] || 'event-default';
  }

  getEventDescription(event: any): string {
    const { eventType, data } = event;
    
    switch (eventType) {
      case 'goal':
        return `¡GOL de ${data.player || 'Jugador'}! ${data.team || ''}`;
      case 'card':
        return `Tarjeta ${data.cardType || 'amarilla'} para ${data.player || 'Jugador'}`;
      case 'substitution':
        return `Sale: ${data.playerOut || ''} | Entra: ${data.playerIn || ''}`;
      case 'match_status':
        return this.getStatusDescription(data.status);
      default:
        return `${eventType} - ${data.team || ''}`;
    }
  }

  getStatusDescription(status: string): string {
    const descriptions: any = {
      'first_half_start': '⏱️ Comenzó el primer tiempo',
      'half_time': '☕ Medio tiempo',
      'second_half_start': '⏱️ Comenzó el segundo tiempo',
      'full_time': '🏁 Partido finalizado',
      'live': '🔴 Partido en vivo'
    };
    return descriptions[status] || status;
  }

  clearEvents(): void {
    if (confirm('¿Seguro que quieres limpiar todos los eventos?')) {
      this.events = [];
    }
  }

  ngOnDestroy(): void {
    console.log('🔌 Desconectando del partido');
    this.socketService.unsubscribeFromMatch(this.matchId);
  }
    /**
   * Contar eventos por tipo
   */
 
  getEventCountByType(eventType: string): number {
    return this.events.filter(event => event.eventType === eventType).length;
  }
}
