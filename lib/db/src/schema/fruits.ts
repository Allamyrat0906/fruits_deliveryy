import { pgTable, serial, text, doublePrecision, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", ["МЕСТНЫЕ", "ТРОПИЧЕСКИЕ", "ОРГАНИЧЕСКИЕ", "ИМПОРТНЫЕ"]);

export const fruitsTable = pgTable("fruits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  discountPrice: doublePrecision("discount_price"),
  stock: integer("stock").notNull().default(0),
  category: categoryEnum("category").notNull(),
  organic: boolean("organic").notNull().default(false),
  imageUrl: text("image_url"),
  images: text("images").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFruitSchema = createInsertSchema(fruitsTable).omit({ id: true, createdAt: true });
export type InsertFruit = z.infer<typeof insertFruitSchema>;
export type Fruit = typeof fruitsTable.$inferSelect;
