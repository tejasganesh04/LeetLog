let sessionStart = Date.now();
let events = [];
let watchActive = false;
let runCount = 0;
let submitCount = 0;

const problemSlug = location.pathname.split('/problems/')[1]?.replace(/\/$/, '') || '';

const pushEvent = (type, extra = {}) => {
  events.push({ type, timestamp: new Date().toISOString(), ...extra });
};

const findButton = (text) => {
  return [...document.querySelectorAll('button')].find(b =>
    b.textContent.trim().toLowerCase().includes(text.toLowerCase())
  );
};

const observeResult = (type) => {
  const observer = new MutationObserver(() => {
    const accepted = document.querySelector('[data-e2e-locator="submission-result"]')?.textContent?.trim()
      || document.querySelector('.text-green-s')?.textContent?.trim()
      || '';

    const resultText = accepted || findResultText();
    if (resultText) {
      pushEvent(`${type}_result`, { status: resultText });
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
};

const findResultText = () => {
  const selectors = ['.text-red-s', '.text-yellow-s', '.text-green-s', '[data-e2e-locator="submission-result"]'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return null;
};

const attachListeners = () => {
  const runBtn = findButton('Run');
  const submitBtn = findButton('Submit');

  if (runBtn && !runBtn.__llAttached) {
    runBtn.__llAttached = true;
    runBtn.addEventListener('click', () => {
      runCount++;
      pushEvent('run_clicked');
      observeResult('run');
    });
  }

  if (submitBtn && !submitBtn.__llAttached) {
    submitBtn.__llAttached = true;
    submitBtn.addEventListener('click', () => {
      submitCount++;
      pushEvent('submit_clicked');
      observeResult('submit');
    });
  }
};

const getCodeFromEditor = () => {
  const lines = document.querySelectorAll('.view-line');
  if (lines.length > 0) return [...lines].map(l => l.textContent).join('\n');
  const cm = document.querySelector('.CodeMirror')?.CodeMirror;
  if (cm) return cm.getValue();
  return '';
};

const getLanguage = () => {
  const sel = document.querySelector('[data-cy="lang-select"] button, .ant-select-selection-item');
  return sel?.textContent?.trim() || '';
};

const getDifficulty = () => {
  const el = document.querySelector('[diff]') || document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard');
  return el?.textContent?.trim() || '';
};

const getTags = () => {
  const els = document.querySelectorAll('a[href*="/tag/"]');
  return [...els].map(e => e.textContent.trim()).filter(Boolean);
};

const getTitle = () => {
  const el = document.querySelector('[data-cy="question-title"]')
    || document.querySelector('.text-title-large')
    || document.querySelector('h1');
  if (el?.textContent?.trim()) return el.textContent.trim();
  return document.title.split(' - ')[0] || '';
};

const fetchSubmissions = async () => {
  try {
    const res = await fetch(`https://leetcode.com/api/submissions/?offset=0&limit=5&lang=&status=`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data.submissions_dump?.find(s => s.title_slug === problemSlug);
    return match || null;
  } catch { return null; }
};

const fetchProblemMeta = async () => {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title titleSlug difficulty
            topicTags { name }
            exampleTestcases content
          }
        }`,
        variables: { titleSlug: problemSlug },
      }),
    });
    const data = await res.json();
    return data?.data?.question || null;
  } catch { return null; }
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATE') {
    sendResponse({
      problemSlug,
      title: getTitle(),
      url: location.href,
      watchActive,
      events,
      runCount,
      submitCount,
    });
  }

  if (msg.type === 'START_WATCH') {
    watchActive = true;
    sessionStart = Date.now();
    events = [];
    runCount = 0;
    submitCount = 0;
    pushEvent('watch_started');
    attachListeners();
    sendResponse({ ok: true });
  }

  if (msg.type === 'STOP_WATCH') {
    watchActive = false;
    pushEvent('watch_stopped');
    sendResponse({ ok: true });
  }

  if (msg.type === 'COLLECT_AND_SAVE') {
    collectAndSave().then(sendResponse).catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

const collectAndSave = async () => {
  const [submission, meta] = await Promise.all([fetchSubmissions(), fetchProblemMeta()]);

  const payload = {
    problemSlug,
    title: meta?.title || getTitle(),
    url: location.href,
    difficulty: meta?.difficulty || getDifficulty(),
    tags: meta?.topicTags?.map(t => t.name) || getTags(),
    language: submission?.lang || getLanguage(),
    code: submission?.code || getCodeFromEditor(),
    status: submission?.status_display || null,
    timeSpentSeconds: Math.round((Date.now() - sessionStart) / 1000),
    totalRuns: runCount,
    totalSubmissions: submitCount,
    events,
    exampleTestcase: meta?.exampleTestcases || '',
    description: meta?.content ? meta.content.replace(/<[^>]+>/g, ' ').slice(0, 500) : '',
  };

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'SAVE_REVISION', payload }, (res) => {
      if (res?.error) reject(new Error(res.error));
      else resolve(res);
    });
  });
};

pushEvent('page_opened');

const buttonPollInterval = setInterval(() => {
  if (findButton('Run') && findButton('Submit')) {
    clearInterval(buttonPollInterval);
    if (watchActive) attachListeners();
  }
}, 1000);
