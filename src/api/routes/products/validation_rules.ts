import { body, query } from 'express-validator';

export const ProductCreationRules = [
  body('name').exists().withMessage('A name for the Product must be provided.'),
  body('price')
    .exists()
    .withMessage('A price for the product must be provided.')
    .bail()
    .isFloat({ gt: 0 }),
  body('category_ids')
    .optional()
    .isArray()
    .isInt({ min: 1 })
];

export const ProductRetrievalRules = [
  query('id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Id must be a number greater than 0'),

  query('name')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage('Name must not be empty')
    .trim(),
];
