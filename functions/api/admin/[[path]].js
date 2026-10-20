import { isAuthorized } from '../../../server/auth.js';
import { validators } from '../../../server/validate.js';

const TABLES = { product: 'products', products: 'products', category: 'categories', categories: 'categories', service: 'services', services: 'services', inquiry: 'inquiries', inquiries: 'inquiries' };
const ORDER = { products: 'created_at DESC', inquiries: 'created_at DESC', categories: 'sort_order ASC, name ASC', services: 'sort_order ASC, name ASC' };
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const safeTags = (t) => { try { return t ? JSON.parse(t) : []; } catch { return String(t).split(',').map((x) => x.trim()).filter(Boolean); } };

export async function onRequest({ request, env, params }) {
  if (!(await isAuthorized(request, env))) return json({ error: 'Unauthorized' }, 401);
  const parts = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean);
  const table = TABLES[parts[0]];
  if (!table) return json({ error: 'Resource tidak ditemukan.' }, 404);
  const db = env.MGH_DB;
  if (!db) return json({ error: 'Database belum dikonfigurasi.' }, 503);
  let id = null;
  if (parts[1] !== undefined) {
    if (!/^\d+$/.test(parts[1])) return json({ error: 'ID tidak valid.' }, 400);
    id = Number(parts[1]);
  }
  const method = request.method;
  try {
    if (method === 'GET') {
      const r = await db.prepare(`SELECT * FROM ${table} ORDER BY ${ORDER[table]}`).all();
      return json(r.results.map((row) => ({ ...row, active: Boolean(row.is_active), featured: Boolean(row.is_featured), tags: safeTags(row.tags) })));
    }
    if (method === 'DELETE') {
      if (id === null) return json({ error: 'ID wajib.' }, 400);
      const r = await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
      return r.meta?.changes ? json({ ok: true }) : json({ error: 'Data tidak ditemukan.' }, 404);
    }
    if (!['POST', 'PATCH'].includes(method)) return json({ error: 'Method tidak didukung.' }, 405);
    if (table === 'inquiries' && method !== 'PATCH') return json({ error: 'Method tidak didukung.' }, 405);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Body JSON tidak valid.' }, 400);
    const { errors, data } = validators[table](body);
    if (errors.length) return json({ error: errors[0], errors }, 400);
    const cols = Object.keys(data);
    const vals = cols.map((k) => data[k]);
    if (method === 'POST') {
      const row = await db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) RETURNING *`).bind(...vals).first();
      return json(row, 201);
    }
    if (id === null) return json({ error: 'ID wajib.' }, 400);
    const r = await db.prepare(`UPDATE ${table} SET ${cols.map((c) => c + '=?').join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...vals, id).run();
    return r.meta?.changes ? json({ ok: true }) : json({ error: 'Data tidak ditemukan.' }, 404);
  } catch (e) {
    const msg = String(e?.message || '');
    if (/UNIQUE/i.test(msg)) return json({ error: 'Slug atau SKU sudah dipakai.' }, 409);
    if (/FOREIGN KEY|CHECK constraint/i.test(msg)) return json({ error: 'Data tidak valid.' }, 400);
    console.error('admin api error:', msg);
    return json({ error: 'Terjadi kesalahan server.' }, 500);
  }
}
