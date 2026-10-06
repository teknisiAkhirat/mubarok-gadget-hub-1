const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabaseConfigured = Boolean(url && key);

let session = JSON.parse(localStorage.getItem('mgh_supabase_session') || 'null');
const listeners = new Set();

function headers(extra = {}) {
  return { apikey: key, Authorization: `Bearer ${session?.access_token || key}`, ...extra };
}

async function request(path, options = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: headers({ 'Content-Type': 'application/json', ...(options.headers || {}) }) });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) return { data: null, error: { message: data?.message || data?.error_description || `Request failed (${res.status})` } };
  return { data, error: null };
}

class Query {
  constructor(table, operation='select') { this.table=table; this.operation=operation; this.filters=[]; this.ordering=null; this.payload=null; this.limitOne=false; }
  select(columns='*') { this.columns=columns; return this; }
  eq(column,value) { this.filters.push([column,'eq',value]); return this; }
  order(column,{ascending=true}={}) { this.ordering=[column,ascending]; return this; }
  maybeSingle() { this.limitOne=true; return this; }
  insert(payload) { this.operation='insert'; this.payload=payload; return this; }
  update(payload) { this.operation='update'; this.payload=payload; return this; }
  delete() { this.operation='delete'; return this; }
  async execute() {
    let path=this.table;
    const params=[];
    if(this.operation==='select') params.push(`select=${encodeURIComponent(this.columns || '*')}`);
    for(const [c,op,v] of this.filters) params.push(`${encodeURIComponent(c)}=${op}.${encodeURIComponent(v)}`);
    if(this.ordering) params.push(`order=${encodeURIComponent(this.ordering[0])}.${this.ordering[1]?'asc':'desc'}`);
    if(this.limitOne) params.push('limit=1');
    if(params.length) path += '?' + params.join('&');
    const options={method:this.operation==='select'?'GET':this.operation==='insert'?'POST':this.operation==='update'?'PATCH':'DELETE'};
    if(this.operation==='insert'){options.body=JSON.stringify(this.payload);options.headers={'Prefer':'return=minimal'};}
    if(this.operation==='update'){options.body=JSON.stringify(this.payload);options.headers={'Prefer':'return=minimal'};}
    const result=await request(path,options);
    if(this.limitOne && Array.isArray(result.data)) result.data=result.data[0] || null;
    return result;
  }
  then(resolve,reject){ return this.execute().then(resolve,reject); }
}

const from = (table) => new Query(table);
const auth = {
  async signInWithPassword({email,password}) {
    const res=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) return {data:null,error:{message:data.error_description || data.msg || 'Login gagal'}};
    session=data; localStorage.setItem('mgh_supabase_session',JSON.stringify(data)); listeners.forEach(fn=>fn('SIGNED_IN',data)); return {data:{user:data.user,session:data},error:null};
  },
  async getSession(){ return {data:{session},error:null}; },
  onAuthStateChange(callback){ listeners.add(callback); return {data:{subscription:{unsubscribe:()=>listeners.delete(callback)}}}; },
  async signOut(){ session=null; localStorage.removeItem('mgh_supabase_session'); listeners.forEach(fn=>fn('SIGNED_OUT',null)); return {error:null}; }
};

export const supabase = supabaseConfigured ? { from, auth } : null;
