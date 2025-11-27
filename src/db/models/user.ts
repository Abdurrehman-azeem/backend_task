import { eq } from 'drizzle-orm';

import { drizzle_client as db } from '../client';
import { UsersTable } from '../schema';

export const findUserByUsername = async (username: string) => {
  try {
    let user = await db.select().from(UsersTable)
      .where(eq(UsersTable.username, username))
      .limit(1)
      .then(rows => { return rows[0] || null; });
    return user
  } catch(err) {
    console.error(err);
    return err;
  }
};

export const findUserById = async (id: number) => {
  try {
    let user = await db.select().from(UsersTable)
      .where(eq(UsersTable.id, id))
      .limit(1)
      .then(rows => { return rows[0] || null; });
    return user;
  } catch(err) {
    console.error(err);
    return err;
  }
}
