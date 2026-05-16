import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  rowCount?: number;
  error?: string;
}> {
  try {
    const { count, error } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, rowCount: count ?? 0 };
  } catch (error: any) {
    return { ok: false, error: error.message ?? 'Bilinmeyen hata' };
  }
}
