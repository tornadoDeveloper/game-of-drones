import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameModel } from '../../models/game.model';

@Component({
  selector: 'app-winner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './winner.component.html',
  styleUrls: ['./winner.component.scss']
})
export class WinnerComponent {
  game!: GameModel;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { game: GameModel } | undefined;
    if (state?.game) {
      this.game = state.game;
    } else {
      this.router.navigate(['/']);
    }
  }

  playAgain() {
    this.router.navigate(['/']);
  }

  goToConfig() {
    this.router.navigate(['/config']);
  }

  countWins(playerName: string): number {
    return this.game.rounds.filter(r => r.winnerName === playerName).length;
  }
}
