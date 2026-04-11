import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SetupComponent } from './setup.component';
import { GameService } from '../../services/game.service';
import { GameModel } from '../../models/game.model';

const mockGame: GameModel = {
  id: 1,
  player1: { id: 1, name: 'Alice', totalWins: 0 },
  player2: { id: 2, name: 'Bob', totalWins: 0 },
  winner: null,
  rounds: [],
};

describe('SetupComponent', () => {
  let component: SetupComponent;
  let fixture: ComponentFixture<SetupComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    gameServiceSpy = jasmine.createSpyObj('GameService', ['startGame']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SetupComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('startGame validation', () => {
    it('should show error when player1 name is empty', () => {
      component.player1Name = '';
      component.player2Name = 'Bob';
      component.startGame();
      expect(component.error).toBe('Both player names are required.');
      expect(gameServiceSpy.startGame).not.toHaveBeenCalled();
    });

    it('should show error when player2 name is empty', () => {
      component.player1Name = 'Alice';
      component.player2Name = '   ';
      component.startGame();
      expect(component.error).toBe('Both player names are required.');
      expect(gameServiceSpy.startGame).not.toHaveBeenCalled();
    });

    it('should show error when both players have the same name (case-insensitive)', () => {
      component.player1Name = 'Alice';
      component.player2Name = 'alice';
      component.startGame();
      expect(component.error).toBe('Players must have different names.');
      expect(gameServiceSpy.startGame).not.toHaveBeenCalled();
    });
  });

  describe('startGame success', () => {
    it('should call service and navigate to /game on success', () => {
      gameServiceSpy.startGame.and.returnValue(of(mockGame));
      component.player1Name = 'Alice';
      component.player2Name = 'Bob';
      component.startGame();
      expect(gameServiceSpy.startGame).toHaveBeenCalledWith('Alice', 'Bob');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/game'], { state: { game: mockGame } });
    });

    it('should trim whitespace from player names before calling service', () => {
      gameServiceSpy.startGame.and.returnValue(of(mockGame));
      component.player1Name = '  Alice  ';
      component.player2Name = '  Bob  ';
      component.startGame();
      expect(gameServiceSpy.startGame).toHaveBeenCalledWith('Alice', 'Bob');
    });
  });

  describe('startGame error', () => {
    it('should show error message when service fails', () => {
      gameServiceSpy.startGame.and.returnValue(throwError(() => new Error('Network error')));
      component.player1Name = 'Alice';
      component.player2Name = 'Bob';
      component.startGame();
      expect(component.error).toBe('Failed to start game. Is the server running?');
      expect(component.loading).toBeFalse();
    });
  });

  it('should navigate to / when goBack is called', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
