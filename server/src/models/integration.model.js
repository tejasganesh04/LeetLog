const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  googleSheets: {
    enabled: { type: Boolean, default: false },
    sheetId: String,
    sheetUrl: String,
  },
  notion: {
    enabled: { type: Boolean, default: false },
    accessToken: String,
    workspaceName: String,
    databaseId: String,
    databaseName: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Integration', integrationSchema);
