import { LetterHuntConfig, LetterHuntRound, LetterChoice } from './types';
import { GAME_CONFIG } from '../../config/demoMode';

const TURKISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'İ', 'K',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z',
];

export const DEFAULT_CONFIG: LetterHuntConfig = {
  totalRounds: GAME_CONFIG.letterHunt.totalRounds,
  choicesPerRound: 6,
  roundTimeoutMs: GAME_CONFIG.letterHunt.roundTimeoutMs,
  alphabet: TURKISH_ALPHABET,
};

export function generateRound(config: LetterHuntConfig = DEFAULT_CONFIG): LetterHuntRound {
  const { choicesPerRound, alphabet } = config;
  const target = alphabet[Math.floor(Math.random() * alphabet.length)];
  const distractorPool = alphabet.filter((l) => l !== target);
  const shuffledDistractors = [...distractorPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, choicesPerRound - 1);
  const choices: LetterChoice[] = shuffledDistractors.map((letter) => ({ letter, isTarget: false }));
  const targetPosition = Math.floor(Math.random() * choicesPerRound);
  choices.splice(targetPosition, 0, { letter: target, isTarget: true });
  return { target, choices, startedAt: Date.now() };
}

export function calculatePerformance(correctCount: number, totalRounds: number): number {
  return (correctCount / totalRounds) * 100;
}
