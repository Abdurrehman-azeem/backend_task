import { Router } from "express";

import { signup } from "./auth_methods";

const AuthRouter = Router();

AuthRouter.post('/users/signup/', signup);

export default AuthRouter;
