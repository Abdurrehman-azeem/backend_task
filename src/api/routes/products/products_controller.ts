import { Router } from "express";

import { passportJWTMiddleware } from "../auth/auth_middleware";
import { NewProductCreationHandler, ProductRetrievalHandler } from "./products_methods";
import { ProductCreationRules, ProductRetrievalRules } from "./validation_rules";
import { ValidateProductRequest } from "./products_validation";

const ProductsRouter = Router();

ProductsRouter.get('/products', ProductRetrievalRules, ValidateProductRequest,
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  ProductRetrievalHandler
);
ProductsRouter.post('/products/', ProductCreationRules,
  ValidateProductRequest,
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  NewProductCreationHandler
);

export default ProductsRouter;
