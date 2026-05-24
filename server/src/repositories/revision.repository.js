const Revision = require('../models/revision.model');

const upsert = (userId, problemSlug, data, setOnInsert) =>
  Revision.findOneAndUpdate(
    { userId, problemSlug },
    { $set: data, ...(setOnInsert ? { $setOnInsert: setOnInsert } : {}) },
    { new: true, upsert: true, runValidators: true }
  );

const findAllByUser = (userId) =>
  Revision.find({ userId }).sort({ updatedAt: -1 });

const findById = (id, userId) =>
  Revision.findOne({ _id: id, userId });

const findBySlug = (userId, problemSlug) =>
  Revision.findOne({ userId, problemSlug });

const updateById = (id, userId, data) =>
  Revision.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });

const deleteById = (id, userId) =>
  Revision.findOneAndDelete({ _id: id, userId });

const pushEvent = (id, userId, event) =>
  Revision.findOneAndUpdate(
    { _id: id, userId },
    { $push: { events: event }, $inc: { totalRuns: event.type === 'run_result' ? 1 : 0, totalSubmissions: event.type === 'submit_result' ? 1 : 0 } },
    { new: true }
  );

module.exports = { upsert, findAllByUser, findById, findBySlug, updateById, deleteById, pushEvent };
