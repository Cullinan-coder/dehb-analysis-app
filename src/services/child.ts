import { supabase } from './supabase';

// Yeni çocuk profili oluştur
export async function createChild(age: number) {
  const { data, error } = await supabase
    .from('children')
    .insert({ age })
    .select()
    .single();

  if (error) {
    console.error('Çocuk profili oluşturulamadı:', error);
    return null;
  }

  return data;
}

// Çocuk profilini getir
export async function getChild(childId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (error) {
    console.error('Çocuk profili alınamadı:', error);
    return null;
  }

  return data;
}
