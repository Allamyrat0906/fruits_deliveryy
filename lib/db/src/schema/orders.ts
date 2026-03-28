import { pgTable, serial, integer, doublePrecision, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { fruitsTable } from "./fruits";

export const orderStatusEnum = pgEnum("order_status", ["ОЖИДАНИЕ", "ПОДТВЕРЖДЁН", "ОТПРАВЛЕН", "ДОСТАВЛЕН", "ОТМЕНЁН"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  status: orderStatusEnum("status").notNull().default("ОЖИДАНИЕ"),
  totalPrice: doublePrecision("total_price").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull().default(""),
  paidAmount: doublePrecision("paid_amount"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  fruitId: integer("fruit_id").notNull().references(() => fruitsTable.id),
  quantity: integer("quantity").notNull(),
  weight: text("weight").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
