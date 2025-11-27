import { Router } from "express";

import { passportJWTMiddleware } from "../auth/auth_middleware";
import { ValidateOrderRequest } from "./orders_validation";
import { OrderCreationValidationRules } from "./validation_rules";
import { NewOrderCreationHandler } from "./orders_methods";

const OrdersRouter = Router();

// OrdersRouter.get('/products', ProductRetrievalRules, ValidateProductRequest,
//   passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
//   ProductRetrievalHandler
// );
// OrdersRouter.post('/products/', ProductCreationRules,
//   ValidateProductRequest,
//   passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
//   NewProductCreationHandler
// );
//OrdersRouter.get('/orders/');
OrdersRouter.post('/orders/', OrderCreationValidationRules, ValidateOrderRequest,
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  NewOrderCreationHandler);
//OrdersRouter.put('/orders/:id');
//OrdersRouter.delete('/orders/:id');

export default OrdersRouter;
