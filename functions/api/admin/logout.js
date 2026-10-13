export async function onRequestPost() {
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json','Set-Cookie':'mgh_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'} });
}