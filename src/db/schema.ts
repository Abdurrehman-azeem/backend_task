import { integer,
  pgTable,
  varchar,
  serial,
  numeric,
  timestamp,
  pgEnum,
  boolean,
  foreignKey,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const DiscountTypeEnum = pgEnum('discount_type', ['promotion', 'voucher']);

export const UsersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 100 }).notNull().unique(),
  password: varchar({ length: 64 }).notNull(),
  salt: varchar({ length: 32 }).notNull()
});

export const OrdersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  total: numeric('total').notNull(),
  user_id: integer('user_id').notNull().references(() => UsersTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const UsersRelations = relations(UsersTable, ({ many }) => ({
  orders: many(OrdersTable),
}));

export const OrdersRelations = relations(OrdersTable, ({ one }) => ({
  user: one(UsersTable, {
    fields: [OrdersTable.user_id],
    references: [UsersTable.id],
  }),
}));

export const ProductsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  price: numeric('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const CategoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ProductCategoriesTable = pgTable(
  'product_categories',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => ProductsTable.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => CategoriesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.categoryId] }),
  })
);

export const ProductsRelations = relations(ProductsTable, ({ many }) => ({
  categoriesToProducts: many(ProductCategoriesTable),
}));

export const CategoriesRelations = relations(CategoriesTable, ({ many }) => ({
  productsToCategories: many(ProductCategoriesTable),
}));

export const ProductCategoriesRelations = relations(ProductCategoriesTable, ({ one }) => ({
  product: one(ProductsTable, {
    fields: [ProductCategoriesTable.productId],
    references: [ProductsTable.id],
  }),
  category: one(CategoriesTable, {
    fields: [ProductCategoriesTable.categoryId],
    references: [CategoriesTable.id],
  }),
}));

export const OrderProductsTable = pgTable('order_products', {
  orderId: integer('order_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  priceAtPurchase: numeric('price_at_purchase'),
}, (table) => ({
  pk: primaryKey({ columns: [table.orderId, table.productId] }),
}));

export const OrdersProductsRelations = relations(OrdersTable, ({ many }) => ({
  orderProducts: many(OrderProductsTable),
}));

export const ProductsOrdersRelations = relations(ProductsTable, ({ many }) => ({
  orderProducts: many(OrderProductsTable),
}));

export const OrderProductsRelations = relations(OrderProductsTable, ({ one }) => ({
  order: one(OrdersTable, {
    fields: [OrderProductsTable.orderId],
    references: [OrdersTable.id],
  }),
  product: one(ProductsTable, {
    fields: [OrderProductsTable.productId],
    references: [ProductsTable.id],
  }),
}));

export const DiscountsTable = pgTable('discounts', {
  id: serial('discount_id').primaryKey(),
  discountType: DiscountTypeEnum('discount_type').notNull(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  usageLimit: integer('usage_limit'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const VouchersTable = pgTable('vouchers', {
  discountId: integer('discount_id').notNull().primaryKey(),
  minimumOrderValue: numeric('minimum_order_value', { precision: 10, scale: 2 }),
  isPublic: boolean('is_public').default(false),
}, (table) => ({
  discountsFk: foreignKey({
    columns: [table.discountId],
    foreignColumns: [DiscountsTable.id],
  }).onDelete('cascade')
}));

export const PromotionsTable = pgTable('promotions', {
  discountId: integer('discount_id').notNull().primaryKey(),
  isAutoApplied: boolean('is_auto_applied').default(false),
}, (table) => ({
  discountsFk: foreignKey({
    columns: [table.discountId],
    foreignColumns: [DiscountsTable.id],
  }).onDelete('cascade'),
}));

export const PromotionProductsTable = pgTable('promotion_products', {
  discountId: integer('discount_id').notNull(),
  productId: integer('product_id').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.discountId, table.productId] }),
  promotionFk: foreignKey({
    columns: [table.discountId],
    foreignColumns: [PromotionsTable.discountId],
  }).onDelete('cascade'),
  productFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [ProductsTable.id],
  }).onDelete('cascade'),
}));

export const PromotionCategoriesTable = pgTable('promotion_categories', {
  discountId: integer('discount_id').notNull(),
  categoryId: integer('category_id').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.discountId, table.categoryId] }),
  promotionFk: foreignKey({
    columns: [table.discountId],
    foreignColumns: [PromotionsTable.discountId],
  }).onDelete('cascade'),
  categoryFk: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [CategoriesTable.id],
  }).onDelete('cascade'),
}));

export const OrderVouchersTable = pgTable('order_vouchers', {
  orderId: integer('order_id').notNull(),
  discountId: integer('discount_id').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.orderId, table.discountId] }),
  orderFk: foreignKey({
    columns: [table.orderId],
    foreignColumns: [OrdersTable.id],
  }).onDelete('cascade'),
  voucherFk: foreignKey({
    columns: [table.discountId],
    foreignColumns: [VouchersTable.discountId],
  }).onDelete('cascade'),
}));

export const Schema = {
  UsersTable,
  OrdersTable,
  ProductsTable,
  CategoriesTable,
  ProductCategoriesTable,
  OrderProductsTable,
  DiscountsTable,
  VouchersTable,
  PromotionsTable,
  PromotionProductsTable,
  PromotionCategoriesTable,
  OrderVouchersTable,

  UsersRelations,
  OrdersRelations,
  ProductsRelations,
  CategoriesRelations,
  ProductCategoriesRelations,
  OrdersProductsRelations,
  ProductsOrdersRelations,
  OrderProductsRelations,
};
