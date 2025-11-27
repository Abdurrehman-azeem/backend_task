import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const ValidateProductRequest = (req: Request, res: Response, next: NextFunction) => {
  let errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  let errArr: { [key: string]: string }[] = [];
  errors.array().forEach((err: any) => {
    errArr.push({ fieldName: err.path, error: err.msg });
  });

  res.status(400).json({
    errors: errArr
  });
}
