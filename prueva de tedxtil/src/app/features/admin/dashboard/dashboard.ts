// dashboard.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface EventForm {
  matchId: string;
  team: string;
  player: string;
  minute: number;
  cardType?: string;
  playerOut?: string;
  playerIn?: string;
  status?: string;
  score?: { home: number; away: number };
}

interface MatchOption {
  id: string;
  label: string;
  homeTeam: string;
  awayTeam: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private readonly API_URL = 'http://localhost:3000/api/events';

  // Formulario de evento
  eventType: string = 'goal';
  eventForm: EventForm = {
    matchId: '2',
    team: 'Peru',
    player: '',
    minute: 0,
    score: { home: 0, away: 0 }
  };

  // NUEVO: Lista de partidos disponibles
  availableMatches: MatchOption[] = [
    { id: '1', label: '🇦🇷 Argentina vs Brasil 🇧🇷', homeTeam: 'Argentina', awayTeam: 'Brasil' },
    { id: '2', label: '🇵🇪 Perú vs Argentina 🇦🇷', homeTeam: 'Peru', awayTeam: 'Argentina' },
    { id: '3', label: '🇧🇷 Brasil vs Francia 🇫🇷', homeTeam: 'Brasil', awayTeam: 'Francia' },
    { id: '4', label: '🇪🇸 España vs Alemania 🇩🇪', homeTeam: 'Espana', awayTeam: 'Alemania' },
    { id: '5', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra vs México 🇲🇽', homeTeam: 'Inglaterra', awayTeam: 'Mexico' }
  ];

  // Partido seleccionado actualmente
  selectedMatch: MatchOption = this.availableMatches[1]; // Por defecto Perú vs Argentina

  
  // Historial de eventos enviados
  sentEvents: any[] = [];
  
  // Estado
  isLoading: boolean = false;
  lastResponse: any = null;
  errorMessage: string = '';

  // Datos predefinidos
  teams = ['Peru', 'Argentina', 'Brasil', 'Francia', 'Espana', 'Alemania', 'Inglaterra', 'Mexico'];
  
  peruPlayers = [
    'Paolo Guerrero', 'Gianluca Lapadula', 'André Carrillo',
    'Edison Flores', 'Christian Cueva', 'Renato Tapia',
    'Sergio Peña', 'Pedro Gallese', 'Luis Advíncula'
  ];

  argentinaPlayers = [
    'Lionel Messi', 'Julián Álvarez', 'Ángel Di María',
    'Rodrigo De Paul', 'Emiliano Martínez'
  ];

  brasilPlayers = [
    'Neymar Jr', 'Vinícius Júnior', 'Richarlison',
    'Casemiro', 'Alisson Becker', 'Marquinhos',
    'Rodrygo', 'Gabriel Jesus'
  ];

  franciaPlayers = [
    'Kylian Mbappé', 'Antoine Griezmann', 'Karim Benzema',
    'Ousmane Dembélé', 'Hugo Lloris', 'N\'Golo Kanté',
    'Paul Pogba', 'Raphaël Varane'
  ];

  espanaPlayers = [
    'Álvaro Morata', 'Ferran Torres', 'Pedri',
    'Gavi', 'Sergio Busquets', 'Unai Simón',
    'Dani Olmo', 'Marco Asensio'
  ];

  alemaniaPlayers = [
    'Thomas Müller', 'Kai Havertz', 'Serge Gnabry',
    'Joshua Kimmich', 'Manuel Neuer', 'Antonio Rüdiger',
    'Jamal Musiala', 'Leroy Sané'
  ];

  inglaterraPlayers = [
    'Harry Kane', 'Raheem Sterling', 'Phil Foden',
    'Bukayo Saka', 'Jordan Pickford', 'Harry Maguire',
    'Declan Rice', 'Jack Grealish'
  ];

  mexicoPlayers = [
    'Hirving Lozano', 'Raúl Jiménez', 'Alexis Vega',
    'Guillermo Ochoa', 'Edson Álvarez', 'Héctor Herrera',
    'Jesús Corona', 'Diego Lainez'
  ];

  cardTypes = ['yellow', 'red'];
  matchStatuses = ['first_half_start', 'half_time', 'second_half_start', 'full_time'];


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSentEvents();
  }

  /**
   * Obtener jugadores según el equipo seleccionado
   */
  /**
   * Obtener jugadores según el equipo seleccionado
   */
  getPlayersForTeam(): string[] {
    switch (this.eventForm.team) {
      case 'Peru':
        return this.peruPlayers;
      case 'Argentina':
        return this.argentinaPlayers;
      case 'Brasil':
        return this.brasilPlayers;
      case 'Francia':
        return this.franciaPlayers;
      case 'Espana':
        return this.espanaPlayers;
      case 'Alemania':
        return this.alemaniaPlayers;
      case 'Inglaterra':
        return this.inglaterraPlayers;
      case 'Mexico':
        return this.mexicoPlayers;
      default:
        return [];
    }
  }


  /**
   * Enviar GOL
   */
  sendGoal(): void {
    const payload = {
      matchId: this.eventForm.matchId,
      team: this.eventForm.team,
      player: this.eventForm.player,
      minute: this.eventForm.minute,
      score: this.eventForm.score,
      team_id: this.eventForm.team === 'Peru' ? 3 : 1,
      player_id: this.getPlayerIdByName(this.eventForm.player)
    };

    this.sendEvent('goal', payload);
  }

  /**
   * Enviar TARJETA
   */
  sendCard(): void {
    const payload = {
      matchId: this.eventForm.matchId,
      team: this.eventForm.team,
      player: this.eventForm.player,
      minute: this.eventForm.minute,
      cardType: this.eventForm.cardType,
      team_id: this.eventForm.team === 'Peru' ? 3 : 1,
      player_id: this.getPlayerIdByName(this.eventForm.player)
    };

    this.sendEvent('card', payload);
  }

  /**
   * Enviar CAMBIO
   */
  sendSubstitution(): void {
    const payload = {
      matchId: this.eventForm.matchId,
      team: this.eventForm.team,
      playerOut: this.eventForm.playerOut,
      playerIn: this.eventForm.playerIn,
      minute: this.eventForm.minute,
      team_id: this.eventForm.team === 'Peru' ? 3 : 1,
      player_out_id: this.getPlayerIdByName(this.eventForm.playerOut || ''),
      player_in_id: this.getPlayerIdByName(this.eventForm.playerIn || '')
    };

    this.sendEvent('substitution', payload);
  }

  /**
   * Enviar ESTADO DEL PARTIDO
   */
  sendMatchStatus(): void {
    const payload = {
      matchId: this.eventForm.matchId,
      status: this.eventForm.status
    };

    this.sendEvent('match-status', payload);
  }

  /**
   * Enviar evento al backend
   */
  private sendEvent(endpoint: string, payload: any): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post(`${this.API_URL}/${endpoint}`, payload)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Evento enviado:', response);
          this.lastResponse = response;
          this.isLoading = false;
          
          // Agregar al historial
          this.sentEvents.unshift({
            type: endpoint,
            payload,
            response,
            timestamp: new Date().toISOString()
          });
          this.saveSentEvents();

          // Limpiar formulario
          this.resetForm();
        },
        error: (error) => {
          console.error('❌ Error enviando evento:', error);
          this.errorMessage = error.message || 'Error al enviar evento';
          this.isLoading = false;
        }
      });
  }

  /**
   * Obtener ID del jugador por nombre (simulado)
   */
   /**
   * Obtener ID del jugador por nombre (simulado)
   */
  private getPlayerIdByName(playerName: string): number {
    const playerIds: any = {
      // Perú
      'Paolo Guerrero': 27,
      'Gianluca Lapadula': 26,
      'André Carrillo': 28,
      'Edison Flores': 29,
      'Christian Cueva': 30,
      
      // Argentina
      'Lionel Messi': 1,
      'Julián Álvarez': 4,
      'Ángel Di María': 2,
      'Rodrigo De Paul': 3,
      'Emiliano Martínez': 5,
      
      // Brasil
      'Neymar Jr': 10,
      'Vinícius Júnior': 11,
      'Richarlison': 12,
      'Casemiro': 13,
      'Alisson Becker': 14,
      
      // Francia
      'Kylian Mbappé': 20,
      'Antoine Griezmann': 21,
      'Karim Benzema': 22,
      'Hugo Lloris': 23,
      
      // España
      'Álvaro Morata': 31,
      'Ferran Torres': 32,
      'Pedri': 33,
      
      // Alemania
      'Thomas Müller': 40,
      'Kai Havertz': 41,
      'Manuel Neuer': 42,
      
      // Inglaterra
      'Harry Kane': 50,
      'Raheem Sterling': 51,
      
      // México
      'Hirving Lozano': 60,
      'Raúl Jiménez': 61
    };
    return playerIds[playerName] || 100;
  }

  /**
   * Resetear formulario
   */
  private resetForm(): void {
    this.eventForm.player = '';
    this.eventForm.playerOut = '';
    this.eventForm.playerIn = '';
    this.eventForm.cardType = undefined;
    this.eventForm.status = undefined;
  }

  /**
   * Guardar historial en localStorage
   */
  private saveSentEvents(): void {
    localStorage.setItem('admin_sent_events', JSON.stringify(this.sentEvents.slice(0, 20)));
  }

  /**
   * Cargar historial desde localStorage
   */
  private loadSentEvents(): void {
    const saved = localStorage.getItem('admin_sent_events');
    if (saved) {
      this.sentEvents = JSON.parse(saved);
    }
  }

  /**
   * Limpiar historial
   */
  clearHistory(): void {
    if (confirm('¿Seguro que quieres limpiar el historial?')) {
      this.sentEvents = [];
      localStorage.removeItem('admin_sent_events');
    }
  }
    /**
   * Obtener bandera del equipo
   */
  getTeamFlag(team: string): string {
    const flags: any = {
      'Peru': '🇵🇪',
      'Argentina': '🇦🇷',
      'Brasil': '🇧🇷',
      'Francia': '🇫🇷',
      'Espana': '🇪🇸',
      'Alemania': '🇩🇪',
      'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Mexico': '🇲🇽'
    };
    return flags[team] || '🏳️';
  }
/**
 * NUEVO: Manejar cambio de partido seleccionado
 */
onMatchChange(): void {
  // Buscar el partido seleccionado por ID
  const match = this.availableMatches.find(m => m.id === this.eventForm.matchId);
  
  if (match) {
    this.selectedMatch = match;
    // Resetear el equipo al equipo local del partido seleccionado
    this.eventForm.team = match.homeTeam;
    console.log('✅ Partido cambiado:', match.label);
  }
}

}
