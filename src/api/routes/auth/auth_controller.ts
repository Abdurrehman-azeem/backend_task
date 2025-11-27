import { Router, Request, Response } from "express";

import { signup } from "./auth_methods";
import { userLoginRules, userSignupRules } from "./validation_rules";
import { validateSignupRequest } from "./auth_validation";
import { validateLoginRequest } from "./auth_validation";
import { passportLoginMiddleware } from './auth_middleware';
import { createJWTToken } from "../../../utils/crypto_utils";

const AuthRouter = Router();

AuthRouter.post('/users/signup', userSignupRules, validateSignupRequest, signup);
AuthRouter.post('/users/login', userLoginRules,
  validateLoginRequest,
  passportLoginMiddleware.authenticate('local', { failureMessage: true, session: false }),
  (req: Request, res: Response) => {
    const token = createJWTToken(req.user);
    res.status(201).json({ data: req.user, token: token });
  }
);


export default AuthRouter;
