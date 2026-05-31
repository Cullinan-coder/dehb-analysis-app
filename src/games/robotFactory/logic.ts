import { RobotFactoryConfig, RobotFactoryRound } from './types';
import { WORD_LIST, WordEntry } from './wordList';
import { GAME_CONFIG } from '../../config/demoMode';

export const DEFAULT_CONFIG: RobotFactoryConfig = {
  totalRounds: GAME_CONFIG.robotFactory.totalWords,
  roundTimeoutMs: GAME_CONFIG.robotFactory.roundTimeoutMs,
  distractorCount: 3,
};

const DISTRACTOR_POOL = ['LO', 'TI', 'PU', 'ZE', 'SO', 'GA', 'NU', 'RA', 'FE', 'Mİ', 'BO', 'DA'];

export function pickRoundWords(totalRounds: number): WordEntry[] {
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, totalRounds);
}

export function generateRound(entry: WordEntry, config: RobotFactoryConfig = DEFAULT_CONFIG): RobotFactoryRound {
  const correctSyllables = [...entry.syllables];
  // distraktörlerden doğru hecelerle çakışmayanları al
  const distractors = DISTRACTOR_POOL
    .filter((d) => !correctSyllables.includes(d))
    .sort(() => Math.random() - 0.5)
    .slice(0, config.distractorCount);
  const choices = [...correctSyllables, ...distractors].sort(() => Math.random() - 0.5);
  return {
    word: entry.word,
    correctSyllables,
    choices,
    startedAt: Date.now(),
  };
}

export function calculatePerformance(completedWords: number, totalRounds: number): number {
  return (completedWords / totalRounds) * 100;
}
