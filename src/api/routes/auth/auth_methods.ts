import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import { hashPassword } from '../../../utils/crypto_utils';
import { drizzle_client as db } from '../../../db/client';
import { UsersTable } from '../../../db/schema';

export const signup = async (req: Request, res: Response, next: NextFunction)  => {
  try {
    let salt = crypto.randomBytes(16);
    const {username, password} = {...req.body}
    let hashedPassword: string = await hashPassword(password, salt.toString('hex'));
    let user: any = await db.insert(UsersTable).values({
        username: username.toString(),
        password: hashedPassword.toString(),
        salt: salt.toString('hex'),
    }).returning();

    res.status(201).send({message: `User ${user.username} successfully created!`});
  } catch(err: any) {
    if (err.cause.code === '23505') { // Error code for Postgresql Uniqueness violation.
      res.status(400).json({
        message: `User with username ${req.body.username} already exists.`
      });
    }

    return next(err);
  }
};
