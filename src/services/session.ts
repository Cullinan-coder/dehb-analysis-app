import { supabase } from './supabase';

// ───────────────────────────────────────
// Oturum (sessions) yönetimi
// ───────────────────────────────────────

/**
 * Yeni oturum başlat.
 * game_type opsiyonel — sonradan updateSessionSummary ile de set edilebilir.
 */
export async function createSession(childId: string, gameType?: string) {
  const insertData: { child_id: string; game_type?: string } = {
    child_id: childId,
  };
  if (gameType) {
    insertData.game_type = gameType;
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[Session] Başlatılamadı:', error);
    return null;
  }

  return data;
}

/**
 * Oturumu bitir — basit version (geri uyumlu).
 * Yeni kodlarda updateSessionSummary tercih edilmeli.
 */
export async function endSession(
  sessionId: string,
  focusScore: number,
  durationMs?: number
) {
  const updateData: {
    ended_at: string;
    focus_score: number;
    duration_ms?: number;
  } = {
    ended_at: new Date().toISOString(),
    focus_score: focusScore,
  };
  if (durationMs !== undefined) {
    updateData.duration_ms = durationMs;
  }

  const { error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId);

  if (error) {
    console.error('[Session] Bitirilemedi:', error);
  }
}

/**
 * Oturum bitiminde DETAYLI özet yaz.
 * Bu fonksiyon endSession'ı kapsar — onun yerine bunu çağır.
 */
export type SessionSummary = {
  focusScore: number;
  durationMs?: number;
  gameType: string;
  totalCorrect: number;
  totalWrong: number;
  totalTaps: number;
  totalBreaks: number;
  preExitCount: number;
};

export async function updateSessionSummary(
  sessionId: string,
  summary: SessionSummary
) {
  const updateData: Record<string, any> = {
    ended_at: new Date().toISOString(),
    focus_score: summary.focusScore,
    game_type: summary.gameType,
    total_correct: summary.totalCorrect,
    total_wrong: summary.totalWrong,
    total_taps: summary.totalTaps,
    total_breaks: summary.totalBreaks,
    pre_exit_count: summary.preExitCount,
  };
  if (summary.durationMs !== undefined) {
    updateData.duration_ms = summary.durationMs;
  }

  const { error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId);

  if (error) {
    console.error('[Session] Özet güncellenemedi:', error);
  }
}

// ───────────────────────────────────────
// Davranışsal sinyaller (behavioral_events)
// ───────────────────────────────────────

export async function saveBehavioralEvent(
  sessionId: string,
  eventType: string,
  payload: object
) {
  const { error } = await supabase
    .from('behavioral_events')
    .insert({
      session_id: sessionId,
      event_type: eventType,
      payload,
    });

  if (error) {
    console.error('[Event] Kaydedilemedi:', error);
  }
}

// ───────────────────────────────────────
// Görev (tasks) — ROUND BAZLI ÖZET
// ───────────────────────────────────────

export type TaskRecord = {
  sessionId: string;
  gameType: string;            // 'letter_hunt' | 'frog_jump' | 'detective' | 'bubbles' | 'robot_factory'
  roundIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMs: number;
  correctCount: number;
  wrongCount: number;
  totalTaps: number;
  avgReactionMs: number;
  completed: boolean;          // round başarıyla tamamlandı mı
  skillTarget?: string;        // opsiyonel: hedef harf/sayı/kelime (analiz için)
};

/**
 * Bir round bitince çağrılır.
 * tasks tablosuna ÖZET kayıt atar.
 */
export async function saveTask(task: TaskRecord) {
  const { error } = await supabase
    .from('tasks')
    .insert({
      session_id: task.sessionId,
      game_type: task.gameType,
      round_index: task.roundIndex,
      difficulty_text: task.difficulty,
      duration_ms: task.durationMs,
      correct_count: task.correctCount,
      wrong_count: task.wrongCount,
      total_taps: task.totalTaps,
      avg_reaction_ms: task.avgReactionMs,
      completed: task.completed,
      type: task.gameType,                  // eski "type" kolonu — game_type ile aynı değer
      skill_target: task.skillTarget ?? null,
    });

  if (error) {
    console.error('[Task] Kaydedilemedi:', error);
  }
}
