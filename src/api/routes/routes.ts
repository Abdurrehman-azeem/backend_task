import { Router } from 'express';

import AuthRouter from './auth/auth_controller';

const api = Router()
  .use(AuthRouter)

export default Router().use('/api', api);
