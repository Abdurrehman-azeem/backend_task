import { Router } from 'express';

import AuthRouter from './auth/auth_controller';
import CategoriesRouter from './categories/categories_controller';
import ProductsRouter from './products/products_controller';
import OrdersRouter from './Order/orders_controller';

const api = Router()
  .use(AuthRouter)
  .use(CategoriesRouter)
  .use(ProductsRouter)
  .use(OrdersRouter)

export default Router().use('/api', api);
