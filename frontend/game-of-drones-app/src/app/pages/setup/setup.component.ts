import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  player1Name = '';
  player2Name = '';
  loading = false;
  error = '';

  constructor(private router: Router, private gameService: GameService) {}

  startGame() {
    if (!this.player1Name.trim() || !this.player2Name.trim()) {
      this.error = 'Both player names are required.';
      return;
    }
    if (this.player1Name.trim().toLowerCase() === this.player2Name.trim().toLowerCase()) {
      this.error = 'Players must have different names.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.gameService.startGame(this.player1Name.trim(), this.player2Name.trim()).subscribe({
      next: (game) => {
        this.router.navigate(['/game'], { state: { game } });
      },
      error: () => {
        this.error = 'Failed to start game. Is the server running?';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
