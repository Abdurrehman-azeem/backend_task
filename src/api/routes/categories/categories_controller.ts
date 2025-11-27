import { Router } from "express";

import { passportJWTMiddleware } from "../auth/auth_middleware";
import { CatergoryRetrievalHandler, CategoryCreationHandler, CategoryUpdateHandler, CategoryDeletionHandler } from "./categories_methods";
import { CategoryCreationRule, CategoryUpdateRule, CategoryDeleteRule } from "./validation_rules";
import { ValidateCategoryRequests } from "./Categories_validation";

const CategoriesRouter = Router();

CategoriesRouter.get('/categories',
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  CatergoryRetrievalHandler
);
CategoriesRouter.post('/categories/',
  CategoryCreationRule, ValidateCategoryRequests,
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  CategoryCreationHandler
);
CategoriesRouter.put('/categories/:id/',
  CategoryUpdateRule, ValidateCategoryRequests,
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  CategoryUpdateHandler
);
CategoriesRouter.delete('/categories/:id/',
  CategoryDeleteRule, ValidateCategoryRequests,
  passportJWTMiddleware.authenticate('jwt', { failureMessage: true, session: false }),
  CategoryDeletionHandler
)

export default CategoriesRouter;
