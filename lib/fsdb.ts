import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data', 'next');

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export type DiaryEntry = { id: string; date: string; content: string; createdAt: string };
export type DailySummary = { date: string; summaryText: string; updatedAt: string };
export type DailyComment = { date: string; characterId: string; commentText: string; generatedAt: string; model?: string };

function fileFor(name: string) {
  return path.join(dataDir, `${name}.json`);
}

async function readJson<T>(name: string, def: T): Promise<T> {
  await ensureDir();
  try {
    const f = await fs.readFile(fileFor(name), 'utf-8');
    return JSON.parse(f);
  } catch {
    return def;
  }
}

async function writeJson<T>(name: string, data: T): Promise<void> {
  await ensureDir();
  await fs.writeFile(fileFor(name), JSON.stringify(data, null, 2), 'utf-8');
}

export async function listEntries(date: string): Promise<DiaryEntry[]> {
  const all = await readJson<Record<string, DiaryEntry[]>>('entries', {});
  return all[date] || [];
}

export async function addEntry(date: string, content: string): Promise<DiaryEntry> {
  const all = await readJson<Record<string, DiaryEntry[]>>('entries', {});
  const entry: DiaryEntry = {
    id: 'en_' + Math.random().toString(36).slice(2, 10),
    date,
    content,
    createdAt: new Date().toISOString(),
  };
  all[date] = [entry, ...(all[date] || [])];
  await writeJson('entries', all);
  return entry;
}

export async function getSummary(date: string): Promise<DailySummary | null> {
  const all = await readJson<Record<string, DailySummary>>('summaries', {});
  return all[date] || null;
}

export async function upsertSummary(date: string, summaryText: string): Promise<DailySummary> {
  const all = await readJson<Record<string, DailySummary>>('summaries', {});
  const rec: DailySummary = { date, summaryText, updatedAt: new Date().toISOString() };
  all[date] = rec;
  await writeJson('summaries', all);
  return rec;
}

export async function listComments(date: string): Promise<DailyComment[]> {
  const all = await readJson<Record<string, DailyComment[]>>('comments', {});
  return all[date] || [];
}

export async function upsertComment(date: string, characterId: string, commentText: string, model?: string): Promise<DailyComment> {
  const all = await readJson<Record<string, DailyComment[]>>('comments', {});
  const rec: DailyComment = { date, characterId, commentText, model, generatedAt: new Date().toISOString() };
  const arr = all[date] || [];
  const idx = arr.findIndex((c) => c.characterId === characterId);
  if (idx >= 0) arr[idx] = rec; else arr.push(rec);
  all[date] = arr;
  await writeJson('comments', all);
  return rec;
}

export async function listEntryCountsByMonth(month: string): Promise<Record<string, number>> {
  // month format: YYYY-MM
  const all = await readJson<Record<string, DiaryEntry[]>>('entries', {});
  const prefix = month + '-';
  const counts: Record<string, number> = {};
  for (const [d, arr] of Object.entries(all)) {
    if (d.startsWith(prefix)) counts[d] = (arr || []).length;
  }
  return counts;
}
