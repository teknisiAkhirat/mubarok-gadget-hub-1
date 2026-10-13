// SEMENTARA: diagnosis setup. Hanya menampilkan ada/tidaknya konfigurasi (true/false), TANPA nilai. Hapus sebelum produksi.
export async function onRequestGet({ env }) {
  const out = {
    db_binding: Boolean(env.MGH_DB),
    ADMIN_EMAIL: Boolean(env.ADMIN_EMAIL),
    ADMIN_PASSWORD_HASH: Boolean(env.ADMIN_PASSWORD_HASH),
    hash_format_ok: /^pbkdf2\$\d+\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/.test(String(env.ADMIN_PASSWORD_HASH || '')),
    ADMIN_SESSION_SECRET: Boolean(env.ADMIN_SESSION_SECRET),
    session_secret_len_ok: String(env.ADMIN_SESSION_SECRET || '').length >= 32,
  };
  try { const r = await env.MGH_DB.prepare("SELECT count(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('categories','products','services','inquiries')").first(); out.d1_tables_found = r?.n ?? 0; } catch { out.d1_tables_found = 'error'; }
  return Response.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
