const notFound = () => new Response('Gambar tidak ditemukan.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ env, params }) {
  if (!env.MGH_IMAGES) return new Response('Penyimpanan gambar belum dikonfigurasi.', { status: 503 });
  const parts = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean);
  const key = parts.join('/');
  if (!key || key.startsWith('/') || key.split('/').some(part => !part || part === '.' || part === '..' || !/^[a-zA-Z0-9._-]+$/.test(part))) return notFound();
  const object = await env.MGH_IMAGES.get(key);
  if (!object) return notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Cache-Control', object.httpMetadata?.cacheControl || 'public, max-age=86400');
  return new Response(object.body, { headers });
}
