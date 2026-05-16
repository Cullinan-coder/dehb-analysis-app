import { supabase } from './supabase';

export type GameSlot = 'game1' | 'game2' | 'game3' | 'game4' | 'game5';

export const GAME_SLOT_MAP: Record<string, GameSlot> = {
  'letter-hunt':   'game1',
  'frog-jump':     'game2',
  'detective':     'game3',
  'bubbles':       'game4',
  'robot-factory': 'game5',
};

// Example weights — will be tuned later. Only this object needs editing to change them.
export const GAME_WEIGHTS: Record<GameSlot, number> = {
  game1: 2,
  game2: 4,
  game3: 6,
  game4: 8,
  game5: 10,
};

/**
 * Upserts the current session's child_scores row.
 * - If scoreRowId is null: INSERTs a new row, returns its id.
 * - Else: UPDATEs the existing row.
 * Score = correctCount * weight (weight comes from GAME_WEIGHTS).
 */
export async function upsertGameScore(params: {
  scoreRowId: string | null;
  childId: string;
  age: number;
  gameRoute: string;
  correctCount: number;
}): Promise<{ scoreRowId: string | null; error?: string }> {
  const slot = GAME_SLOT_MAP[params.gameRoute];
  if (!slot) {
    return { scoreRowId: params.scoreRowId, error: `Unknown game route: ${params.gameRoute}` };
  }

  const weight = GAME_WEIGHTS[slot];
  const weightedScore = params.correctCount * weight;

  if (!params.scoreRowId) {
    const { data, error } = await supabase
      .from('child_scores')
      .insert({
        child_id: params.childId,
        age: params.age,
        [slot]: weightedScore,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ChildScores] INSERT failed:', error);
      return { scoreRowId: null, error: error.message };
    }
    console.log(`[ChildScores] New row created: ${data.id}, ${slot}=${weightedScore}`);
    return { scoreRowId: data.id };
  }

  const { error } = await supabase
    .from('child_scores')
    .update({ [slot]: weightedScore })
    .eq('id', params.scoreRowId);

  if (error) {
    console.error('[ChildScores] UPDATE failed:', error);
    return { scoreRowId: params.scoreRowId, error: error.message };
  }
  console.log(`[ChildScores] Updated row ${params.scoreRowId}: ${slot}=${weightedScore}`);
  return { scoreRowId: params.scoreRowId };
}
