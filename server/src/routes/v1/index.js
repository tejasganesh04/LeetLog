const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/revisions', require('./revision.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/integrations', require('./integration.routes'));

module.exports = router;
