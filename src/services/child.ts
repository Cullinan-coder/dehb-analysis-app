import { supabase } from './supabase';

export type Child = {
  id: string;            // "0001" formatında (UI için)
  rawId: number;         // DB'deki gerçek bigint
  child_name: string;
  age: number;
  parent_name: string;
  parent_email: string;
};

function formatChildId(id: number): string {
  return String(id).padStart(4, '0');
}

/**
 * Yeni çocuk + veli kaydı oluşturur.
 * Karar: her giriş yeni kayıt açar (aynı mail tekrar girse bile).
 */
export async function createChild(params: {
  childName: string;
  age: number;
  parentName: string;
  parentEmail: string;
}): Promise<Child | null> {
  const { data, error } = await supabase
    .from('children')
    .insert({
      child_name: params.childName,
      age: params.age,
      parent_name: params.parentName,
      parent_email: params.parentEmail,
    })
    .select('id, child_name, age, parent_name, parent_email')
    .single();

  if (error) {
    console.error('[Child] createChild failed:', error);
    return null;
  }

  return {
    id: formatChildId(data.id),
    rawId: data.id,
    child_name: data.child_name,
    age: data.age,
    parent_name: data.parent_name,
    parent_email: data.parent_email,
  };
}

/**
 * Verilen "0001" formatındaki id'ye karşılık gelen çocuğu getirir.
 */
export async function getChild(childId: string): Promise<Child | null> {
  const rawId = parseInt(childId, 10);
  if (isNaN(rawId)) {
    console.error('[Child] Invalid childId format:', childId);
    return null;
  }

  const { data, error } = await supabase
    .from('children')
    .select('id, child_name, age, parent_name, parent_email')
    .eq('id', rawId)
    .single();

  if (error) {
    console.error('[Child] getChild failed:', error);
    return null;
  }

  return {
    id: formatChildId(data.id),
    rawId: data.id,
    child_name: data.child_name,
    age: data.age,
    parent_name: data.parent_name,
    parent_email: data.parent_email,
  };
}
