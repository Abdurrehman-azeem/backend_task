import { eq } from 'drizzle-orm';
import { drizzle_client as db } from '../client';
import { CategoriesTable } from '../schema';

export const FindAllCategories = async () => {
  try {
    let categories = await db.select().from(CategoriesTable);
    return categories;
  } catch (err) {
    console.error(err);
    return err;
  }
};

export const CreateNewCategory = async (name: string) => {
  try {
    let category = await db.insert(CategoriesTable)
      .values({ name: name }).returning();
    return category;
  } catch (err) {
    console.error(err);
    return err;
  }
};

export const UpdateCategory = async (id: number, name: string) => {
  try {
    let updatedCategory = await db.update(CategoriesTable).set({ name: name })
      .where(eq(CategoriesTable.id, id)).returning();

    return updatedCategory;
  } catch(err) {
    console.error(err);
    return err;
  }
};

export const DeleteCategory = async (id: number) => {
  try {
    let deletedCategory = await db.delete(CategoriesTable)
      .where(eq(CategoriesTable.id, id)).returning();
    return deletedCategory;
  } catch(err) {
    console.error(err);
    return err;
  };
};
