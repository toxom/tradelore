// types/game.ts
export interface Word {
    id: string;
    word: string;
    translation: string;
    alternatives: string[];
}

export interface GameState {
    currentWordIndex: number;
    score: number;
    words: Word[];
    answers: Map<string, boolean>;
    isGameComplete: boolean;
}