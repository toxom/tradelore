export interface GameResult {
    date: string;
    score: number;
    totalQuestions: number;
    wordsPlayed: string[]; // Store word IDs or words themselves
}

export interface Progress {
    totalWordsLearned: number;
    successRate: number;
    streak: {
        current: number;
        lastPlayed: string; // ISO date string
    };
    timeStudied: number; // in minutes
    gameHistory: GameResult[];
    masteredWords: Set<string>; // Store word IDs or words that user has mastered
}