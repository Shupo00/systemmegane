// Repository abstraction: switches between FS (local) and Supabase (DB)
import { addEntry as fsAdd, listEntries as fsList, getSummary as fsGetSum, upsertSummary as fsUpSum, listComments as fsListCom, upsertComment as fsUpCom } from '@/lib/fsdb';
import { getDbRepoWithClient } from '@/lib/repo.supabase';
import { CHARACTERS, type Character } from '@/lib/characters';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Entry = { id: string; date: string; content: string; createdAt: string };
export type Summary = { date: string; summaryText: string; updatedAt: string };
export type Comment = { date: string; characterId: string; commentText: string; generatedAt: string; model?: string };

export interface Repo {
  listEntries(userId: string, date: string): Promise<Entry[]>;
  addEntry(userId: string, date: string, content: string): Promise<Entry>;
  getSummary(userId: string, date: string): Promise<Summary | null>;
  upsertSummary(userId: string, date: string, summaryText: string): Promise<Summary>;
  listComments(userId: string, date: string): Promise<Comment[]>;
  upsertComment(userId: string, date: string, characterId: string, commentText: string, model?: string): Promise<Comment>;
  listEntryCountsByMonth(userId: string, month: string): Promise<Record<string, number>>;
  listCharacters(): Promise<Character[]>;
}

function isSupabaseEnabled() {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE;
}

export function getRepo(): Repo {
  if (isSupabaseEnabled()) throw new Error('Call getRepoForRequest with a Supabase client in RLS mode');
  // FS fallback ignores userId
  return {
    listEntries: async (_u, d) => fsList(d),
    addEntry: async (_u, d, c) => fsAdd(d, c),
    getSummary: async (_u, d) => fsGetSum(d),
    upsertSummary: async (_u, d, s) => fsUpSum(d, s),
    listComments: async (_u, d) => fsListCom(d),
    upsertComment: async (_u, d, ch, txt, m) => fsUpCom(d, ch, txt, m),
    listEntryCountsByMonth: async (_u, month) => (await import('@/lib/fsdb')).listEntryCountsByMonth(month),
    listCharacters: async () => CHARACTERS.map((c) => ({
      ...c,
      // Prefer name-based PNG (for Japanese filenames), else id-based PNG fallback
      icon: `/characters/${encodeURIComponent(c.name)}.png`,
    })),
  };
}

export function getRepoForRequest(client: SupabaseClient | null): Repo {
  if (client) return getDbRepoWithClient(client);
  return {
    listEntries: async (_u, d) => fsList(d),
    addEntry: async (_u, d, c) => fsAdd(d, c),
    getSummary: async (_u, d) => fsGetSum(d),
    upsertSummary: async (_u, d, s) => fsUpSum(d, s),
    listComments: async (_u, d) => fsListCom(d),
    upsertComment: async (_u, d, ch, txt, m) => fsUpCom(d, ch, txt, m),
    listEntryCountsByMonth: async (_u, month) => (await import('@/lib/fsdb')).listEntryCountsByMonth(month),
    listCharacters: async () => CHARACTERS.map((c) => ({
      ...c,
      icon: `/characters/${encodeURIComponent(c.name)}.png`,
    })),
  };
}
