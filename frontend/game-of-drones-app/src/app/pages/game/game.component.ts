import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { GameModel, MoveModel } from '../../models/game.model';

type Phase = 'player1' | 'player2' | 'reveal';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game!: GameModel;
  moves: MoveModel[] = [];
  phase: Phase = 'player1';
  player1MoveId: number | null = null;
  player2MoveId: number | null = null;
  submitting = false;
  lastRoundResult: string | null = null;
  error = '';

  constructor(private router: Router, private gameService: GameService) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { game: GameModel } | undefined;
    if (state?.game) {
      this.game = state.game;
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.gameService.getMoves().subscribe({
      next: (moves) => {
        this.moves = moves;
        if (moves.length > 0) {
          this.player1MoveId = moves[0].id;
          this.player2MoveId = moves[0].id;
        }
      },
      error: () => { this.error = 'Failed to load moves.'; }
    });
  }

  get currentPlayerName(): string {
    return this.phase === 'player1' ? this.game.player1.name : this.game.player2.name;
  }

  get player1Wins(): number {
    return this.game.rounds.filter(r => r.winnerName === this.game.player1.name).length;
  }

  get player2Wins(): number {
    return this.game.rounds.filter(r => r.winnerName === this.game.player2.name).length;
  }

  confirmPlayer1Move() {
    this.phase = 'player2';
  }

  submitRound() {
    if (this.player1MoveId === null || this.player2MoveId === null) return;
    this.submitting = true;
    this.error = '';

    this.gameService.submitRound(this.game.id, this.player1MoveId, this.player2MoveId).subscribe({
      next: (updatedGame) => {
        this.game = updatedGame;
        this.phase = 'reveal';
        this.submitting = false;

        const lastRound = updatedGame.rounds[updatedGame.rounds.length - 1];
        this.lastRoundResult = lastRound.winnerName
          ? `${lastRound.winnerName} wins this round!`
          : 'This round is a draw!';

        if (updatedGame.winner) {
          setTimeout(() => this.router.navigate(['/winner'], { state: { game: updatedGame } }), 1800);
        }
      },
      error: () => {
        this.error = 'Failed to submit round.';
        this.submitting = false;
      }
    });
  }

  nextRound() {
    this.phase = 'player1';
    this.lastRoundResult = null;
    if (this.moves.length > 0) {
      this.player1MoveId = this.moves[0].id;
      this.player2MoveId = this.moves[0].id;
    }
  }
}
