import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import { hashPassword } from '../../../utils/crypto_utils';

export const signup = async (req: Request, res: Response, next: NextFunction)  => {
  try {
    let salt = crypto.randomBytes(16);
    console.info(req)
    const {username, password} = {...req.body}
    let hashed_password: string = await hashPassword(password, salt.toString('hex'));

    res.status(200).send("Checkout this hash password" + hashed_password);
  } catch(err) {
    next(err);
  }
};
