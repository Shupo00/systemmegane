import type { Repo, Entry, Summary, Comment } from '@/lib/repo';
import { CHARACTERS } from '@/lib/characters';
import type { SupabaseClient } from '@supabase/supabase-js';

export function getDbRepoWithClient(supabase: SupabaseClient): Repo {
  async function ensureUser(userId: string) {
    // Create a row in users if missing to satisfy FK constraints
    await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' });
  }

  return {
    async listEntries(userId, date) {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('id, content, created_at')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id as string, date, content: (r as any).content as string, createdAt: (r as any).created_at as string })) as Entry[];
    },
    async addEntry(userId, date, content) {
      await ensureUser(userId);
      const { data, error } = await supabase
        .from('diary_entries')
        .insert({ user_id: userId, date, content })
        .select('id, created_at')
        .single();
      if (error) throw error;
      return { id: (data as any).id, date, content, createdAt: (data as any).created_at } as Entry;
    },
    async getSummary(userId, date) {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('summary_text, updated_at')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { date, summaryText: (data as any).summary_text, updatedAt: (data as any).updated_at } as Summary;
    },
    async upsertSummary(userId, date, summaryText) {
      await ensureUser(userId);
      const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({ user_id: userId, date, summary_text: summaryText }, { onConflict: 'user_id,date' })
        .select('summary_text, updated_at')
        .single();
      if (error) throw error;
      return { date, summaryText: (data as any).summary_text, updatedAt: (data as any).updated_at } as Summary;
    },
    async listComments(userId, date) {
      const { data, error } = await supabase
        .from('daily_comments')
        .select('character_id, comment_text, generated_at, model')
        .eq('user_id', userId)
        .eq('date', date);
      if (error) throw error;
      return (data || []).map((r: any) => ({ date, characterId: r.character_id, commentText: r.comment_text, generatedAt: r.generated_at, model: r.model })) as Comment[];
    },
    async upsertComment(userId, date, characterId, commentText, model) {
      await ensureUser(userId);
      const { data, error } = await supabase
        .from('daily_comments')
        .upsert({ user_id: userId, date, character_id: characterId, comment_text: commentText, model }, { onConflict: 'user_id,date,character_id' })
        .select('character_id, comment_text, generated_at, model')
        .single();
      if (error) throw error;
      const r: any = data;
      return { date, characterId: r.character_id, commentText: r.comment_text, generatedAt: r.generated_at, model: r.model } as Comment;
    },
    async listEntryCountsByMonth(userId, month) {
      const start = new Date(month + '-01');
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('diary_entries')
        .select('date')
        .gte('date', startStr)
        .lt('date', endStr)
        .eq('user_id', userId);
      if (error) throw error;
      const out: Record<string, number> = {};
      for (const r of (data as any[]) || []) {
        const d = (r as any).date as string;
        out[d] = (out[d] || 0) + 1;
      }
      return out;
    },
    async listCharacters() {
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, code, is_premium, image_url');
      if (error) throw error;
      const defaults = new Map(CHARACTERS.map((c) => [c.id, c]));
      return (data || []).map((r: any) => {
        const d = defaults.get(r.id);
        const namePng = `/characters/${encodeURIComponent(r.name)}.png`;
        const idPng = `/characters/${r.id}.png`;
        const defaultIcon = d?.icon ? d.icon.replace('.svg', '.png') : idPng;
        const fallbackIcon = r.image_url || namePng || defaultIcon;
        return {
          id: r.id,
          name: r.name,
          code: r.code,
          premium: !!r.is_premium,
          icon: fallbackIcon,
          system: d?.system || '',
        };
      });
    },
  };
}
