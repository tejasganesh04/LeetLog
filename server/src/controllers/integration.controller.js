const Integration = require('../models/integration.model');
const { Client } = require('@notionhq/client');
const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, NOTION_REDIRECT_URI,
  CLIENT_URL,
} = require('../config/server-config');
const { success } = require('../utils/response');

const getIntegration = async (req, res, next) => {
  try {
    const integration = await Integration.findOne({ userId: req.userId });
    success(res, integration || {});
  } catch (err) { next(err); }
};

const saveGoogleSheets = async (req, res, next) => {
  try {
    const { sheetUrl, enabled } = req.body;

    const sheetId = sheetUrl?.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || null;

    const integration = await Integration.findOneAndUpdate(
      { userId: req.userId },
      { $set: { 'googleSheets.sheetUrl': sheetUrl, 'googleSheets.sheetId': sheetId, 'googleSheets.enabled': enabled ?? true } },
      { new: true, upsert: true }
    );

    success(res, integration, 'Google Sheets settings saved');
  } catch (err) { next(err); }
};

const getSheetsConfig = (req, res) => {
  success(res, { serviceAccountEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL || null });
};

// ── Notion OAuth ──────────────────────────────────────────────────────────────

const getNotionAuthUrl = (req, res) => {
  if (!NOTION_CLIENT_ID) {
    return res.status(503).json({ message: 'Notion OAuth not configured on this server.' });
  }
  // Encode userId in state so the callback can identify the user without a session
  const state = Buffer.from(String(req.userId)).toString('base64');
  const url = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}&state=${state}`;
  success(res, { url });
};

const notionCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;

    if (error || !code) {
      return res.redirect(`${CLIENT_URL}/settings?notion=denied`);
    }

    // Exchange code for access token
    const credentials = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Notion token exchange failed: ${err}`);
    }

    const tokenData = await tokenRes.json();
    const { access_token, workspace_name } = tokenData;

    // Store only access token + workspace name — database selection happens next
    // We decode the userId from the state param (passed during initiation, or use a short-lived session)
    // For simplicity, store temporarily in a query param on redirect and require re-auth on the settings page
    // Better: encode userId in state param
    const state = req.query.state;
    let userId = null;
    if (state) {
      try { userId = Buffer.from(state, 'base64').toString('utf8'); } catch {}
    }

    if (userId) {
      await Integration.findOneAndUpdate(
        { userId },
        { $set: { 'notion.accessToken': access_token, 'notion.workspaceName': workspace_name, 'notion.databaseId': null, 'notion.enabled': false } },
        { upsert: true }
      );
      return res.redirect(`${CLIENT_URL}/settings?notion=connected`);
    }

    // Fallback: pass token via redirect (less ideal but works for local dev)
    return res.redirect(`${CLIENT_URL}/settings?notion=connected&token=${access_token}&workspace=${encodeURIComponent(workspace_name)}`);
  } catch (err) { next(err); }
};

const getNotionDatabases = async (req, res, next) => {
  try {
    const integration = await Integration.findOne({ userId: req.userId });
    if (!integration?.notion?.accessToken) {
      return res.status(400).json({ message: 'Notion not connected.' });
    }

    const client = new Client({ auth: integration.notion.accessToken });
    const response = await client.search({
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    });

    const databases = response.results
      .filter(r => r.object === 'database' || r.object === 'data_source')
      .map(db => ({
        id: db.id,
        name: db.title?.map(t => t.plain_text).join('').trim() || 'Untitled',
        url: db.url,
      }));

    success(res, databases);
  } catch (err) { next(err); }
};

const saveNotionDatabase = async (req, res, next) => {
  try {
    const { databaseId, databaseName, enabled } = req.body;

    const integration = await Integration.findOneAndUpdate(
      { userId: req.userId },
      { $set: { 'notion.databaseId': databaseId, 'notion.databaseName': databaseName, 'notion.enabled': enabled ?? true } },
      { new: true, upsert: true }
    );

    success(res, integration, 'Notion database saved');
  } catch (err) { next(err); }
};

const disconnectNotion = async (req, res, next) => {
  try {
    await Integration.findOneAndUpdate(
      { userId: req.userId },
      { $set: { 'notion.accessToken': null, 'notion.workspaceName': null, 'notion.databaseId': null, 'notion.enabled': false } }
    );
    success(res, null, 'Notion disconnected');
  } catch (err) { next(err); }
};

module.exports = {
  getIntegration, saveGoogleSheets, getSheetsConfig,
  getNotionAuthUrl, notionCallback, getNotionDatabases, saveNotionDatabase, disconnectNotion,
};
