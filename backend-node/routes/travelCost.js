const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/travelCostController');
const auth = require('../middlewares/authmiddlewares');
const allow = require('../middlewares/rolemiddlewares');

router.get('/', auth, controller.getAll);
router.post('/',
  auth, allow('Admin'),
  body('FromDestinationID').isInt(),
  body('ToDestinationID').isInt(),
  body('Cost').isFloat({ min: 0 }),
  controller.upsert
);

module.exports = router;
