const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = (s) => Uint8Array.from(atob(String(s).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i];
  return r === 0;
}
async function hmac(value, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}
async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}
// Format: pbkdf2$<iterasi>$<salt b64u>$<hash b64u>. Workers membatasi iterasi maks 100000.
export async function hashPassword(password, iterations = 100000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${iterations}$${b64u(salt)}$${b64u(await pbkdf2(password, salt, iterations))}`;
}
export async function verifyPassword(password, stored) {
  const [scheme, iter, salt, hash] = String(stored || '').split('$');
  const n = Number(iter);
  if (scheme !== 'pbkdf2' || !salt || !hash || !(n >= 1000 && n <= 100000)) return false;
  return safeEqual(await pbkdf2(String(password), fromB64(salt), n), fromB64(hash));
}
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export async function createSessionToken(env, now = Date.now()) {
  const exp = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${exp}.${await hmac('v1.' + exp, env.ADMIN_SESSION_SECRET)}`;
}
export async function isAuthorized(request, env, now = Date.now()) {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const raw = request.headers.get('Cookie')?.match(/(?:^|; )mgh_admin=([^;]+)/)?.[1];
  const [exp, sig, extra] = String(raw || '').split('.');
  if (!exp || !sig || extra !== undefined || !/^\d+$/.test(exp) || Number(exp) < Math.floor(now / 1000)) return false;
  return safeEqual(enc.encode(sig), enc.encode(await hmac('v1.' + exp, env.ADMIN_SESSION_SECRET)));
}
