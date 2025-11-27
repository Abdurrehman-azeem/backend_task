import { Request, Response, NextFunction } from "express";

import { UpdateProductAndAddCategories,
  GetProductsAndCategories,
  CreateNewProductWithCategories, TransformedProduct } from "../../../db/models/products";

export const NewProductCreationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let product: TransformedProduct | unknown = await CreateNewProductWithCategories(req.body.name, req.body.price, req.body.category_ids);

    res.status(201).json({
      data: {
        newProduct: product
      },
    });
  } catch(err) {
    console.error("encountered an error in NewProductCreationHandler", err);
    return next(err);
  }
}

export const ProductRetrievalHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let params:any = {};

    if (req.query.id) {
      params.id = Number(req.query.id);
    }
    if (req.query.name) {
      params.name = req.query.name;
    }

    let products: TransformedProduct | TransformedProduct[] | unknown = await GetProductsAndCategories(params.id, params.name);

    res.status(201).json({
      data: {
        Product: products
      },
    });
  } catch(err) {
    console.error("encountered an error in NewProductCreationHandler", err);
    return next(err);
  }
}
