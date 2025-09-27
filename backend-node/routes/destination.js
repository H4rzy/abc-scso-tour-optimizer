const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/destinationController');
const auth = require('../middlewares/authmiddlewares');
const allow = require('../middlewares/rolemiddlewares');

router.get('/', auth, controller.getAll);
router.post('/',
  auth, allow('Admin'),
  body('Name').notEmpty().withMessage('Name bắt buộc'),
  controller.create
);

module.exports = router;
