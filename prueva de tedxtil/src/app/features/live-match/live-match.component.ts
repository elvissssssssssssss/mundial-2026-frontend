import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  stadium: string;
  status: string;
}

@Component({
  selector: 'app-live-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-match.component.html',
  styleUrls: ['./live-match.component.css']
})
export class LiveMatchComponent implements OnInit, OnDestroy {
  selectedMatchId: string = '2';
  
  availableMatches: Match[] = [
    {
      id: '1',
      homeTeam: 'Argentina',
      awayTeam: 'Brasil',
      homeFlag: '🇦🇷',
      awayFlag: '🇧🇷',
      stadium: 'Estadio Azteca',
      status: 'scheduled'
    },
    {
      id: '2',
      homeTeam: 'Perú',
      awayTeam: 'Argentina',
      homeFlag: '🇵🇪',
      awayFlag: '🇦🇷',
      stadium: 'MetLife Stadium',
      status: 'live'
    },
    {
      id: '3',
      homeTeam: 'Brasil',
      awayTeam: 'Francia',
      homeFlag: '🇧🇷',
      awayFlag: '🇫🇷',
      stadium: 'SoFi Stadium',
      status: 'scheduled'
    },
    {
      id: '4',
      homeTeam: 'España',
      awayTeam: 'Alemania',
      homeFlag: '🇪🇸',
      awayFlag: '🇩🇪',
      stadium: 'AT&T Stadium',
      status: 'scheduled'
    },
    {
      id: '5',
      homeTeam: 'Inglaterra',
      awayTeam: 'México',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🇲🇽',
      stadium: 'Mercedes-Benz Stadium',
      status: 'scheduled'
    }
  ];

  currentMatch: Match | null = null;
  events: any[] = [];
  score = { home: 0, away: 0 };
  matchStatus = 'EN VIVO';
  minute = 0;

  private readonly STORAGE_PREFIX = 'match_';
  private eventSubscription?: Subscription; // 🔥 NUEVO

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    console.log('🚀 Componente LiveMatch iniciado');
    this.loadMatch(this.selectedMatchId);
  }

  /**
   * Cargar partido específico
   */
  loadMatch(matchId: string): void {
    // 🔥 Desuscribirse COMPLETAMENTE del partido anterior
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
      console.log('🔌 Suscripción anterior eliminada');
    }

    if (this.selectedMatchId && this.selectedMatchId !== matchId) {
      this.socketService.unsubscribeFromMatch(this.selectedMatchId);
    }

    // Actualizar partido seleccionado
    this.selectedMatchId = matchId;
    this.currentMatch = this.availableMatches.find(m => m.id === matchId) || null;

    // Cargar eventos guardados de este partido
    this.loadEventsFromStorage(matchId);

    // Suscribirse al nuevo partido
    this.socketService.subscribeToMatch(matchId);

    // 🔥 Crear NUEVA suscripción limpia
    this.eventSubscription = this.socketService.onMatchEvent().subscribe(event => {
      // Solo procesar eventos del partido actual
      if (event.matchId === this.selectedMatchId) {
        this.handleEvent(event);
      }
    });

    console.log(`⚽ Partido cargado: ${this.currentMatch?.homeTeam} vs ${this.currentMatch?.awayTeam}`);
  }

  /**
   * Cambiar de partido
   */
  onMatchChange(): void {
    console.log(`🔄 Cambiando a partido ${this.selectedMatchId}`);
    this.loadMatch(this.selectedMatchId);
  }

  /**
   * Cargar eventos desde localStorage para un partido específico
   */
  private loadEventsFromStorage(matchId: string): void {
    const eventsKey = `${this.STORAGE_PREFIX}${matchId}_events`;
    const scoreKey = `${this.STORAGE_PREFIX}${matchId}_score`;
    
    const savedEvents = localStorage.getItem(eventsKey);
    const savedScore = localStorage.getItem(scoreKey);
    
    if (savedEvents) {
      this.events = JSON.parse(savedEvents);
      console.log(`📂 ${this.events.length} eventos cargados del partido ${matchId}`);
    } else {
      this.events = [];
    }
    
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    } else {
      this.score = { home: 0, away: 0 };
    }
  }

  /**
   * Guardar eventos en localStorage para el partido actual
   */
  private saveEventsToStorage(): void {
    const eventsKey = `${this.STORAGE_PREFIX}${this.selectedMatchId}_events`;
    const scoreKey = `${this.STORAGE_PREFIX}${this.selectedMatchId}_score`;
    
    localStorage.setItem(eventsKey, JSON.stringify(this.events));
    localStorage.setItem(scoreKey, JSON.stringify(this.score));
  }

  handleEvent(event: any): void {
    console.log('⚡ Evento recibido:', event);
    
    // 🔥 PREVENIR DUPLICADOS: Verificar si el evento ya existe
    const eventExists = this.events.some(e => 
      e.timestamp === event.timestamp && 
      e.eventType === event.eventType && 
      e.data?.player === event.data?.player &&
      e.data?.minute === event.data?.minute
    );

    if (eventExists) {
      console.log('⚠️ Evento duplicado detectado, ignorando...');
      return;
    }

    this.events.unshift(event);

    if (event.data?.minute) {
      this.minute = event.data.minute;
    }

    if (event.eventType === 'goal' && event.data.score) {
      this.score = event.data.score;
      this.playGoalAnimation();
    }

    if (event.eventType === 'match_status') {
      this.updateMatchStatus(event.data.status);
    }

    if (this.events.length > 50) {
      this.events = this.events.slice(0, 50);
    }

    this.saveEventsToStorage();
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
      'match_status': '⏱️'
    };
    return icons[eventType] || '📋';
  }

  getEventClass(eventType: string): string {
    const classes: any = {
      'goal': 'event-goal',
      'card': 'event-card',
      'red_card': 'event-red-card',
      'substitution': 'event-sub',
      'match_status': 'event-status'
    };
    return classes[eventType] || 'event-default';
  }

  getEventDescription(event: any): string {
    const { eventType, data } = event;
    
    switch (eventType) {
      case 'goal':
        return `¡GOL de ${data.player || 'Jugador'}!`;
      case 'card':
        return `Tarjeta ${data.cardType || 'amarilla'} para ${data.player || 'Jugador'}`;
      case 'substitution':
        return `Sale: ${data.playerOut || ''} | Entra: ${data.playerIn || ''}`;
      case 'match_status':
        return this.getStatusDescription(data.status);
      default:
        return `${eventType}`;
    }
  }

  getStatusDescription(status: string): string {
    const descriptions: any = {
      'first_half_start': '⏱️ Comenzó el primer tiempo',
      'half_time': '☕ Medio tiempo',
      'second_half_start': '⏱️ Comenzó el segundo tiempo',
      'full_time': '🏁 Partido finalizado'
    };
    return descriptions[status] || status;
  }

  clearEvents(): void {
    if (confirm(`¿Limpiar eventos del partido ${this.currentMatch?.homeTeam} vs ${this.currentMatch?.awayTeam}?`)) {
      this.events = [];
      this.score = { home: 0, away: 0 };
      const eventsKey = `${this.STORAGE_PREFIX}${this.selectedMatchId}_events`;
      const scoreKey = `${this.STORAGE_PREFIX}${this.selectedMatchId}_score`;
      localStorage.removeItem(eventsKey);
      localStorage.removeItem(scoreKey);
    }
  }

  getEventCountByType(eventType: string): number {
    return this.events.filter(event => event.eventType === eventType).length;
  }

  ngOnDestroy(): void {
    // 🔥 Limpiar suscripción
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    this.socketService.unsubscribeFromMatch(this.selectedMatchId);
  }
}
