import { integer, pgTable, varchar, customType } from 'drizzle-orm/pg-core';

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 64 }).notNull(),
  salt: varchar({ length: 10 }).notNull()
});
