const { Router } = require('express');
const { IntegrationController } = require('../../controllers');
const { authenticate } = require('../../middlewares');

const router = Router();

// Public (no auth)
router.get('/sheets-config', IntegrationController.getSheetsConfig);
router.get('/notion/callback', IntegrationController.notionCallback);

router.use(authenticate);

// Google Sheets
router.get('/', IntegrationController.getIntegration);
router.post('/google-sheets', IntegrationController.saveGoogleSheets);

// Notion OAuth
router.get('/notion/auth-url', IntegrationController.getNotionAuthUrl);
router.get('/notion/databases', IntegrationController.getNotionDatabases);
router.post('/notion/database', IntegrationController.saveNotionDatabase);
router.delete('/notion', IntegrationController.disconnectNotion);

module.exports = router;
