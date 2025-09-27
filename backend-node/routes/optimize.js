const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/optimizeController');
const auth = require('../middlewares/authmiddlewares');

router.post('/',
  auth,
  body('DestinationIDs').isArray({ min: 2 }),
  controller.optimizeTour
);

module.exports = router;
