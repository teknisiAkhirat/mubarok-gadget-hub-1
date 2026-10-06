const jsonHeaders = { 'Content-Type': 'application/json' };

export async function apiFetch(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { ...jsonHeaders, ...(options.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Request gagal (${response.status})`);
  return data;
}

export const getCatalog = () => apiFetch('/api/catalog');
export const createInquiry = (payload) => apiFetch('/api/inquiries', { method: 'POST', body: JSON.stringify(payload) });
