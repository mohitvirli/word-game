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