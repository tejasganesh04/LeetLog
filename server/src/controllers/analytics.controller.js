const { RevisionService } = require('../services');
const { success } = require('../utils/response');

const summary = async (req, res, next) => {
  try {
    const revisions = await RevisionService.getAll(req.userId);

    const total = revisions.length;
    const solved = revisions.filter(r => r.status === 'Accepted').length;

    const byDifficulty = revisions.reduce((acc, r) => {
      const d = r.difficulty || 'Unknown';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const byTopic = revisions.reduce((acc, r) => {
      const t = r.topic || 'Uncategorized';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    success(res, { total, solved, byDifficulty, byTopic });
  } catch (err) { next(err); }
};

module.exports = { summary };
