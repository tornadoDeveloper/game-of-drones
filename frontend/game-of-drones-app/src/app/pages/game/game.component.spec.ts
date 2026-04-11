import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationExtras } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GameComponent } from './game.component';
import { GameService } from '../../services/game.service';
import { GameModel, MoveModel } from '../../models/game.model';

const mockMoves: MoveModel[] = [
  { id: 1, name: 'Rock', killsMoveIds: [3] },
  { id: 2, name: 'Paper', killsMoveIds: [1] },
  { id: 3, name: 'Scissors', killsMoveIds: [2] },
];

function buildGame(overrides: Partial<GameModel> = {}): GameModel {
  return {
    id: 1,
    player1: { id: 1, name: 'Alice', totalWins: 0 },
    player2: { id: 2, name: 'Bob', totalWins: 0 },
    winner: null,
    rounds: [],
    ...overrides,
  };
}

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const baseGame = buildGame();

  beforeEach(async () => {
    gameServiceSpy = jasmine.createSpyObj('GameService', ['getMoves', 'submitRound']);
    gameServiceSpy.getMoves.and.returnValue(of(mockMoves));

    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      getCurrentNavigation: () => ({
        extras: { state: { game: baseGame } } as NavigationExtras,
      }),
    });

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load moves on init', () => {
    expect(component).toBeTruthy();
    expect(component.moves.length).toBe(3);
  });

  it('should start in player1 phase', () => {
    expect(component.phase).toBe('player1');
  });

  it('currentPlayerName should return player1 name in player1 phase', () => {
    component.phase = 'player1';
    expect(component.currentPlayerName).toBe('Alice');
  });

  it('currentPlayerName should return player2 name in player2 phase', () => {
    component.phase = 'player2';
    expect(component.currentPlayerName).toBe('Bob');
  });

  it('confirmPlayer1Move should switch phase to player2', () => {
    component.confirmPlayer1Move();
    expect(component.phase).toBe('player2');
  });

  describe('player win counts', () => {
    it('player1Wins should count rounds won by player1', () => {
      component.game = buildGame({
        rounds: [
          { roundNumber: 1, player1Move: 'Rock', player2Move: 'Scissors', winnerName: 'Alice' },
          { roundNumber: 2, player1Move: 'Rock', player2Move: 'Rock', winnerName: null },
          { roundNumber: 3, player1Move: 'Paper', player2Move: 'Rock', winnerName: 'Alice' },
        ],
      });
      expect(component.player1Wins).toBe(2);
    });

    it('player2Wins should count rounds won by player2', () => {
      component.game = buildGame({
        rounds: [
          { roundNumber: 1, player1Move: 'Rock', player2Move: 'Paper', winnerName: 'Bob' },
        ],
      });
      expect(component.player2Wins).toBe(1);
    });
  });

  describe('submitRound', () => {
    it('should call service and switch to reveal phase', () => {
      const updatedGame = buildGame({
        rounds: [{ roundNumber: 1, player1Move: 'Rock', player2Move: 'Scissors', winnerName: 'Alice' }],
      });
      gameServiceSpy.submitRound.and.returnValue(of(updatedGame));
      component.player1MoveId = 1;
      component.player2MoveId = 3;
      component.phase = 'player2';

      component.submitRound();

      expect(gameServiceSpy.submitRound).toHaveBeenCalledWith(1, 1, 3);
      expect(component.phase).toBe('reveal');
      expect(component.game).toEqual(updatedGame);
    });

    it('should set lastRoundResult to winner name when round has a winner', () => {
      const updatedGame = buildGame({
        rounds: [{ roundNumber: 1, player1Move: 'Rock', player2Move: 'Scissors', winnerName: 'Alice' }],
      });
      gameServiceSpy.submitRound.and.returnValue(of(updatedGame));
      component.player1MoveId = 1;
      component.player2MoveId = 3;

      component.submitRound();

      expect(component.lastRoundResult).toBe('Alice wins this round!');
    });

    it('should set lastRoundResult to draw message when no winner', () => {
      const updatedGame = buildGame({
        rounds: [{ roundNumber: 1, player1Move: 'Rock', player2Move: 'Rock', winnerName: null }],
      });
      gameServiceSpy.submitRound.and.returnValue(of(updatedGame));
      component.player1MoveId = 1;
      component.player2MoveId = 1;

      component.submitRound();

      expect(component.lastRoundResult).toBe('This round is a draw!');
    });

    it('should navigate to /winner after delay when game has a winner', fakeAsync(() => {
      const finishedGame = buildGame({
        winner: { id: 1, name: 'Alice', totalWins: 1 },
        rounds: [{ roundNumber: 1, player1Move: 'Rock', player2Move: 'Scissors', winnerName: 'Alice' }],
      });
      gameServiceSpy.submitRound.and.returnValue(of(finishedGame));
      component.player1MoveId = 1;
      component.player2MoveId = 3;

      component.submitRound();
      tick(1800);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/winner'], { state: { game: finishedGame } });
    }));

    it('should show error message when service fails', () => {
      gameServiceSpy.submitRound.and.returnValue(throwError(() => new Error('error')));
      component.player1MoveId = 1;
      component.player2MoveId = 3;

      component.submitRound();

      expect(component.error).toBe('Failed to submit round.');
      expect(component.submitting).toBeFalse();
    });
  });

  describe('nextRound', () => {
    it('should reset to player1 phase and clear last round result', () => {
      component.phase = 'reveal';
      component.lastRoundResult = 'Alice wins this round!';

      component.nextRound();

      expect(component.phase).toBe('player1');
      expect(component.lastRoundResult).toBeNull();
    });
  });
});
