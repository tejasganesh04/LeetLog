# LeetLog

> Stop forgetting your LeetCode solutions.

LeetLog is a full-stack web app + Chrome MV3 extension that silently watches your LeetCode sessions, drafts AI-powered revision notes, and syncs everything to Notion or Google Sheets — automatically.

**Live:** [leet-log-swart.vercel.app](https://leet-log-swart.vercel.app)

---

## What it does

- **Session capture** — the Chrome extension tracks every run, submission, and minute spent on a problem
- **AI revision notes** — Groq (Llama 3.3 70B) generates structured notes: problem intuition, solution walkthrough, things to remember
- **Notion sync** — OAuth 2.0 flow, pushes entries directly to a database you choose
- **Google Sheets sync** — service account integration, no OAuth verification required
- **Editorial UI** — built with a custom CSS design system (Fraunces + Bricolage Grotesque + JetBrains Mono)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, custom CSS (no UI library) |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| AI | Groq API — Llama 3.3 70B (llama-3.3-70b-versatile) |
| Auth | JWT (web) + chrome.storage.local (extension) |
| Extension | Chrome MV3 — service worker, content script, popup |
| Integrations | Notion OAuth 2.0, Google Sheets API (service account) |
| Hosting | Vercel (frontend), DigitalOcean App Platform (backend) |
| Database | MongoDB Atlas |

---

## Project structure

```
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   └── src/
│       ├── controllers/
│       ├── services/
│       │   └── export/  # Notion + Sheets adapters
│       ├── repositories/
│       ├── models/
│       └── routes/
└── extension/       # Chrome MV3 extension
    ├── popup/
    ├── content/
    └── background/
```

---

## Local setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Groq API key — [console.groq.com](https://console.groq.com)

### Backend

```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

### Extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. Pin the extension and sign in with your LeetLog account

---

## Environment variables

See `server/.env.example` and `client/.env.example` for all required variables with setup instructions.

---

## License

MIT
