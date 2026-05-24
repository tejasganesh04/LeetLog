const { Client } = require('@notionhq/client');
const logger = require('../../config/logger-config');

const REQUIRED_PROPS = {
  'What it asks':       { rich_text: {} },
  'Topic':              { rich_text: {} },
  'URL':                { url: {} },
  'How I solved it':    { rich_text: {} },
  'Things to remember': { rich_text: {} },
  'Date':               { date: {} },
  'Difficulty':         { select: {} },
  'Status':             { select: {} },
  'Language':           { select: {} },
  'Time (min)':         { number: {} },
};

const extractId = (raw) => {
  // Accept UUID with or without dashes — return without dashes for path params
  const clean = String(raw).trim().replace(/-/g, '');
  const match = clean.match(/([a-f0-9]{32})/i);
  return match ? match[1] : clean;
};

const rt = (text) => text
  ? [{ type: 'text', text: { content: text.slice(0, 2000) } }]
  : [];

const ensureProperties = async (client, dataSourceId) => {
  try {
    const db = await client.dataSources.retrieve({ data_source_id: dataSourceId });
    const existing = Object.keys(db.properties || {});
    const missing = {};
    for (const [key, val] of Object.entries(REQUIRED_PROPS)) {
      if (!existing.includes(key)) missing[key] = val;
    }
    if (Object.keys(missing).length > 0) {
      await client.dataSources.update({ data_source_id: dataSourceId, properties: missing });
      logger.info(`Notion: added ${Object.keys(missing).length} missing properties`);
    }
  } catch (err) {
    logger.warn(`Notion: skipping property auto-setup (${err.message})`);
  }
};

const buildProperties = (revision) => {
  const date = revision.solvedAt || revision.lastAttemptedAt;
  return {
    'Name':               { title: [{ text: { content: revision.title || revision.problemSlug } }] },
    'Difficulty':         revision.difficulty ? { select: { name: revision.difficulty } } : { select: null },
    'Status':             revision.status     ? { select: { name: revision.status } }     : { select: null },
    'Language':           revision.language   ? { select: { name: revision.language } }   : { select: null },
    'Topic':              { rich_text: rt(revision.topic) },
    'Date':               date ? { date: { start: new Date(date).toISOString().split('T')[0] } } : { date: null },
    'URL':                revision.url ? { url: revision.url } : { url: null },
    'What it asks':       { rich_text: rt(revision.questionHumanWords) },
    'How I solved it':    { rich_text: rt(revision.howISolvedIt) },
    'Things to remember': { rich_text: rt(revision.thingsToRemember) },
    'Time (min)':         revision.timeSpentSeconds ? { number: Math.round(revision.timeSpentSeconds / 60) } : { number: null },
  };
};

const syncRevision = async (revision, accessToken, rawDatabaseId) => {
  const dataSourceId = extractId(rawDatabaseId);
  const client = new Client({ auth: accessToken });

  await ensureProperties(client, dataSourceId);

  const title = revision.title || revision.problemSlug;
  logger.info(`Notion: querying data source ${dataSourceId} for "${title}"`);

  const query = await client.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: 'Name', title: { equals: title } },
  });

  const properties = buildProperties(revision);

  if (query.results.length > 0) {
    await client.pages.update({ page_id: query.results[0].id, properties });
    logger.info(`Notion: updated page for ${revision.problemSlug}`);
  } else {
    await client.pages.create({ parent: { data_source_id: dataSourceId }, properties });
    logger.info(`Notion: created page for ${revision.problemSlug}`);
  }
};

module.exports = { syncRevision };
