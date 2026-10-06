const enc = new TextEncoder();
async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
}
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return Response.json({ error:'Admin belum dikonfigurasi di Cloudflare.' }, { status:503 });
  if (String(body.email || '').trim().toLowerCase() !== env.ADMIN_EMAIL.toLowerCase() || String(body.password || '') !== env.ADMIN_PASSWORD) return Response.json({ error:'Email atau password salah.' }, { status:401 });
  const exp = Math.floor(Date.now()/1000) + 60*60*24*7;
  const value = env.ADMIN_EMAIL + '.' + exp;
  const token = value + '.' + await sign(value, env.ADMIN_SESSION_SECRET);
  return new Response(JSON.stringify({ ok:true, email:env.ADMIN_EMAIL }), { headers:{'Content-Type':'application/json','Set-Cookie':'mgh_admin='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800'} });
}