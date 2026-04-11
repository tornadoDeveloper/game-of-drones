import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationExtras } from '@angular/router';
import { WinnerComponent } from './winner.component';
import { GameModel } from '../../models/game.model';

const finishedGame: GameModel = {
  id: 1,
  player1: { id: 1, name: 'Alice', totalWins: 1 },
  player2: { id: 2, name: 'Bob', totalWins: 0 },
  winner: { id: 1, name: 'Alice', totalWins: 1 },
  rounds: [
    { roundNumber: 1, player1Move: 'Rock', player2Move: 'Scissors', winnerName: 'Alice' },
    { roundNumber: 2, player1Move: 'Rock', player2Move: 'Rock', winnerName: null },
    { roundNumber: 3, player1Move: 'Paper', player2Move: 'Rock', winnerName: 'Alice' },
    { roundNumber: 4, player1Move: 'Rock', player2Move: 'Scissors', winnerName: 'Alice' },
  ],
};

describe('WinnerComponent', () => {
  let component: WinnerComponent;
  let fixture: ComponentFixture<WinnerComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      getCurrentNavigation: () => ({
        extras: { state: { game: finishedGame } } as NavigationExtras,
      }),
    });

    await TestBed.configureTestingModule({
      imports: [WinnerComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load game from navigation state', () => {
    expect(component.game).toEqual(finishedGame);
  });

  it('countWins should return correct win count for Alice', () => {
    expect(component.countWins('Alice')).toBe(3);
  });

  it('countWins should return 0 for Bob', () => {
    expect(component.countWins('Bob')).toBe(0);
  });

  it('playAgain should navigate to /', () => {
    component.playAgain();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('goToConfig should navigate to /config', () => {
    component.goToConfig();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/config']);
  });

  it('should redirect to / if no game state is present', async () => {
    const noStateRouter = jasmine.createSpyObj('Router', ['navigate'], {
      getCurrentNavigation: () => null,
    });

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [WinnerComponent],
      providers: [{ provide: Router, useValue: noStateRouter }],
    }).compileComponents();

    TestBed.createComponent(WinnerComponent);
    expect(noStateRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
