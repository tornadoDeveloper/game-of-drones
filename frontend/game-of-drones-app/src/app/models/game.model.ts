export interface PlayerModel {
  id: number;
  name: string;
  totalWins: number;
}

export interface RoundModel {
  roundNumber: number;
  player1Move: string;
  player2Move: string;
  winnerName: string | null;
}

export interface GameModel {
  id: number;
  player1: PlayerModel;
  player2: PlayerModel;
  winner: PlayerModel | null;
  rounds: RoundModel[];
}

export interface MoveModel {
  id: number;
  name: string;
  killsMoveIds: number[];
}
