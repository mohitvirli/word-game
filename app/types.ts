export interface Player {
  id: string;
  name: string;
  score: number;
  avatarUrl: string;
}

export interface Word {
  word: string;
  meaning: string;
  isNew?: boolean;
}

export interface Room {
  id: string;
  roomId: string;
  players: Player[];
  wordLength: number;
  turnTime: number;
  currentPlayer: Player;
  words: { [key: string]: { word: string; meaning: string }[] };
  activeLetter: string;
  user?: Player;
}
