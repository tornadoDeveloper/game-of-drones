import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { GameModel, MoveModel, PlayerModel } from '../models/game.model';
import { environment } from '../../environments/environment';

const api = environment.apiUrl;

const mockGame: GameModel = {
  id: 1,
  player1: { id: 1, name: 'Alice', totalWins: 0 },
  player2: { id: 2, name: 'Bob', totalWins: 0 },
  winner: null,
  rounds: [],
};

const mockMoves: MoveModel[] = [
  { id: 1, name: 'Rock', killsMoveIds: [3] },
  { id: 2, name: 'Paper', killsMoveIds: [1] },
  { id: 3, name: 'Scissors', killsMoveIds: [2] },
];

const mockPlayers: PlayerModel[] = [
  { id: 1, name: 'Alice', totalWins: 5 },
  { id: 2, name: 'Bob', totalWins: 3 },
];

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameService],
    });
    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startGame', () => {
    it('should POST to /api/games with player names', () => {
      service.startGame('Alice', 'Bob').subscribe(game => {
        expect(game).toEqual(mockGame);
      });

      const req = httpMock.expectOne(`${api}/games`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ player1Name: 'Alice', player2Name: 'Bob' });
      req.flush(mockGame);
    });
  });

  describe('submitRound', () => {
    it('should POST to /api/games/:id/rounds with move IDs', () => {
      service.submitRound(1, 1, 3).subscribe(game => {
        expect(game).toEqual(mockGame);
      });

      const req = httpMock.expectOne(`${api}/games/1/rounds`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ player1MoveId: 1, player2MoveId: 3 });
      req.flush(mockGame);
    });
  });

  describe('getMoves', () => {
    it('should GET /api/moves and return moves list', () => {
      service.getMoves().subscribe(moves => {
        expect(moves.length).toBe(3);
        expect(moves[0].name).toBe('Rock');
      });

      const req = httpMock.expectOne(`${api}/moves`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoves);
    });
  });

  describe('createMove', () => {
    it('should POST to /api/moves with name and kill IDs', () => {
      const newMove: MoveModel = { id: 4, name: 'Lizard', killsMoveIds: [2, 1] };
      service.createMove('Lizard', [2, 1]).subscribe(move => {
        expect(move).toEqual(newMove);
      });

      const req = httpMock.expectOne(`${api}/moves`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Lizard', killsMoveIds: [2, 1] });
      req.flush(newMove);
    });
  });

  describe('updateMoveRules', () => {
    it('should PUT to /api/moves/:id/rules with kill IDs', () => {
      const updated: MoveModel = { id: 1, name: 'Rock', killsMoveIds: [3, 2] };
      service.updateMoveRules(1, [3, 2]).subscribe(move => {
        expect(move).toEqual(updated);
      });

      const req = httpMock.expectOne(`${api}/moves/1/rules`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ killsMoveIds: [3, 2] });
      req.flush(updated);
    });
  });

  describe('deleteMove', () => {
    it('should DELETE /api/moves/:id', () => {
      service.deleteMove(1).subscribe();

      const req = httpMock.expectOne(`${api}/moves/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getPlayers', () => {
    it('should GET /api/players and return players list', () => {
      service.getPlayers().subscribe(players => {
        expect(players.length).toBe(2);
        expect(players[0].name).toBe('Alice');
      });

      const req = httpMock.expectOne(`${api}/players`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlayers);
    });
  });
});
