const { google } = require('googleapis');
const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = require('../../config/server-config');
const logger = require('../../config/logger-config');

const HEADERS = ['Date', 'Problem', 'Difficulty', 'Topic', 'URL', 'Question', 'How I Solved It', 'Things to Remember'];

const HEADER_BG = { red: 0.25, green: 0.35, blue: 0.55 };
const HEADER_FG = { red: 1, green: 1, blue: 1 };
const ROW_ALT   = { red: 0.96, green: 0.97, blue: 0.99 };

const getAuthClient = () => {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || GOOGLE_SERVICE_ACCOUNT_EMAIL === 'PLACEHOLDER') {
    throw new Error('Google Sheets not configured. Add credentials to your .env');
  }
  return new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

const extractSheetId = (urlOrId) => {
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId;
};

const getSheetMeta = async (sheets, spreadsheetId) => {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets[0];
  return { sheetId: sheet.properties.sheetId, title: sheet.properties.title };
};

const getRows = async (sheets, spreadsheetId, title) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!A:Z`,
  });
  return res.data.values || [];
};

const COL_WIDTHS = [90, 200, 90, 140, 200, 320, 320, 320];

const applyFormatting = async (sheets, spreadsheetId, sheetId, totalRows) => {
  const requests = [
    // Header row: blue bg, white bold text, wrap, middle-align
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: HEADERS.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: HEADER_BG,
            textFormat: { bold: true, foregroundColor: HEADER_FG, fontSize: 10 },
            verticalAlignment: 'MIDDLE',
            horizontalAlignment: 'CENTER',
            wrapStrategy: 'WRAP',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,horizontalAlignment,wrapStrategy)',
      },
    },
    // Data rows: wrap + top-align + white background
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: Math.max(totalRows, 50), startColumnIndex: 0, endColumnIndex: HEADERS.length },
        cell: {
          userEnteredFormat: {
            wrapStrategy: 'WRAP',
            verticalAlignment: 'TOP',
            backgroundColor: { red: 1, green: 1, blue: 1 },
          },
        },
        fields: 'userEnteredFormat(wrapStrategy,verticalAlignment,backgroundColor)',
      },
    },
    // Alternating light tint on even rows
    {
      addBanding: {
        bandedRange: {
          range: { sheetId, startRowIndex: 1, endRowIndex: Math.max(totalRows, 50), startColumnIndex: 0, endColumnIndex: HEADERS.length },
          rowProperties: {
            firstBandColor: { red: 1, green: 1, blue: 1 },
            secondBandColor: ROW_ALT,
          },
        },
      },
    },
    // Freeze header
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    // Set row height for data rows to give breathing room
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: Math.max(totalRows, 50) },
        properties: { pixelSize: 120 },
        fields: 'pixelSize',
      },
    },
    // Set header row height
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 40 },
        fields: 'pixelSize',
      },
    },
    // Set fixed column widths
    ...COL_WIDTHS.map((width, i) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    })),
  ];

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
};

const syncRevision = async (revision, sheetUrl) => {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = extractSheetId(sheetUrl);
  const { sheetId, title } = await getSheetMeta(sheets, spreadsheetId);

  let rows = await getRows(sheets, spreadsheetId, title);
  const isNewSheet = rows.length === 0;

  if (isNewSheet) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
    rows = [HEADERS];
  }

  const headerRow = rows[0];
  const slugColIdx = headerRow.indexOf('Problem');
  const existingRowIndex = rows.findIndex((row, i) => i > 0 && row[slugColIdx] === (revision.title || revision.problemSlug));

  const rowData = [
    revision.solvedAt ? new Date(revision.solvedAt).toLocaleDateString() : new Date(revision.createdAt).toLocaleDateString(),
    revision.title || revision.problemSlug,
    revision.difficulty || '',
    revision.topic || '',
    revision.url || '',
    revision.questionHumanWords || '',
    revision.howISolvedIt || '',
    revision.thingsToRemember || '',
  ];

  if (existingRowIndex > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!A${existingRowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });
    logger.info(`Updated row ${existingRowIndex + 1} for ${revision.problemSlug}`);
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });
    logger.info(`Appended new row for ${revision.problemSlug}`);
  }

  const updatedRows = await getRows(sheets, spreadsheetId, title);
  await applyFormatting(sheets, spreadsheetId, sheetId, updatedRows.length).catch(err => {
    if (!err.message?.includes('already exists')) {
      logger.warn(`Sheet formatting partial: ${err.message}`);
    }
  });
};

module.exports = { syncRevision };
