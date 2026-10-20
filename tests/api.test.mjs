import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequest as admin } from '../functions/api/admin/[[path]].js';
import { onRequestPost as login } from '../functions/api/admin/login.js';
import { onRequestPost as uploadImage } from '../functions/api/admin/upload.js';
import { onRequestGet as getImage } from '../functions/api/images/[[path]].js';
import { onRequestGet as catalog } from '../functions/api/catalog.js';
import { hashPassword, createSessionToken, isAuthorized } from '../server/auth.js';

function makeDb() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  raw.exec(readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'));
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    all: async () => ({ results: raw.prepare(sql).all(...args) }),
    first: async () => raw.prepare(sql).get(...args) ?? null,
    run: async () => { const r = raw.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; },
  });
  return { prepare: (sql) => stmt(sql) };
}
const SECRET = 'test-secret-value-test-secret-value';
async function env() {
  return { MGH_DB: makeDb(), ADMIN_EMAIL: 'owner@mubarok.test', ADMIN_PASSWORD_HASH: await hashPassword('password-uji-12345', 2000), ADMIN_SESSION_SECRET: SECRET };
}
const cookie = async (e) => 'mgh_admin=' + (await createSessionToken(e));
const call = (e, method, path, body, ck) => admin({ env: e, params: { path }, request: new Request('http://x/api/admin/' + path.join('/'), { method, headers: { 'Content-Type': 'application/json', ...(ck ? { Cookie: ck } : {}) }, body: body && !['GET','DELETE'].includes(method) ? JSON.stringify(body) : undefined }) });
const good = { name: 'LCD Samsung A12', sku: 'LCD-A12', price: 285000, cost_price: 200000, stock: 3, condition: 'original', description: 'Tes' };

test('tanpa login semua method admin ditolak 401', async () => {
  const e = await env();
  for (const m of ['GET', 'POST', 'PATCH', 'DELETE']) assert.equal((await call(e, m, ['products', '1'], good)).status, 401);
  assert.equal((await call(e, 'GET', ['products'], null, 'mgh_admin=1.palsu')).status, 401);
});
test('login: salah ditolak, benar dapat cookie HttpOnly Secure', async () => {
  const e = await env();
  const mk = (b) => login({ env: e, request: new Request('http://x', { method: 'POST', body: JSON.stringify(b) }) });
  assert.equal((await mk({ email: 'owner@mubarok.test', password: 'salah' })).status, 401);
  assert.equal((await mk({ email: 'x@y.z', password: 'password-uji-12345' })).status, 401);
  const ok = await mk({ email: 'owner@mubarok.test', password: 'password-uji-12345' });
  assert.equal(ok.status, 200);
  const sc = ok.headers.get('Set-Cookie');
  assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/);
  const c = sc.split(';')[0];
  assert.equal(await isAuthorized(new Request('http://x', { headers: { Cookie: c } }), e), true);
});
test('email berisi titik tetap bisa login (bug lama)', async () => {
  const e = await env();
  assert.equal(await isAuthorized(new Request('http://x', { headers: { Cookie: await cookie(e) } }), e), true);
});
test('token kedaluwarsa ditolak', async () => {
  const e = await env();
  const t = await createSessionToken(e, Date.now() - 8 * 24 * 3600 * 1000);
  assert.equal(await isAuthorized(new Request('http://x', { headers: { Cookie: 'mgh_admin=' + t } }), e), false);
});
test('CRUD produk end-to-end + katalog publik konsisten', async () => {
  const e = await env(); const ck = await cookie(e);
  const c = await call(e, 'POST', ['products'], good, ck);
  assert.equal(c.status, 201); const row = await c.json(); assert.equal(row.slug, 'lcd-samsung-a12');
  let list = await (await call(e, 'GET', ['products'], null, ck)).json();
  assert.equal(list.length, 1);
  assert.equal((await call(e, 'PATCH', ['products', String(row.id)], { ...good, price: 300000, stock: 0 }, ck)).status, 200);
  let pub = await (await catalog({ env: e })).json();
  assert.equal(pub.products[0].price, 300000);
  assert.equal(pub.products[0].stock, 0);
  assert.equal('cost_price' in pub.products[0], false, 'harga modal tidak boleh bocor ke publik');
  assert.equal((await call(e, 'PATCH', ['products', String(row.id)], { ...good, active: false }, ck)).status, 200);
  pub = await (await catalog({ env: e })).json();
  assert.equal(pub.products.length, 0);
  assert.equal((await call(e, 'DELETE', ['products', String(row.id)], null, ck)).status, 200);
  assert.equal((await call(e, 'DELETE', ['products', String(row.id)], null, ck)).status, 404);
  list = await (await call(e, 'GET', ['products'], null, ck)).json();
  assert.equal(list.length, 0);
});
test('input tidak valid ditolak server', async () => {
  const e = await env(); const ck = await cookie(e);
  for (const bad of [{ ...good, price: -1 }, { ...good, stock: 'abc' }, { ...good, name: '  ' }, { ...good, condition: 'rusak' }, { ...good, image_url: 'javascript:alert(1)' }, { ...good, price: 1.5 }, { ...good, slug: 'A B!' }]) {
    assert.equal((await call(e, 'POST', ['products'], bad, ck)).status, 400, JSON.stringify(bad));
  }
  assert.equal((await call(e, 'POST', ['products'], good, ck)).status, 201);
  assert.equal((await call(e, 'POST', ['products'], good, ck)).status, 409);
});
test('SQL injection lewat id/nama tidak berdampak', async () => {
  const e = await env(); const ck = await cookie(e);
  assert.equal((await call(e, 'DELETE', ['products', '1; DROP TABLE products'], null, ck)).status, 400);
  assert.equal((await call(e, 'POST', ['products'], { ...good, name: "x'); DROP TABLE products;--" }, ck)).status, 201);
  assert.equal((await call(e, 'GET', ['products'], null, ck)).status, 200);
  assert.equal((await call(e, 'GET', ['users'], null, ck)).status, 404);
});
test('kategori menyimpan icon', async () => {
  const e = await env(); const ck = await cookie(e);
  const r = await call(e, 'POST', ['categories'], { name: 'LCD', icon: '📱' }, ck);
  assert.equal(r.status, 201);
  assert.equal((await r.json()).icon, '📱');
});

test('upload gambar membutuhkan sesi admin dan binding R2', async () => {
  const e = await env();
  const bytes = Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00]);
  const makeRequest = async (cookieValue) => {
    const form = new FormData();
    form.append('image', new Blob([bytes], { type: 'image/png' }), 'produk.png');
    return uploadImage({ env: e, request: new Request('https://mgh.test/api/admin/upload', { method: 'POST', headers: cookieValue ? { Cookie: cookieValue } : {}, body: form }) });
  };
  assert.equal((await makeRequest(null)).status, 401);
  e.MGH_IMAGES = { put: async () => {} };
  const response = await makeRequest(await cookie(e));
  assert.equal(response.status, 201);
  assert.match((await response.json()).url, /^\/api\/images\/products\//);
});
test('upload gambar menolak format palsu dan gambar terlalu besar', async () => {
  const e = await env(); e.MGH_IMAGES = { put: async () => { throw new Error('must not store invalid image'); } };
  const ck = await cookie(e);
  const invalid = new FormData();
  invalid.append('image', new Blob(['not an image'], { type: 'image/png' }), 'bad.png');
  const bad = await uploadImage({ env: e, request: new Request('https://mgh.test/api/admin/upload', { method: 'POST', headers: { Cookie: ck }, body: invalid }) });
  assert.equal(bad.status, 415);
  const large = new FormData();
  large.append('image', new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
  const tooLarge = await uploadImage({ env: e, request: new Request('https://mgh.test/api/admin/upload', { method: 'POST', headers: { Cookie: ck }, body: large }) });
  assert.equal(tooLarge.status, 413);
});
test('endpoint gambar menyajikan object R2 dengan header aman', async () => {
  const e = await env();
  const body = new Uint8Array([1, 2, 3]);
  e.MGH_IMAGES = { get: async key => key === 'products/test.png' ? {
    body: new Response(body).body, httpEtag: '"etag-test"', httpMetadata: { contentType: 'image/png', cacheControl: 'public, max-age=3600' },
    writeHttpMetadata(headers) { headers.set('Content-Type', 'image/png'); }
  } : null };
  const response = await getImage({ env: e, params: { path: ['products', 'test.png'] } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'image/png');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [...body]);
  assert.equal((await getImage({ env: e, params: { path: ['..', 'test.png'] } })).status, 404);
});
