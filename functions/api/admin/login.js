import { verifyPassword, createSessionToken, SESSION_SECONDS } from '../../../server/auth.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET) return Response.json({ error: 'Admin belum dikonfigurasi di Cloudflare.' }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const emailOk = String(body.email || '').trim().toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
  const passOk = await verifyPassword(String(body.password || ''), env.ADMIN_PASSWORD_HASH);
  if (!emailOk || !passOk) return Response.json({ error: 'Email atau password salah.' }, { status: 401 });
  const token = await createSessionToken(env);
  return new Response(JSON.stringify({ ok: true, email: env.ADMIN_EMAIL }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Set-Cookie': `mgh_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}` } });
}
