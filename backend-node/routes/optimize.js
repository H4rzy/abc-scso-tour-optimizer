const express = require('express');
const router = express.Router();
const controller = require('../controllers/optimizeController');
const auth = require('../middlewares/authmiddlewares');
const allow = require('../middlewares/rolemiddlewares');

router.post('/upload', auth, allow('Admin'), controller.uploadAndRun);

module.exports = router;
