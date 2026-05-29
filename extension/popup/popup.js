const BACKEND_URL = 'https://leetlog-tzb5j.ondigitalocean.app';
const CLIENT_URL  = 'https://leet-log-swart.vercel.app';

const $ = (id) => document.getElementById(id);
let watching = false;
let sessionStart = null;
let timerInterval = null;

const show = (id) => $(id).classList.remove('hidden');
const hide = (id) => $(id).classList.add('hidden');

const showMsg = (id, text, type) => {
  const el = $(id);
  el.textContent = text;
  el.className = `msg msg-${type}`;
  show(id);
  setTimeout(() => hide(id), 4000);
};

const setDot = (active) => {
  $('status-dot').className = `dot ${active ? 'dot-watching' : 'dot-idle'}`;
};

const updateTimer = () => {
  if (!sessionStart) return;
  const mins = Math.round((Date.now() - sessionStart) / 60000);
  $('stat-time').textContent = `${mins}m`;
};

// ── Auth ────────────────────────────────────────────────────────────────────

$('btn-signin').addEventListener('click', handleLogin);
$('input-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
$('input-email').addEventListener('keydown', e => { if (e.key === 'Enter') $('input-password').focus(); });

async function handleLogin() {
  const email = $('input-email').value.trim();
  const password = $('input-password').value;
  if (!email || !password) return showMsg('login-msg', 'Enter your email and password.', 'error');

  $('btn-signin').disabled = true;
  $('btn-signin').textContent = 'Signing in...';
  hide('login-msg');

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Sign in failed');

    await chrome.storage.local.set({ token: data.data.token, userEmail: data.data.user.email });
    showConnected(data.data.user.email);
  } catch (err) {
    showMsg('login-msg', err.message, 'error');
  } finally {
    $('btn-signin').disabled = false;
    $('btn-signin').textContent = 'Sign in';
  }
}

$('btn-signout').addEventListener('click', async (e) => {
  e.preventDefault();
  await chrome.storage.local.remove(['token', 'userEmail', 'watching', 'sessionStart']);
  watching = false;
  clearInterval(timerInterval);
  setDot(false);
  hide('section-main');
  hide('footer');
  $('input-email').value = '';
  $('input-password').value = '';
  show('section-login');
});

$('link-signup').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: CLIENT_URL + '/register' });
});

// ── Connected state ──────────────────────────────────────────────────────────

async function showConnected(email) {
  hide('section-login');
  show('section-main');
  show('footer');
  if (email) $('footer-email').textContent = email;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onLeetCode = tab?.url?.includes('leetcode.com/problems/');

  if (onLeetCode) {
    show('state-leetcode');
    hide('state-idle');
    getPageState(tab);
  } else {
    hide('state-leetcode');
    show('state-idle');
  }

  const stored = await chrome.storage.local.get(['watching', 'sessionStart']);
  if (stored.watching) {
    watching = true;
    sessionStart = stored.sessionStart || Date.now();
    setDot(true);
    $('btn-watch').textContent = 'Stop Watching';
    timerInterval = setInterval(updateTimer, 10000);
    updateTimer();
  }
}

async function getPageState(tab) {
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' });
    if (res?.problemSlug) {
      $('problem-title').textContent = res.title || res.problemSlug;
      $('stat-runs').textContent = res.runCount || 0;
      $('stat-submits').textContent = res.submitCount || 0;
    }
  } catch {}
}

// ── Watch / Save ─────────────────────────────────────────────────────────────

$('btn-watch').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('leetcode.com/problems/')) {
    return showMsg('save-msg', 'Open a LeetCode problem first.', 'error');
  }

  watching = !watching;
  if (watching) {
    sessionStart = Date.now();
    await chrome.storage.local.set({ watching: true, sessionStart });
    await chrome.tabs.sendMessage(tab.id, { type: 'START_WATCH' });
    setDot(true);
    $('btn-watch').textContent = 'Stop Watching';
    timerInterval = setInterval(updateTimer, 10000);
    updateTimer();
  } else {
    await chrome.storage.local.set({ watching: false });
    await chrome.tabs.sendMessage(tab.id, { type: 'STOP_WATCH' });
    setDot(false);
    $('btn-watch').textContent = 'Start Watching';
    clearInterval(timerInterval);
  }
});

$('btn-save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('leetcode.com/problems/')) {
    return showMsg('save-msg', 'Open a LeetCode problem first.', 'error');
  }

  $('btn-save').disabled = true;
  $('btn-save').textContent = 'Saving...';

  try {
    await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { type: 'COLLECT_AND_SAVE' }, (res) => {
        if (chrome.runtime.lastError || res?.error) reject(new Error(res?.error || 'Save failed'));
        else resolve(res);
      });
    });
    showMsg('save-msg', 'Saved — notes generating...', 'success');
  } catch (err) {
    showMsg('save-msg', err.message, 'error');
  } finally {
    $('btn-save').disabled = false;
    $('btn-save').textContent = 'Save to LeetLog';
  }
});

$('link-dashboard').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: CLIENT_URL });
});

// ── Init ─────────────────────────────────────────────────────────────────────

(async () => {
  const { token } = await chrome.storage.local.get('token');

  if (token) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('expired');
      const data = await res.json();
      const email = data.data?.email || '';
      await chrome.storage.local.set({ userEmail: email });
      await showConnected(email);
    } catch {
      await chrome.storage.local.remove(['token', 'userEmail', 'watching', 'sessionStart']);
      show('section-login');
    }
  } else {
    show('section-login');
  }
})();
