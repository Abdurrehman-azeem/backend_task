import './config';
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';

import routes from './api/routes/routes';
import CustomError from './api/errors/errors';
import { sessionMiddleware, passportJWTMiddleware } from './api/routes/auth/auth_middleware';

const app = express();

// Add various middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((
  err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction
) => {
  if (err && err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'User is not authorized'
    });
  } else if (err && err.errCode) {
    res.status(err.errCode).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Unexpected Error Encountered." });
  }
});
app.use(sessionMiddleware);

// Add routes
app.use(routes);
app.get('/health-check', (req: express.Request, res: express.Response) => {
  res.json({ message: "Voucher & Promotion Management system is running!" });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}.`)
})
