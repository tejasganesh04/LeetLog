const { RevisionRepository } = require('../repositories');
const { generateRevisionNote } = require('./groq.service');
const { googleSheetsAdapter, notionAdapter } = require('./export');
const Integration = require('../models/integration.model');
const { NotFoundError } = require('../utils/errors');
const logger = require('../config/logger-config');

const upsertSession = async (userId, sessionData) => {
  const {
    problemSlug, title, url, difficulty, tags, language, code,
    status, timeSpentSeconds, events, exampleTestcase, description,
  } = sessionData;

  const now = new Date();
  const update = {
    title, url, difficulty, tags, language, code, status,
    description: description || '',
    exampleTestcase: exampleTestcase || '',
    lastAttemptedAt: now,
    notesStatus: 'pending',
    questionHumanWords: '',
    howISolvedIt: '',
    thingsToRemember: '',
    topic: '',
  };

  if (status === 'Accepted') update.solvedAt = now;
  if (timeSpentSeconds) update.timeSpentSeconds = timeSpentSeconds;

  const revision = await RevisionRepository.upsert(userId, problemSlug, update, { firstAttemptedAt: now });

  if (events?.length) {
    for (const event of events) {
      await RevisionRepository.pushEvent(revision._id, userId, event);
    }
  }

  return revision;
};

const getAll = (userId) => RevisionRepository.findAllByUser(userId);

const getById = async (id, userId) => {
  const revision = await RevisionRepository.findById(id, userId);
  if (!revision) throw new NotFoundError('Revision not found');
  return revision;
};

const update = async (id, userId, data) => {
  const revision = await RevisionRepository.updateById(id, userId, data);
  if (!revision) throw new NotFoundError('Revision not found');
  return revision;
};

const remove = async (id, userId) => {
  const revision = await RevisionRepository.deleteById(id, userId);
  if (!revision) throw new NotFoundError('Revision not found');
};

const addEvent = async (id, userId, event) => {
  const revision = await RevisionRepository.pushEvent(id, userId, event);
  if (!revision) throw new NotFoundError('Revision not found');
  return revision;
};

const generateNotes = async (id, userId) => {
  const revision = await RevisionRepository.findById(id, userId);
  if (!revision) throw new NotFoundError('Revision not found');

  const notes = await generateRevisionNote({
    title: revision.title,
    difficulty: revision.difficulty,
    tags: revision.tags,
    description: revision.description,
    exampleTestcase: revision.exampleTestcase,
    code: revision.code,
    language: revision.language,
    status: revision.status,
    totalRuns: revision.totalRuns,
    totalSubmissions: revision.totalSubmissions,
    timeSpentSeconds: revision.timeSpentSeconds,
    events: revision.events,
  });

  if (!notes) {
    await RevisionRepository.updateById(id, userId, { notesStatus: 'failed' });
    return revision;
  }

  const updated = await RevisionRepository.updateById(id, userId, { ...notes, notesStatus: 'generated' });

  const integration = await Integration.findOne({ userId });

  autoSyncToSheets(updated, userId, integration).catch(err =>
    logger.warn(`Auto-sync to Sheets failed for ${revision.problemSlug}: ${err.message}`)
  );
  autoSyncToNotion(updated, userId, integration).catch(err =>
    logger.warn(`Auto-sync to Notion failed for ${revision.problemSlug}: ${err.message}`)
  );

  return updated;
};

const autoSyncToSheets = async (revision, userId, integration) => {
  if (!integration) integration = await Integration.findOne({ userId });
  if (!integration?.googleSheets?.enabled || !integration?.googleSheets?.sheetUrl) return;

  await googleSheetsAdapter.syncRevision(revision, integration.googleSheets.sheetUrl);
  await RevisionRepository.updateById(revision._id, userId, { lastSyncedAt: new Date() });
  logger.info(`Auto-synced ${revision.problemSlug} to Google Sheets`);
};

const autoSyncToNotion = async (revision, userId, integration) => {
  if (!integration) integration = await Integration.findOne({ userId });
  if (!integration?.notion?.enabled || !integration?.notion?.accessToken || !integration?.notion?.databaseId) return;

  await notionAdapter.syncRevision(revision, integration.notion.accessToken, integration.notion.databaseId);
  logger.info(`Auto-synced ${revision.problemSlug} to Notion`);
};

const syncToNotion = async (id, userId) => {
  const revision = await RevisionRepository.findById(id, userId);
  if (!revision) throw new NotFoundError('Revision not found');

  const integration = await Integration.findOne({ userId });
  if (!integration?.notion?.accessToken || !integration?.notion?.databaseId) {
    throw new Error('Notion not connected. Go to Settings to connect your Notion workspace.');
  }

  await notionAdapter.syncRevision(revision, integration.notion.accessToken, integration.notion.databaseId);
  return revision;
};

module.exports = { upsertSession, getAll, getById, update, remove, addEvent, generateNotes, syncToNotion };
