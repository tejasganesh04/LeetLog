const { RevisionService } = require('../services');
const { csvAdapter, googleSheetsAdapter } = require('../services/export');
const Integration = require('../models/integration.model');
const { success } = require('../utils/response');
const { BadRequestError } = require('../utils/errors');

const getAll = async (req, res, next) => {
  try {
    const revisions = await RevisionService.getAll(req.userId);
    success(res, revisions);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const revision = await RevisionService.upsertSession(req.userId, req.body);
    success(res, revision, 'Revision saved', 201);
  } catch (err) { next(err); }
};

const upsertSession = async (req, res, next) => {
  try {
    const revision = await RevisionService.upsertSession(req.userId, req.body);
    success(res, revision, 'Session saved');
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const revision = await RevisionService.getById(req.params.id, req.userId);
    success(res, revision);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const revision = await RevisionService.update(req.params.id, req.userId, req.body);
    success(res, revision, 'Revision updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await RevisionService.remove(req.params.id, req.userId);
    success(res, null, 'Revision deleted');
  } catch (err) { next(err); }
};

const addEvent = async (req, res, next) => {
  try {
    const revision = await RevisionService.addEvent(req.params.id, req.userId, req.body);
    success(res, revision, 'Event recorded');
  } catch (err) { next(err); }
};

const generateNotes = async (req, res, next) => {
  try {
    const revision = await RevisionService.generateNotes(req.params.id, req.userId);
    success(res, revision, 'Notes generated');
  } catch (err) { next(err); }
};

const exportCSV = async (req, res, next) => {
  try {
    const revisions = await RevisionService.getAll(req.userId);
    const csv = csvAdapter.exportCSV(revisions);
    res.header('Content-Type', 'text/csv');
    res.attachment('leetlog-revisions.csv');
    res.send(csv);
  } catch (err) { next(err); }
};

const syncToSheets = async (req, res, next) => {
  try {
    const integration = await Integration.findOne({ userId: req.userId });
    if (!integration?.googleSheets?.enabled || !integration?.googleSheets?.sheetUrl) {
      throw new BadRequestError('Google Sheets not configured. Go to Settings to set it up.');
    }

    const revision = await RevisionService.getById(req.params.id, req.userId);
    await googleSheetsAdapter.syncRevision(revision, integration.googleSheets.sheetUrl);
    await RevisionService.update(req.params.id, req.userId, { lastSyncedAt: new Date() });

    success(res, null, 'Synced to Google Sheets');
  } catch (err) { next(err); }
};

const syncToNotion = async (req, res, next) => {
  try {
    await RevisionService.syncToNotion(req.params.id, req.userId);
    success(res, null, 'Synced to Notion');
  } catch (err) { next(err); }
};

module.exports = { getAll, create, upsertSession, getById, update, remove, addEvent, generateNotes, exportCSV, syncToSheets, syncToNotion };
