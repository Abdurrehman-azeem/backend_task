import { Request, Response, NextFunction } from "express";

import { FindAllCategories, CreateNewCategory, UpdateCategory, DeleteCategory } from "../../../db/models/categories";

export const CatergoryRetrievalHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let categories = await FindAllCategories();
    res.status(200).json({ data: categories })
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

export const CategoryCreationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let category = await CreateNewCategory(req.body.name);

    res.status(201).json({ data: category });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

export const CategoryUpdateHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let category = await UpdateCategory(Number(req.params.id), req.body.name);

    res.status(201).json({ data: category });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

export const CategoryDeletionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let category = await DeleteCategory(Number(req.params.id));

    res.status(201).json({ data: category });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
