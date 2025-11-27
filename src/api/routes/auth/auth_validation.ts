import { validationResult, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSignupRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const errArr: { [key: string]: string }[] = [];
  errors.array().forEach((err: any) => {
    errArr.push({ fieldName: err.path, error: err.msg });
  });

  res.status(400).json({
    errors: errArr
  });
}

export const validateLoginRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const errArr: { [key: string]: string }[] = [];
  errors.array().map((err:any) => {
    errArr.push({ fieldName: err.path, error: err.msg });
  });

  res.status(400).json({
    errors: errArr
  });
}
