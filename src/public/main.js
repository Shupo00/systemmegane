const $ = (sel) => document.querySelector(sel);

async function fetchItems(query = '') {
  const url = new URL('/api/items', window.location.origin);
  if (query) url.searchParams.set('query', query);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

function renderItems(items) {
  const list = $('#items');
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = '<li class="empty">アイテムがありません</li>';
    return;
  }
  for (const it of items) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="title">${escapeHtml(it.title)}</div>
      <div class="desc">${escapeHtml(it.description || '')}</div>
      <div class="meta">${new Date(it.createdAt).toLocaleString()}</div>
    `;
    list.appendChild(li);
  }
}

function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function onCreate(e) {
  e.preventDefault();
  const title = $('#title').value.trim();
  const description = $('#description').value.trim();
  const msg = $('#create-msg');
  msg.textContent = '';
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || '作成に失敗しました');
    }
    $('#title').value = '';
    $('#description').value = '';
    await refresh();
    msg.textContent = '作成しました';
    msg.className = 'msg ok';
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'msg err';
  }
}

async function refresh() {
  const q = $('#query').value.trim();
  const items = await fetchItems(q);
  renderItems(items);
}

document.addEventListener('DOMContentLoaded', () => {
  $('#create-form').addEventListener('submit', onCreate);
  $('#query').addEventListener('input', () => {
    refresh();
  });
  refresh();
});

