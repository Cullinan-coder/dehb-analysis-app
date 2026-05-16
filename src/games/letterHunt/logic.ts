import {
  LetterHuntConfig,
  LetterHuntRound,
  LetterChoice,
  LetterHuntDifficulty,
  DifficultySettings,
} from './types';

// Türkçe alfabe — DEHB'li çocukların karıştırdığı b/d/p ve m/n/u ayrı ayrı temsil edilsin
const TURKISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'İ', 'K',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z',
];

export const DIFFICULTY_PRESETS: Record<LetterHuntDifficulty, DifficultySettings> = {
  easy: {
    choicesPerRound: 4,
    fontSize: 96,
  },
  medium: {
    choicesPerRound: 6,
    fontSize: 72,
  },
  hard: {
    choicesPerRound: 8,
    fontSize: 56,
  },
};

export const DEFAULT_CONFIG: LetterHuntConfig = {
  totalRounds: 10,
  choicesPerRound: 6,
  alphabet: TURKISH_ALPHABET,
  difficulty: 'medium',
};

export function getConfigForDifficulty(
  difficulty: LetterHuntDifficulty
): LetterHuntConfig {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return {
    totalRounds: 10,
    choicesPerRound: preset.choicesPerRound,
    alphabet: TURKISH_ALPHABET,
    difficulty,
  };
}

export function generateRound(config: LetterHuntConfig = DEFAULT_CONFIG): LetterHuntRound {
  const { choicesPerRound, alphabet } = config;

  const target = alphabet[Math.floor(Math.random() * alphabet.length)];
  const distractorPool = alphabet.filter((l) => l !== target);

  const shuffledDistractors = [...distractorPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, choicesPerRound - 1);

  const choices: LetterChoice[] = shuffledDistractors.map((letter) => ({
    letter,
    isTarget: false,
  }));

  const targetPosition = Math.floor(Math.random() * choicesPerRound);
  choices.splice(targetPosition, 0, { letter: target, isTarget: true });

  return {
    target,
    choices,
    startedAt: Date.now(),
  };
}

export function evaluateTap(
  round: LetterHuntRound,
  tappedLetter: string
): { correct: boolean; reactionTimeMs: number } {
  return {
    correct: tappedLetter === round.target,
    reactionTimeMs: Date.now() - round.startedAt,
  };
}
