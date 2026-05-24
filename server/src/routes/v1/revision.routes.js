const { Router } = require('express');
const { RevisionController } = require('../../controllers');
const { authenticate } = require('../../middlewares');

const router = Router();

router.use(authenticate);

router.get('/export/csv', RevisionController.exportCSV);
router.get('/', RevisionController.getAll);
router.post('/', RevisionController.create);
router.post('/upsert-session', RevisionController.upsertSession);
router.get('/:id', RevisionController.getById);
router.put('/:id', RevisionController.update);
router.delete('/:id', RevisionController.remove);
router.post('/:id/events', RevisionController.addEvent);
router.post('/:id/generate', RevisionController.generateNotes);
router.post('/:id/sync/sheets', RevisionController.syncToSheets);
router.post('/:id/sync/notion', RevisionController.syncToNotion);

module.exports = router;
