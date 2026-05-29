const BACKEND_URL = 'https://leetlog-tzb5j.ondigitalocean.app';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SAVE_REVISION') {
    handleSave(msg.payload).then(sendResponse).catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

const handleSave = async (payload) => {
  const { token } = await chrome.storage.local.get('token');

  if (!token) throw new Error('Not signed in. Open the LeetLog extension to sign in.');

  const res = await fetch(`${BACKEND_URL}/api/v1/revisions/upsert-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Session expired — open LeetLog extension to sign in again');
    const err = await res.json().catch(() => ({ message: 'Save failed' }));
    throw new Error(err.message || 'Save failed');
  }

  const data = await res.json();

  if (data.data?._id) {
    fetch(`${BACKEND_URL}/api/v1/revisions/${data.data._id}/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  return data;
};
