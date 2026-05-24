const { Parser } = require('json2csv');

const FIELDS = [
  { label: 'Date', value: (r) => r.solvedAt ? new Date(r.solvedAt).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString() },
  { label: 'Problem', value: 'title' },
  { label: 'Difficulty', value: 'difficulty' },
  { label: 'Topic', value: 'topic' },
  { label: 'URL', value: 'url' },
  { label: 'Question', value: 'questionHumanWords' },
  { label: 'How I Solved It', value: 'howISolvedIt' },
  { label: 'Things to Remember', value: 'thingsToRemember' },
];

const exportCSV = (revisions) => {
  const seen = new Set();
  const unique = revisions.filter((r) => {
    if (seen.has(r.problemSlug)) return false;
    seen.add(r.problemSlug);
    return true;
  });

  const parser = new Parser({ fields: FIELDS });
  return parser.parse(unique);
};

module.exports = { exportCSV };
