const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/server-config');
const logger = require('../config/logger-config');

const client = GROQ_API_KEY && GROQ_API_KEY !== 'PLACEHOLDER'
  ? new Groq({ apiKey: GROQ_API_KEY })
  : null;

const buildPrompt = (input) => {
  const { title, difficulty, tags, description, code, language, status, totalRuns, totalSubmissions, timeSpentSeconds, events } = input;

  const minutes = Math.round((timeSpentSeconds || 0) / 60);
  const eventSummary = (events || [])
    .map(e => `${e.type}${e.status ? ` (${e.status})` : ''}`)
    .join(', ');

  return `You are generating a personal LeetCode revision note. Write as if the solver is reading their own notes later for quick revision.

Problem: ${title} (${difficulty || 'Unknown'})
Tags: ${(tags || []).join(', ') || 'None'}
Description: ${description || 'Not available'}
Language: ${language || 'Unknown'}
Final Status: ${status || 'Unknown'}
Time Spent: ${minutes} minutes
Total Runs: ${totalRuns || 0}
Total Submissions: ${totalSubmissions || 0}
Session Events: ${eventSummary || 'None recorded'}
Code:
\`\`\`
${code || 'Not available'}
\`\`\`

Return a JSON object with EXACTLY these four string fields (every value must be a STRING — no arrays, no nested objects):

{
  "question": "string",
  "howISolvedIt": "string",
  "thingsToRemember": "string",
  "topic": "string"
}

Field rules:

- question: Explain what the problem asks in plain language. MUST contain the literal text "Example:" followed by one concrete input → output and a one-line reason. 2-3 sentences total.

- howISolvedIt: Describe the specific approach using details from the actual code (data structures used, key variables, the core logic). Not generic. 2-3 sentences. Never use the words "user" or "the user".

- thingsToRemember: A SINGLE STRING (not an array) containing 2-5 bullet lines. Each bullet starts with "• " and bullets are separated by "\\n" (newline). Focus on: edge cases (empty input, single element, overflow, negatives), non-obvious math/formulas, the key insight, and implementation gotchas. Skip anything obvious. Specific to THIS problem, not generic DSA advice.

  Example format for thingsToRemember:
  "• Watch out for integer overflow when sum exceeds 2^31\\n• Empty array should return 0, not throw\\n• Two-pointer only works because array is sorted"

- topic: Primary DSA topic in 1-3 words (e.g. "Sliding Window", "Hash Map", "Dynamic Programming", "Binary Search").

Global rules:
- Never use the word "user". Use "I" style or describe directly. e.g. "Solved using..." NOT "The user solved..."
- question MUST contain "Example:"
- Output ONLY the JSON object. No markdown fences, no preamble, no explanation.`;
};

const sanitizeMalformedJson = (raw) => {
  // Sometimes models output arrays with bullet chars instead of commas, e.g. [• "a" • "b"]
  // Convert "[ • \"a\" • \"b\" ]" patterns into joined strings.
  return raw.replace(/\[\s*(•[^\]]+)\]/g, (m, inner) => {
    const items = inner.split(/\s*•\s*/).map(s => s.trim()).filter(Boolean).map(s => s.replace(/^"|"$/g, ''));
    return JSON.stringify('• ' + items.join('\\n• '));
  });
};

const coerceToString = (val) => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(item => {
      const s = typeof item === 'string' ? item.trim() : String(item);
      return s.startsWith('•') ? s : `• ${s}`;
    }).join('\n');
  }
  return String(val);
};

const generateRevisionNote = async (input) => {
  if (!client) {
    logger.warn('Groq client not configured — skipping AI generation');
    return null;
  }

  const prompt = buildPrompt(input);

  const attempt = async () => {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object in response');
    const candidate = match[0];
    try {
      return JSON.parse(candidate);
    } catch {
      return JSON.parse(sanitizeMalformedJson(candidate));
    }
  };

  try {
    let result = await attempt();

    if (!result.question?.includes('Example:')) {
      logger.warn('Groq omitted Example: — retrying once');
      result = await attempt();
    }

    if (!result.question?.includes('Example:') && input.exampleTestcase) {
      result.question = (result.question || '') + ` Example: ${input.exampleTestcase}`;
    }

    return {
      questionHumanWords: coerceToString(result.question),
      howISolvedIt: coerceToString(result.howISolvedIt),
      thingsToRemember: coerceToString(result.thingsToRemember),
      topic: coerceToString(result.topic),
    };
  } catch (err) {
    logger.error(`Groq generation failed: ${err.message}`);
    return null;
  }
};

module.exports = { generateRevisionNote };
