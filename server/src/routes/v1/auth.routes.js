const { Router } = require('express');
const { AuthController } = require('../../controllers');
const { authenticate } = require('../../middlewares');

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);

module.exports = router;
