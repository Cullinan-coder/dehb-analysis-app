import { supabase } from './supabase';

export type GameSlot = 'game1' | 'game2' | 'game3' | 'game4' | 'game5';

export const GAME_SLOT_MAP: Record<string, GameSlot> = {
  'letter-hunt':  'game1',
  'bubbles':      'game2',
  'robot-factory':'game3',
  'rhythm':       'game4',
  'flexibility':  'game5',
};

// Zorluk ağırlıkları — bilişsel yük arttıkça katsayı artar
export const GAME_WEIGHTS: Record<GameSlot, number> = {
  game1: 2,   // Letter Hunt — görsel arama
  game2: 4,   // Bubbles — Go/No-Go inhibisyon
  game3: 6,   // Robot Factory — çalışma belleği
  game4: 8,   // Rhythm — zaman algısı
  game5: 10,  // Flexibility — set-shifting
};

export async function getChildScores(childId: string): Promise<{
  id: string;
  child_id: number;
  age: number;
  game1: number | null;
  game2: number | null;
  game3: number | null;
  game4: number | null;
  game5: number | null;
} | null> {
  const rawChildId = parseInt(childId, 10);
  if (isNaN(rawChildId)) {
    console.error('[ChildScores] Invalid childId:', childId);
    return null;
  }
  const { data, error } = await supabase
    .from('child_scores')
    .select('id, child_id, age, game1, game2, game3, game4, game5')
    .eq('child_id', rawChildId)
    .maybeSingle();
  if (error) {
    console.error('[ChildScores] getChildScores failed:', error);
    return null;
  }
  return data;
}

/**
 * Performans skoru (0-100) × zorluk ağırlığı → final integer skor.
 * Her oyun ekranı kendi performans yüzdesini hesaplayıp bu fonksiyonu çağırır.
 */
export async function upsertGameScore(params: {
  scoreRowId: string | null;
  childId: string;
  age: number;
  gameRoute: string;
  performance: number; // 0-100 arası
}): Promise<{ scoreRowId: string | null; error?: string }> {
  const slot = GAME_SLOT_MAP[params.gameRoute];
  if (!slot) {
    return { scoreRowId: params.scoreRowId, error: `Unknown game route: ${params.gameRoute}` };
  }
  // Performansı 0-100'e clamp et
  const clampedPerformance = Math.max(0, Math.min(100, params.performance));
  const weight = GAME_WEIGHTS[slot];
  const finalScore = Math.round(clampedPerformance * weight);

  if (!params.scoreRowId) {
    const { data, error } = await supabase
      .from('child_scores')
      .insert({
        child_id: parseInt(params.childId, 10),
        age: params.age,
        [slot]: finalScore,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[ChildScores] INSERT failed:', error);
      return { scoreRowId: null, error: error.message };
    }
    console.log(`[ChildScores] New row: ${data.id}, ${slot}=${finalScore} (perf=${clampedPerformance})`);
    return { scoreRowId: data.id };
  }

  const { error } = await supabase
    .from('child_scores')
    .update({ [slot]: finalScore })
    .eq('id', params.scoreRowId);
  if (error) {
    console.error('[ChildScores] UPDATE failed:', error);
    return { scoreRowId: params.scoreRowId, error: error.message };
  }
  console.log(`[ChildScores] Updated ${params.scoreRowId}: ${slot}=${finalScore} (perf=${clampedPerformance})`);
  return { scoreRowId: params.scoreRowId };
}
