import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GameModel, MoveModel, PlayerModel } from '../models/game.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  startGame(player1Name: string, player2Name: string): Observable<GameModel> {
    return this.http.post<GameModel>(`${this.api}/games`, { player1Name, player2Name });
  }

  submitRound(gameId: number, player1MoveId: number, player2MoveId: number): Observable<GameModel> {
    return this.http.post<GameModel>(`${this.api}/games/${gameId}/rounds`, { player1MoveId, player2MoveId });
  }

  getMoves(): Observable<MoveModel[]> {
    return this.http.get<MoveModel[]>(`${this.api}/moves`);
  }

  createMove(name: string, killsMoveIds: number[]): Observable<MoveModel> {
    return this.http.post<MoveModel>(`${this.api}/moves`, { name, killsMoveIds });
  }

  updateMoveRules(moveId: number, killsMoveIds: number[]): Observable<MoveModel> {
    return this.http.put<MoveModel>(`${this.api}/moves/${moveId}/rules`, { killsMoveIds });
  }

  deleteMove(moveId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/moves/${moveId}`);
  }

  getPlayers(): Observable<PlayerModel[]> {
    return this.http.get<PlayerModel[]>(`${this.api}/players`);
  }
}
