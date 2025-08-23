import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'items.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify({ items: [] }, null, 2), 'utf-8');
  }
}

async function readItems() {
  await ensureDataFile();
  const text = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(text).items || [];
}

async function writeItems(items) {
  await fs.writeFile(dataFile, JSON.stringify({ items }, null, 2), 'utf-8');
}

// API: list/search items
app.get('/api/items', async (req, res) => {
  try {
    const q = (req.query.query || '').toString().trim().toLowerCase();
    const items = await readItems();
    const result = q
      ? items.filter(
          (it) => it.title.toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q)
        )
      : items;
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'failed_to_read', detail: String(e) });
  }
});

// API: create item
app.post('/api/items', async (req, res) => {
  try {
    const { title, description } = req.body || {};
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'invalid_title' });
    }
    const now = new Date().toISOString();
    const item = {
      id: 'it_' + Math.random().toString(36).slice(2, 10),
      title: title.trim(),
      description: (description || '').toString().trim(),
      createdAt: now,
    };
    const items = await readItems();
    items.unshift(item);
    await writeItems(items);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: 'failed_to_write', detail: String(e) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});

