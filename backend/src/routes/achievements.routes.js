const express = require('express');
const { body, param } = require('express-validator');
const { list, create, update, remove } = require('../controllers/achievements.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', list);

router.post(
  '/',
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').optional().isIn(['certificate', 'training', 'award', 'seminar', 'other']).withMessage('Invalid category'),
    body('proofType').optional().isIn(['file', 'url']).withMessage('Invalid proof type'),
    body('proofUrl').optional().trim(),
  ],
  validate,
  create
);

router.put(
  '/:id',
  upload.single('file'),
  [
    param('id').isMongoId().withMessage('Invalid achievement id'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('category').optional().isIn(['certificate', 'training', 'award', 'seminar', 'other']).withMessage('Invalid category'),
    body('proofType').optional().isIn(['file', 'url']).withMessage('Invalid proof type'),
    body('proofUrl').optional().trim(),
  ],
  validate,
  update
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid achievement id')], validate, remove);

module.exports = router;
