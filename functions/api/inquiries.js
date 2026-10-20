export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const message = String(body.message || '').trim();
  if (!name || !phone || !message) return Response.json({ error: 'Nama, WhatsApp, dan pesan wajib diisi.' }, { status: 400 });
  if (name.length > 120 || phone.length > 40 || message.length > 4000) return Response.json({ error: 'Input terlalu panjang.' }, { status: 400 });
  await env.MGH_DB.prepare("INSERT INTO inquiries (name, phone, message, product_id, service_id) VALUES (?, ?, ?, ?, ?)").bind(name, phone, message, body.product_id || null, body.service_id || null).run();
  return Response.json({ ok: true }, { status: 201 });
}