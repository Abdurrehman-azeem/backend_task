import { body, param } from 'express-validator';

export const CategoryCreationRule = [
  body('name').exists().withMessage('Category name is required.').notEmpty().withMessage('Category name cannot be empty/'),
];

export const CategoryUpdateRule = [
  param('id').exists().withMessage('Catergory id is required.'),
  body('name').exists().withMessage('Category name is required to be updated.').notEmpty().withMessage('Category name cannot be empty.'),
];

export const CategoryDeleteRule = [
  param('id').exists().withMessage('Category id is required for deletion.')
];
