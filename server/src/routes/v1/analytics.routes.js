const { Router } = require('express');
const { AnalyticsController } = require('../../controllers');
const { authenticate } = require('../../middlewares');

const router = Router();

router.get('/summary', authenticate, AnalyticsController.summary);

module.exports = router;
