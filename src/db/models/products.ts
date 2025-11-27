import { eq, and, inArray } from "drizzle-orm";

import { drizzle_client as db } from "../client";
import {
  CategoriesTable,
  ProductCategoriesTable,
  ProductsTable,
} from "../schema";
import { ilike } from "drizzle-orm";

interface Category {
  id: number;
  name: string;
}

interface ProductWithRelations {
  id: number;
  name: string;
  price: string;
  createdAt: string;
  categoriesToProducts: Array<{
    category: Category;
  }>;
}

export interface TransformedProduct {
  product: {
    id: number;
    name: string;
    price: string;
    createdAt: string;
  };
  AssociatedCategories: Category[];
}

export const GetProductsAndCategories = async (
  id: number | null,
  name: string | null,
): Promise<TransformedProduct | TransformedProduct[] > => {
  try {
    let whereConditionProducts: any = [];

    if (id) {
      whereConditionProducts.push(eq(ProductsTable.id, id));
    }
    if (name) {
      whereConditionProducts.push(ilike(ProductsTable.name, `%${name}%`));
    }

    if (whereConditionProducts.length === 0) {
      whereConditionProducts = undefined;
      let result:any = await db.query.ProductsTable.findMany({
        columns: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
        with: {
          categoriesToProducts: {
            columns: {},
            with: {
              category: true,
            },
          },
        },
      });

      if (!result || result.length > 0) {
        return result.map(transformProduct);
      }
    }

    let result:any = await db.query.ProductsTable.findFirst({
      where: and(...whereConditionProducts),
      columns: {
        id: true,
        name: true,
        price: true,
        createdAt: true,
      },
      with: {
        categoriesToProducts: {
          columns: {},
          with: {
            category: true,
          },
        },
      },
    });

    if (result) {
      return transformProduct(result);
    }

    let emptyResult: TransformedProduct = {
      product: {
        id: 0,
        name: "",
        price: "",
        createdAt: "",
      },
      AssociatedCategories: [],
    };
    return emptyResult;

  } catch (err) {
    console.error(
      "ran into an error while trying to run GetProductsAndCategories",
      err,
    );
    throw err;
  }
};

export const CreateNewProductWithCategories = async (
  name: string,
  price: number,
  category_ids: number[] | null,
): Promise<TransformedProduct> => {
  try {
    let result = await db.transaction(async (tx) => {
      let [product] = await tx
        .insert(ProductsTable)
        .values({ name: name, price: price.toString() })
        .returning();

      if (!product || !product.id) {
        throw new Error(
          "Failed to create product or get newly created product's id.",
        );
      }

      if (category_ids && category_ids?.length > 0) {
        let existingRelations = await tx
          .select()
          .from(ProductCategoriesTable)
          .where(
            and(
              eq(ProductCategoriesTable.productId, product.id),
              inArray(ProductCategoriesTable.categoryId, category_ids),
            ),
          );

        let existingCategoryIds = existingRelations.map(
          (rel) => rel.categoryId,
        );
        let categoriesToAdd = category_ids.filter(
          (catId) => !existingCategoryIds.includes(catId),
        );

        if (categoriesToAdd.length > 0) {
          await tx.insert(ProductCategoriesTable).values(
            categoriesToAdd.map((categoryId) => ({
              productId: product.id,
              categoryId: categoryId,
            })),
          );
        }
      }

      let result:any = await tx.query.ProductsTable.findFirst({
        where: eq(ProductsTable.id, product.id),
        columns: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
        with: {
          categoriesToProducts: {
            with: {
              category: true,
            },
          },
        },
      });

      if (result) {
        return transformProduct(result);
      }

      let emptyResult: TransformedProduct = {
        product: {
          id: 0,
          name: "",
          price: "",
          createdAt: "",
        },
        AssociatedCategories: [],
      };
      return emptyResult;
    });
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const UpdateProductAndAddCategories = async (
  name: string | null,
  price: number | null,
  product_id: number,
  categories_to_be_added: number[] | null,
  categories_to_be_removed: number[] | null,
) => {
  try {
    return await db.transaction(async (tx) => {
      let updateData: any = {};
      if (name !== null) {
        updateData.name = name;
      }

      if (price !== null) {
        updateData.price = price.toString();
      }

      if (Object.keys(updateData).length > 0) {
        await tx
          .update(ProductsTable)
          .set(updateData)
          .where(eq(ProductsTable.id, product_id));
      }

      if (categories_to_be_removed && categories_to_be_removed.length > 0) {
        await tx
          .delete(ProductCategoriesTable)
          .where(
            and(
              eq(ProductCategoriesTable.productId, product_id),
              inArray(
                ProductCategoriesTable.categoryId,
                categories_to_be_removed,
              ),
            ),
          );
      }

      if (categories_to_be_added && categories_to_be_added.length > 0) {
        let existingRelations = await tx
          .select()
          .from(ProductCategoriesTable)
          .where(
            and(
              eq(ProductCategoriesTable.productId, product_id),
              inArray(
                ProductCategoriesTable.categoryId,
                categories_to_be_added,
              ),
            ),
          );

        let existingCategoryIds = existingRelations.map(
          (rel) => rel.categoryId,
        );
        let categoriesToAdd = categories_to_be_added.filter(
          (catId) => !existingCategoryIds.includes(catId),
        );

        if (categoriesToAdd.length > 0) {
          await tx.insert(ProductCategoriesTable).values(
            categoriesToAdd.map((categoryId) => ({
              productId: product_id,
              categoryId: categoryId,
            })),
          );
        }
      }

      let updatedProduct = await tx.query.ProductsTable.findFirst({
        where: eq(ProductsTable.id, product_id),
        columns: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
        with: {
          productCategoriesRelations: {
            columns: {},
            with: {
              category: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return updatedProduct;
    });
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
};

function transformProduct(input: ProductWithRelations): TransformedProduct {
  const { id, name, price, createdAt, categoriesToProducts } = input;

  return {
    product: {
      id,
      name,
      price,
      createdAt,
    },
    AssociatedCategories: categoriesToProducts.map((item) => item.category),
  };
}
