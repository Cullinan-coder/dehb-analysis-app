import { create } from 'zustand';

interface GameState {
  // Çocuk bilgisi
  childId: string | null;
  childAge: number | null;
  scoreRowId: string | null;

  // Oturum
  sessionId: string | null;
  sessionStarted: boolean;
  completedTasks: number;
  totalTasks: number;
  breakCount: number;

  // Tamamlanan oyunlar (Supabase'den okunup buraya cache'lenir)
  completedGames: {
    game1: boolean;
    game2: boolean;
    game3: boolean;
    game4: boolean;
    game5: boolean;
  };

  // Aksiyonlar
  setChild: (id: string, age: number) => void;
  startSession: (sessionId: string) => void;
  endSession: () => void;
  completeTask: () => void;
  incrementBreak: () => void;
  setScoreRowId: (id: string | null) => void;
  setCompletedGames: (games: GameState['completedGames']) => void;
  markGameCompleted: (slot: 'game1' | 'game2' | 'game3' | 'game4' | 'game5') => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  childId: null,
  childAge: null,
  scoreRowId: null,
  sessionId: null,
  sessionStarted: false,
  completedTasks: 0,
  totalTasks: 10,
  breakCount: 0,
  completedGames: {
    game1: false,
    game2: false,
    game3: false,
    game4: false,
    game5: false,
  },

  setChild: (id, age) => set({ childId: id, childAge: age }),

  startSession: (sessionId) => set({
    sessionId,
    sessionStarted: true,
    completedTasks: 0,
    totalTasks: 10,
    breakCount: 0,
  }),

  endSession: () => set({
    sessionId: null,
    sessionStarted: false,
  }),

  completeTask: () => set((state) => ({
    completedTasks: state.completedTasks + 1,
  })),

  incrementBreak: () => set((state) => ({
    breakCount: state.breakCount + 1,
  })),

  setScoreRowId: (id) => set({ scoreRowId: id }),

  setCompletedGames: (games) => set({ completedGames: games }),

  markGameCompleted: (slot) => set((state) => ({
    completedGames: { ...state.completedGames, [slot]: true },
  })),

  reset: () => set({
    childId: null,
    childAge: null,
    sessionId: null,
    sessionStarted: false,
    scoreRowId: null,
    completedTasks: 0,
    totalTasks: 10,
    breakCount: 0,
    completedGames: {
      game1: false,
      game2: false,
      game3: false,
      game4: false,
      game5: false,
    },
  }),
}));
