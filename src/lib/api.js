const jsonHeaders = { 'Content-Type': 'application/json' };

export async function apiFetch(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { ...jsonHeaders, ...(options.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Request gagal (${response.status})`);
  return data;
}

export const getCatalog = () => apiFetch('/api/catalog');
export const createInquiry = (payload) => apiFetch('/api/inquiries', { method: 'POST', body: JSON.stringify(payload) });

export const adminLogin = (email, password) => apiFetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const adminLogout = () => apiFetch('/api/admin/logout', { method: 'POST' });
export const adminList = (table) => apiFetch('/api/admin/' + table);
export const adminCreate = (table, payload) => apiFetch('/api/admin/' + table, { method: 'POST', body: JSON.stringify(payload) });
export const adminUpdate = (table, id, payload) => apiFetch('/api/admin/' + table + '/' + id, { method: 'PATCH', body: JSON.stringify(payload) });
export const adminDelete = (table, id) => apiFetch('/api/admin/' + table + '/' + id, { method: 'DELETE' });
