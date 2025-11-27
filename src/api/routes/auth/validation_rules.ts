import { body } from 'express-validator';

export const userSignupRules = [
  body('username').exists().withMessage('Username must be provided.'),
  body('password')
    .exists()
    .withMessage('Password should exist.')
    .bail()
    .isLength({ min: 8, max: 20 })
    .withMessage('Password should have atleast 8 characters and a maximum of 20 characters'),
]

export const userLoginRules = [
  body('username').exists().notEmpty().withMessage('Username must be provided'),
  body('password')
    .exists()
    .withMessage('Password must be provided.')
]
