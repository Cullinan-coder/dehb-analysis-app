import { FlexConfig, FlexRound, FlexItem, RuleType, ItemColor, ItemShape } from './types';

export const DEFAULT_CONFIG: FlexConfig = {
  totalRounds: 15,
  roundsPerPhase: 5,
  roundTimeoutMs: 8000,
  perseverationWindow: 2,
};

const COLORS: ItemColor[] = ['red', 'blue', 'green', 'yellow'];
const SHAPES: ItemShape[] = ['square', 'circle', 'triangle', 'star'];

// Faz sırası: 3 faz × 5 round = 15
export const RULE_SEQUENCE: RuleType[] = ['color-red', 'shape-square', 'color-blue'];

export function getRuleForRound(roundIndex: number, config: FlexConfig = DEFAULT_CONFIG): RuleType {
  const phaseIndex = Math.min(Math.floor(roundIndex / config.roundsPerPhase), RULE_SEQUENCE.length - 1);
  return RULE_SEQUENCE[phaseIndex];
}

export function isRuleSwitchRound(roundIndex: number, config: FlexConfig = DEFAULT_CONFIG): boolean {
  return roundIndex > 0 && roundIndex % config.roundsPerPhase === 0;
}

export function isInPerseverationWindow(roundIndex: number, config: FlexConfig = DEFAULT_CONFIG): boolean {
  const positionInPhase = roundIndex % config.roundsPerPhase;
  // İlk fazda perseverasyon yok (kural değişmedi)
  if (roundIndex < config.roundsPerPhase) return false;
  return positionInPhase < config.perseverationWindow;
}

function matchesRule(item: FlexItem, rule: RuleType): boolean {
  switch (rule) {
    case 'color-red':    return item.color === 'red';
    case 'color-blue':   return item.color === 'blue';
    case 'shape-square': return item.shape === 'square';
    case 'shape-circle': return item.shape === 'circle';
  }
}

export function generateRound(roundIndex: number, config: FlexConfig = DEFAULT_CONFIG): FlexRound {
  const rule = getRuleForRound(roundIndex, config);
  const items: FlexItem[] = [];

  const correctItem: FlexItem = (() => {
    switch (rule) {
      case 'color-red':    return { id: 'c0', color: 'red',    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)] };
      case 'color-blue':   return { id: 'c0', color: 'blue',   shape: SHAPES[Math.floor(Math.random() * SHAPES.length)] };
      case 'shape-square': return { id: 'c0', color: COLORS[Math.floor(Math.random() * COLORS.length)], shape: 'square' };
      case 'shape-circle': return { id: 'c0', color: COLORS[Math.floor(Math.random() * COLORS.length)], shape: 'circle' };
    }
  })();
  items.push(correctItem);

  let attempts = 0;
  while (items.length < 4 && attempts < 50) {
    attempts++;
    const candidate: FlexItem = {
      id: `d${items.length}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    };
    if (!matchesRule(candidate, rule)) items.push(candidate);
  }
  const shuffled = items.sort(() => Math.random() - 0.5);
  return {
    rule,
    items: shuffled,
    correctItemId: correctItem.id,
    startedAt: Date.now(),
    isRuleSwitchRound: isRuleSwitchRound(roundIndex, config),
  };
}

export function ruleLabel(rule: RuleType): string {
  switch (rule) {
    case 'color-red':    return '🔴 KIRMIZILARI bul';
    case 'color-blue':   return '🔵 MAVİLERİ bul';
    case 'shape-square': return '⬛ KARELERİ bul';
    case 'shape-circle': return '⭕ DAİRELERİ bul';
  }
}

/**
 * Performans: (correctCount / 15) × 100 − (perseverationErrors × 5)
 */
export function calculatePerformance(
  correctCount: number,
  perseverationErrors: number,
  totalRounds: number = DEFAULT_CONFIG.totalRounds
): number {
  const base = (correctCount / totalRounds) * 100;
  const penalty = perseverationErrors * 5;
  return Math.max(0, base - penalty);
}
