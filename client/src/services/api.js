const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('ll_token');

const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('text/csv')) return res.blob();
  return res.json();
};

export const api = {
  // Auth
  register: (data) => request('POST', '/auth/register', data),
  login: (data) => request('POST', '/auth/login', data),
  me: () => request('GET', '/auth/me'),

  // Revisions
  getRevisions: () => request('GET', '/revisions'),
  upsertSession: (data) => request('POST', '/revisions/upsert-session', data),
  getRevision: (id) => request('GET', `/revisions/${id}`),
  updateRevision: (id, data) => request('PUT', `/revisions/${id}`, data),
  deleteRevision: (id) => request('DELETE', `/revisions/${id}`),
  generateNotes: (id) => request('POST', `/revisions/${id}/generate`),
  syncToSheets: (id) => request('POST', `/revisions/${id}/sync/sheets`),
  syncToNotion: (id) => request('POST', `/revisions/${id}/sync/notion`),
  exportCSV: () => request('GET', '/revisions/export/csv'),

  // Analytics
  getSummary: () => request('GET', '/analytics/summary'),

  // Integrations
  getIntegration: () => request('GET', '/integrations'),
  saveGoogleSheets: (data) => request('POST', '/integrations/google-sheets', data),
  getNotionAuthUrl: () => request('GET', '/integrations/notion/auth-url'),
  getNotionDatabases: () => request('GET', '/integrations/notion/databases'),
  saveNotionDatabase: (data) => request('POST', '/integrations/notion/database', data),
  disconnectNotion: () => request('DELETE', '/integrations/notion'),
  getSheetsConfig: () => request('GET', '/integrations/sheets-config'),
};
