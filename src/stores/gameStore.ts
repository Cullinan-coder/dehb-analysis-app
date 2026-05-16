import { create } from 'zustand';
import type { AdaptiveAction } from '../services/gemini';

interface GameState {
  // Çocuk bilgisi
  childId: string | null;
  childAge: number | null;

  // Oturum
  sessionId: string | null;
  sessionStarted: boolean;
  focusScore: number;
  completedTasks: number;
  totalTasks: number;
  breakCount: number;

  // Pre-exit
  preExitScore: number;
  lastTouchTime: number;
  errorRate: number;
  pauseFrequency: number;

  // Mevcut görev
  currentTaskType: 'letter_hunt' | 'word_builder' | 'rhythm_game' | null;
  currentDifficulty: number;

  // Adaptif karar
  adaptiveAction: AdaptiveAction | null;
  adaptiveReason: string | null;
  letterHuntDifficulty: 'easy' | 'medium' | 'hard';
  showBreakModal: boolean;

  // Aksiyonlar
  setChild: (id: string, age: number) => void;
  startSession: (sessionId: string) => void;
  endSession: () => void;
  updateFocusScore: (score: number) => void;
  updatePreExitScore: (score: number) => void;
  completeTask: () => void;
  setCurrentTask: (type: GameState['currentTaskType'], difficulty: number) => void;
  incrementBreak: () => void;
  setAdaptiveDecision: (action: AdaptiveAction, reason: string) => void;
  clearAdaptiveDecision: () => void;
  setLetterHuntDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  setShowBreakModal: (show: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  childId: null,
  childAge: null,
  sessionId: null,
  sessionStarted: false,
  focusScore: 100,
  completedTasks: 0,
  totalTasks: 10,
  breakCount: 0,
  preExitScore: 0,
  lastTouchTime: Date.now(),
  errorRate: 0,
  pauseFrequency: 0,
  currentTaskType: null,
  currentDifficulty: 1,
  adaptiveAction: null,
  adaptiveReason: null,
  letterHuntDifficulty: 'medium',
  showBreakModal: false,

  setChild: (id, age) => set({ childId: id, childAge: age }),

  startSession: (sessionId) => set({
    sessionId,
    sessionStarted: true,
    focusScore: 100,
    completedTasks: 0,
    totalTasks: 10,
    breakCount: 0,
    preExitScore: 0,
  }),

  endSession: () => set({
    sessionId: null,
    sessionStarted: false,
  }),

  updateFocusScore: (score) => set({ focusScore: score }),

  updatePreExitScore: (score) => set({ preExitScore: score }),

  completeTask: () => set((state) => ({
    completedTasks: state.completedTasks + 1,
  })),

  setCurrentTask: (type, difficulty) => set({
    currentTaskType: type,
    currentDifficulty: difficulty,
  }),

  incrementBreak: () => set((state) => ({
    breakCount: state.breakCount + 1,
  })),

  setAdaptiveDecision: (action, reason) => set({
    adaptiveAction: action,
    adaptiveReason: reason,
  }),

  clearAdaptiveDecision: () => set({
    adaptiveAction: null,
    adaptiveReason: null,
  }),

  setLetterHuntDifficulty: (difficulty) => set({
    letterHuntDifficulty: difficulty,
  }),

  setShowBreakModal: (show) => set({
    showBreakModal: show,
  }),

  reset: () => set({
    sessionId: null,
    sessionStarted: false,
    focusScore: 100,
    completedTasks: 0,
    totalTasks: 10,
    breakCount: 0,
    preExitScore: 0,
    currentTaskType: null,
    currentDifficulty: 1,
    adaptiveAction: null,
    adaptiveReason: null,
    letterHuntDifficulty: 'medium',
    showBreakModal: false,
  }),
}));
