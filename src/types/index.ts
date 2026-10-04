export type LanguagePair = 'en-th' | 'ja-th' | 'zh-th';

export type PartOfSpeech = 'adjective' | 'noun' | 'verb' | 'adverb' | 'phrase';

export interface RepeatHistoryItem {
  id: string;
  timestamp: string;
  source: string;
  context?: string;
}

export interface WordItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: PartOfSpeech;
  partOfSpeechLabel: string;
  translation: string;
  exampleEn: string;
  exampleTh: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  languagePair: LanguagePair;
  repeatCount: number;
  lastEncountered: string;
  priority: 'high' | 'medium' | 'low' | 'mastered';
  mastered: boolean;
  accuracy: number;
  nextReview: string;
  imageUrl?: string;
  imageMnemonicCaption?: string;
  hasMnemonic: boolean;
  repeatHistory: RepeatHistoryItem[];
  stats?: {
    correct: number;
    total: number;
  };
  notes?: string;
}

export interface UserProfile {
  name: string;
  nameEn: string;
  email: string;
  avatarUrl: string;
  badge: string;
  streakDays: number;
  stats: {
    totalWords: number;
    weeklyAdded: number;
    masteredWords: number;
    masteredPercent: number;
    repeatedWords: number;
    streakDays: number;
  };
  languages: {
    code: LanguagePair;
    name: string;
    flag: string;
    count: number;
    percent: number;
  }[];
  settings: {
    dailyReminder: boolean;
    reminderTime: string;
    autoPronounce: boolean;
    dictionaryProvider: string;
  };
}

export type TabType = 'review' | 'add' | 'vault' | 'profile';
