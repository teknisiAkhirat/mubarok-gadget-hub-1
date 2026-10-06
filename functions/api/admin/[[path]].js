const tables = new Set(['products','categories','services','inquiries']);
const enc = new TextEncoder();
async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
}
async function authorized(request, env) {
  const raw = request.headers.get('Cookie')?.match(/(?:^|; )mgh_admin=([^;]+)/)?.[1];
  if (!raw || !env.ADMIN_SESSION_SECRET || !env.ADMIN_EMAIL) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const [email, exp, sig] = parts;
  if (email !== env.ADMIN_EMAIL || Number(exp) < Math.floor(Date.now()/1000)) return false;
  return sig === await sign(email + '.' + exp, env.ADMIN_SESSION_SECRET);
}
function tableFor(name) {
  return { product:'products', products:'products', category:'categories', categories:'categories', service:'services', services:'services', inquiry:'inquiries', inquiries:'inquiries' }[name];
}
function normalize(table, body) {
  if (table === 'products') return { category_id: body.category_id || null, name:String(body.name||'').trim(), slug:String(body.slug||'').trim(), brand:String(body.brand||'').trim(), model:String(body.model||'').trim(), condition:body.condition||'original', grade:String(body.grade||'A'), price:Number(body.price||0), stock:Number(body.stock||0), warranty:String(body.warranty||''), status_test:String(body.status_test||''), compatibility:String(body.compatibility||''), image_url:String(body.image_url||''), is_featured:body.featured?1:0, is_active:body.active===false?0:1, description:String(body.description||''), tags:Array.isArray(body.tags)?JSON.stringify(body.tags):String(body.tags||'') };
  if (table === 'categories') return { name:String(body.name||'').trim(), slug:String(body.slug||'').trim(), description:String(body.description||''), sort_order:Number(body.sort_order||0), is_active:body.active===false?0:1 };
  if (table === 'services') return { name:String(body.name||body.title||'').trim(), description:String(body.description||''), price_from:body.price_from===''||body.price_from==null?null:Number(body.price_from), duration:String(body.duration||''), warranty:String(body.warranty||''), is_active:body.active===false?0:1, sort_order:Number(body.sort_order||0) };
  return { status:['new','contacted','done','cancelled'].includes(body.status)?body.status:'new' };
}
export async function onRequest({ request, env, params }) {
  if (!await authorized(request, env)) return Response.json({ error:'Unauthorized' }, { status:401 });
  const parts = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean);
  const table = tableFor(parts[0]);
  const id = parts[1];
  if (!table) return Response.json({ error:'Resource tidak ditemukan.' }, { status:404 });
  const db = env.MGH_DB;
  if (request.method === 'GET') {
    const order = table === 'inquiries' ? 'created_at DESC' : table === 'categories' || table === 'services' ? 'sort_order ASC, name ASC' : 'created_at DESC';
    const r = await db.prepare('SELECT * FROM ' + table + ' ORDER BY ' + order).all();
    return Response.json(r.results.map(row => ({...row, active:Boolean(row.is_active), featured:Boolean(row.is_featured), tags:row.tags ? JSON.parse(row.tags) : []})));
  }
  if (request.method === 'DELETE') {
    if (!id) return Response.json({error:'ID wajib.'},{status:400});
    await db.prepare('DELETE FROM ' + table + ' WHERE id = ?').bind(id).run();
    return Response.json({ok:true});
  }
  const body = await request.json().catch(()=>({}));
  const data = normalize(table, body);
  if (table === 'inquiries' && request.method === 'PATCH') {
    await db.prepare('UPDATE inquiries SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(data.status,id).run();
    return Response.json({ok:true});
  }
  if (!['POST','PATCH'].includes(request.method)) return Response.json({error:'Method tidak didukung.'},{status:405});
  if (request.method === 'POST') {
    const cols=Object.keys(data), vals=cols.map(()=>'?');
    const r=await db.prepare('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING *').bind(...cols.map(k=>data[k])).first();
    return Response.json(r,{status:201});
  }
  if (!id) return Response.json({error:'ID wajib.'},{status:400});
  const cols=Object.keys(data), sets=cols.map(c=>c+'=?');
  await db.prepare('UPDATE ' + table + ' SET ' + sets.join(',') + ', updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(...cols.map(k=>data[k]),id).run();
  return Response.json({ok:true});
}