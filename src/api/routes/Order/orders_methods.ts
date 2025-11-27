import { Request, Response, NextFunction } from "express";

import { GetOrders, CreateNewOrder, UpdateOrder, DeleteOrderWithData } from "../../../db/models/order";



export const NewOrderCreationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("hello?")
    let productQuantityMap: Map<number, number> = new Map<number, number>();
    req.body.products.map((product_obj: any) =>
      productQuantityMap.set(product_obj.product_id, product_obj.quantity));
    // if (!req.user || !req.user?.id) {
    //   throw new Error("user was not intialised.")
    // }
    let newOrder = await CreateNewOrder(1, req.body.product_ids);

    res.status(201).json({
      data: {
        order: newOrder
      },
    });
  } catch(err) {
    console.error("encountered an error in NewOrderCreationHandler", err);
    return next(err);
  }
}
