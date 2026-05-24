const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: String,
  timestamp: { type: Date, default: Date.now },
  status: String,
  runtime: String,
  memory: String,
}, { _id: false });

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemSlug: { type: String, required: true },
  title: String,
  url: String,
  difficulty: String,
  tags: [String],
  language: String,
  code: String,
  status: String,
  firstAttemptedAt: Date,
  lastAttemptedAt: Date,
  solvedAt: Date,
  timeSpentSeconds: { type: Number, default: 0 },
  totalRuns: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  events: [eventSchema],

  // Problem metadata saved at capture time (used for note regeneration)
  description: String,
  exampleTestcase: String,

  // AI-generated revision fields
  questionHumanWords: String,
  howISolvedIt: String,
  thingsToRemember: String,
  topic: String,

  notesStatus: { type: String, enum: ['pending', 'generated', 'failed'], default: 'pending' },

  // Export / sync metadata
  googleSheetId: String,
  lastSyncedAt: Date,
}, { timestamps: true });

revisionSchema.index({ userId: 1, problemSlug: 1 }, { unique: true });

module.exports = mongoose.model('Revision', revisionSchema);
