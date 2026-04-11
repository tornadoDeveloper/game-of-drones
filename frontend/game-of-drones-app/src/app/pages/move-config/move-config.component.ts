import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { MoveModel } from '../../models/game.model';

@Component({
  selector: 'app-move-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './move-config.component.html',
  styleUrls: ['./move-config.component.scss']
})
export class MoveConfigComponent implements OnInit {
  moves: MoveModel[] = [];
  newMoveName = '';
  newMoveKills: number[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit() {
    this.loadMoves();
  }

  loadMoves() {
    this.gameService.getMoves().subscribe({
      next: (moves) => this.moves = moves,
      error: () => { this.error = 'Failed to load moves.'; }
    });
  }

  getMoveById(id: number): MoveModel | undefined {
    return this.moves.find(m => m.id === id);
  }

  getMoveName(id: number): string {
    return this.getMoveById(id)?.name ?? '';
  }

  toggleKills(moveId: number, targetId: number) {
    const move = this.moves.find(m => m.id === moveId);
    if (!move) return;
    const idx = move.killsMoveIds.indexOf(targetId);
    if (idx >= 0) {
      move.killsMoveIds.splice(idx, 1);
    } else {
      move.killsMoveIds.push(targetId);
    }
  }

  saveRules(move: MoveModel) {
    this.error = '';
    this.success = '';
    this.gameService.updateMoveRules(move.id, move.killsMoveIds).subscribe({
      next: () => { this.success = `Rules for "${move.name}" saved.`; },
      error: () => { this.error = 'Failed to save rules.'; }
    });
  }

  toggleNewKills(targetId: number) {
    const idx = this.newMoveKills.indexOf(targetId);
    if (idx >= 0) {
      this.newMoveKills.splice(idx, 1);
    } else {
      this.newMoveKills.push(targetId);
    }
  }

  addMove() {
    if (!this.newMoveName.trim()) return;
    this.error = '';
    this.success = '';
    this.loading = true;
    this.gameService.createMove(this.newMoveName.trim(), [...this.newMoveKills]).subscribe({
      next: () => {
        this.newMoveName = '';
        this.newMoveKills = [];
        this.success = 'Move added successfully.';
        this.loading = false;
        this.loadMoves();
      },
      error: () => {
        this.error = 'Failed to add move.';
        this.loading = false;
      }
    });
  }

  deleteMove(move: MoveModel) {
    if (!confirm(`Delete "${move.name}"?`)) return;
    this.error = '';
    this.success = '';
    this.gameService.deleteMove(move.id).subscribe({
      next: () => {
        this.success = `"${move.name}" deleted.`;
        this.loadMoves();
      },
      error: () => { this.error = 'Failed to delete move.'; }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
