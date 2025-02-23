export type WordType = 'verb' | 'adjective' | 'noun';

export interface Word {
    word: string;
    type: WordType;
}

export interface VocabularyData {
    words: Word[];
}