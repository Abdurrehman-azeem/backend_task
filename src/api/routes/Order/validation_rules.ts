import { body } from 'express-validator';

export const OrderCreationValidationRules = [
  body('products')
    .isArray({ min: 1 })
    .withMessage('must not be empty')
    .notEmpty()
    .withMessage('atleast one product must be provided'),

  body('products.*.product_id')
    .isInt({ min: 1 })
    .withMessage('product id can not be 0 or negative'),

  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('quantity cannot be 0 or negative')
];
