const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/tourController');
const auth = require('../middlewares/authmiddlewares');
const allow = require('../middlewares/rolemiddlewares');

router.get('/', auth, controller.listTours);
router.get('/:id', auth, controller.getTourDetail);
router.post('/',
  auth, allow('Admin'),
  body('TourName').notEmpty(),
  body('TotalCost').isFloat({ min: 0 }),
  body('Steps').isArray({ min: 1 }),
  controller.saveTour
);

module.exports = router;
