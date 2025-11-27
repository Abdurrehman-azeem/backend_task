import { eq, inArray, and } from "drizzle-orm";

import { drizzle_client as db } from "../client";
import {
  UsersTable,
  OrdersTable,
  ProductsTable,
  OrderProductsTable,
} from "../schema";

interface OrderWithProducts {
  [key: string]: any; // Allow extra fields
  id: number;
  user_id: number;
  total: string;
  createdAt: string;
  orderProducts: any[];
}

export const CreateNewOrder = async (
  user_id: number,
  product_map: Map<number, number>,
) => {
  try {
    await db.transaction(async (tx) => {
      let product_ids: number[] = Array.from(product_map.keys());
      let user = await tx.query.UsersTable.findFirst({
        where: eq(UsersTable.id, user_id),
      });

      if (!user) {
        throw new Error(`User with ID ${user_id} not found`);
      }

      if (product_ids.length === 0) {
        let [newOrder] = await tx
          .insert(OrdersTable)
          .values({
            user_id,
            total: "0.00",
          })
          .returning();

        return {
          order: newOrder,
          items: [],
        };
      }

      let products = await tx.query.ProductsTable.findMany({
        where: inArray(ProductsTable.id, product_ids),
      });

      let productMap = new Map(products.map((p) => [p.id, p]));
      let missingIds = product_ids.filter((id) => !productMap.has(id));

      if (missingIds.length > 0) {
        throw new Error(
          `Could not fnd the following products with ${missingIds.join(", ")}`,
        );
      }

      let total = products.reduce((sum, product) => {
        return sum + Number(product.price);
      }, 0);

      let [newOrder] = await tx
        .insert(OrdersTable)
        .values({
          user_id,
          total: total.toFixed(2),
        })
        .returning();
      if (!newOrder) {
        throw new Error("Order was not created, and if created not returned.");
      }

      await tx.insert(OrderProductsTable).values(
        product_ids.map((productId) => ({
          orderId: newOrder.id,
          productId,
          quantity: 1,
          priceAtPurchase: productMap.get(productId)!.price,
        })),
      );

      let completeOrder: any = await tx.query.OrdersTable.findFirst({
        where: eq(OrdersTable.id, newOrder.id),
        with: {
          orderProducts: {
            with: {
              product: true,
            },
          },
        },
      });

      if (!completeOrder) {
        throw new Error("Failed to retrieve created order");
      }

      return {
        order: completeOrder,
        items: completeOrder.orderProducts,
      };
    });
  } catch (err) {
    console.error("Error encountered in CreateNewOrder method", err);
    throw err;
  }
};

export const GetOrders = async (
  orderIds?: number[],
): Promise<OrderWithProducts[] | any> => {
  try {
    if (orderIds && orderIds.length > 0) {
      const orders = await db.query.OrdersTable.findMany({
        where: inArray(OrdersTable.id, orderIds),
        with: {
          orderProducts: {
            with: {
              product: true,
            },
          },
        },
      });

      const foundIds = orders.map((order) => order.id);
      const missingIds = orderIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new Error(`Orders with IDs ${missingIds.join(", ")} not found`);
      }

      return orders;
    }

    return await db.query.OrdersTable.findMany({
      with: {
        orderProducts: {
          with: {
            product: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Encountered an error while trying to fetch orders.", err);
    throw err;
  }
};

export const DeleteOrderWithData = async (orderId: number): Promise<OrderWithProducts[] | any> => {
  try {
    return await db.transaction(async (tx) => {
      const order = await tx.query.OrdersTable.findFirst({
        where: eq(OrdersTable.id, orderId),
        with: {
          orderProducts: {
            with: { product: true }
          }
        }
      });

      if (!order) {
        throw new Error(`Order with id ${orderId} not found`);
      }

      await tx.delete(OrderProductsTable)
        .where(eq(OrderProductsTable.orderId, orderId));

      await tx.delete(OrdersTable)
        .where(eq(OrdersTable.id, orderId));

      return order;
    });
  } catch(err) {
    console.error("Error encountered in function DeleteOrderWithData.\n", err);
    throw err;
  }
}

const ValidateProductsExist = async (
  tx: any,
  productIds: number[],
  action: string
): Promise<void> => {
  try {
    if (productIds.length === 0) return;

    let products = await tx.query.ProductsTable.findMany({
      where: inArray(ProductsTable.id, productIds)
    });

    let foundIds = new Set(products.map((p:any) => p.id));
    let missingIds = productIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new Error(`Cannot ${action} non-existent products: ${missingIds.join(', ')}`);
    }
  } catch(err) {
    console.error("Encountered an error validation whether Products against ids provided exist", err)
    throw err;
  }
}

const ValidateProductsInOrder = async (
  tx: any,
  orderId: number,
  productIds: number[],
  action: string
): Promise<void> => {
  try {
    if (productIds.length === 0) return;

    let orderProducts = await tx.query.OrderProductsTable.findMany({
      where: eq(OrderProductsTable.orderId, orderId)
    });

    let existingIds = new Set(orderProducts.map((op:any) => op.productId));
    let invalidIds = productIds.filter(id =>
      action === 'remove' ? !existingIds.has(id) : existingIds.has(id)
    );

    if (invalidIds.length > 0) {
      let error_msg = action === 'remove'
        ? `Cannot remove products not in order: ${invalidIds.join(', ')}`
        : `Products already in order: ${invalidIds.join(', ')}`;
      throw new Error(error_msg);
    }
  } catch(err) {
    console.error('Encountered error while trying to Validate Products association with Order', err);
    throw err;
  }
}

export const UpdateOrder = async (
  orderId: number,
  addProductIds: number[] = [],
  removeProductIds: number[] = []
): Promise<OrderWithProducts> => {
  try {
    let overlap = addProductIds.filter((id:any) => removeProductIds.includes(id));
    if (overlap.length > 0) {
      throw new Error(`Redundant request: Products ${overlap.join(', ')} are in both add and remove lists`);
    }
    return await db.transaction(async (tx) => {
      let order = await tx.query.OrdersTable.findFirst({
        where: eq(OrdersTable.id, orderId)
      });
      if (!order) throw new Error(`Order ${orderId} not found`);

      await ValidateProductsExist(tx, addProductIds, 'add');
      await ValidateProductsExist(tx, removeProductIds, 'remove');

      await ValidateProductsInOrder(tx, orderId, removeProductIds, 'remove');
      await ValidateProductsInOrder(tx, orderId, addProductIds, 'add');

      if (removeProductIds.length > 0) {
        await tx.delete(OrderProductsTable)
          .where(
            and(
              eq(OrderProductsTable.orderId, orderId),
              inArray(OrderProductsTable.productId, removeProductIds)
            )
          );
      }

      if (addProductIds.length > 0) {
        let products = await tx.query.ProductsTable.findMany({
          where: inArray(ProductsTable.id, addProductIds)
        });

        await tx.insert(OrderProductsTable).values(
          products.map(p => ({
            orderId,
            productId: p.id,
            quantity: 1,
            priceAtPurchase: p.price
          }))
        );
      }

      let orderProducts = await tx.query.OrderProductsTable.findMany({
        where: eq(OrderProductsTable.orderId, orderId),
        with: { product: true }
      });

      let newTotal = orderProducts.reduce(
        (sum, item) => sum + Number(item.priceAtPurchase),
        0
      );

      await tx.update(OrdersTable)
        .set({ total: newTotal.toFixed(2) })
        .where(eq(OrdersTable.id, orderId));

      let result = await tx.query.OrdersTable.findFirst({
        where: eq(OrdersTable.id, orderId),
        with: {
          orderProducts: {
            with: { product: true }
          }
        }
      });

      if (!result) {
        throw new Error("Could not find Order after updating it.")
      }

      return result;
    });
  } catch (err) {
    console.error('Encountered an error in UpdateOrders function', err);
    throw err;
  }
}
