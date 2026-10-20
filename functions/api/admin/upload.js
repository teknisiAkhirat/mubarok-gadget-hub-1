import { isAuthorized } from '../../../server/auth.js';

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', magic: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a },
  'image/webp': { ext: 'webp', magic: (b) => b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP' },
  'image/gif': { ext: 'gif', magic: (b) => b.length >= 6 && ['GIF87a', 'GIF89a'].includes(String.fromCharCode(...b.slice(0, 6))) },
};

export async function onRequestPost({ request, env }) {
  if (!(await isAuthorized(request, env))) return json({ error: 'Sesi admin tidak valid. Silakan login kembali.' }, 401);
  if (!env.MGH_IMAGES) return json({ error: 'Penyimpanan gambar Cloudflare belum terhubung. Binding R2 MGH_IMAGES perlu dikonfigurasi.' }, 503);
  const form = await request.formData().catch(() => null);
  const file = form?.get('image');
  if (!file || typeof file.arrayBuffer !== 'function') return json({ error: 'Pilih gambar terlebih dahulu.' }, 400);
  if (!file.size || file.size > MAX_BYTES) return json({ error: 'Ukuran gambar harus di bawah 8 MB.' }, 413);
  const type = TYPES[file.type];
  if (!type) return json({ error: 'Format yang didukung: JPG, PNG, WEBP, atau GIF.' }, 415);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.magic(bytes)) return json({ error: 'Isi file tidak cocok dengan format gambar.' }, 415);
  const key = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${type.ext}`;
  try {
    await env.MGH_IMAGES.put(key, bytes, {
      httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
      customMetadata: { originalName: String(file.name || 'image').slice(0, 120) },
    });
    return json({ ok: true, key, url: `/api/images/${key}` }, 201);
  } catch (error) {
    console.error('image upload failed:', String(error?.message || error));
    return json({ error: 'Gagal menyimpan gambar ke Cloudflare R2.' }, 500);
  }
}
