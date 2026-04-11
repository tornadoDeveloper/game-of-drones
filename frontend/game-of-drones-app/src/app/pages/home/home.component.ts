import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { PlayerModel } from '../../models/game.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  players: PlayerModel[] = [];

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getPlayers().subscribe({
      next: (players) => this.players = players,
      error: () => {}
    });
  }

  startGame() {
    this.router.navigate(['/setup']);
  }

  goToConfig() {
    this.router.navigate(['/config']);
  }
}
