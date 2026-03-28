import { Router } from "express";
import { db } from "@workspace/db";
import { fruitsTable } from "@workspace/db/schema";
import { eq, ilike, gte, lte, and, isNotNull, SQL } from "drizzle-orm";
import { requireAdmin, AuthRequest } from "../middlewares/auth.js";
import { GetFruitsQueryParams, CreateFruitBody } from "@workspace/api-zod";

const router = Router();

function withInStock(fruit: any) {
  return { ...fruit, inStock: (fruit.stock ?? 0) > 0 };
}

router.get("/", async (req, res) => {
  try {
    const parsed = GetFruitsQueryParams.safeParse(req.query);

    const conditions: SQL[] = [];
    let page = 1;
    let limit = 12;

    if (parsed.success) {
      const p = parsed.data;
      page = p.page ?? 1;
      limit = p.limit ?? 12;
      if (p.category) conditions.push(eq(fruitsTable.category, p.category));
      if (p.organic !== undefined) conditions.push(eq(fruitsTable.organic, p.organic));
      if (p.minPrice !== undefined) conditions.push(gte(fruitsTable.price, p.minPrice));
      if (p.maxPrice !== undefined) conditions.push(lte(fruitsTable.price, p.maxPrice));
      if (p.search) conditions.push(ilike(fruitsTable.name, `%${p.search}%`));
      if (p.onSale === true) conditions.push(isNotNull(fruitsTable.discountPrice));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const allFruits = await db.select().from(fruitsTable).where(whereClause);
    const total = allFruits.length;
    const fruits = allFruits.slice(offset, offset + limit).map(withInStock);

    res.json({
      fruits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Get fruits error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [fruit] = await db.select().from(fruitsTable).where(eq(fruitsTable.slug, slug)).limit(1);

    if (!fruit) {
      res.status(404).json({ message: "Продукт не найден" });
      return;
    }

    res.json(withInStock(fruit));
  } catch (err) {
    req.log.error({ err }, "Get fruit by slug error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.post("/", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateFruitBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации", errors: parsed.error.errors });
      return;
    }

    const [fruit] = await db.insert(fruitsTable).values(parsed.data as any).returning();
    res.status(201).json(withInStock(fruit));
  } catch (err) {
    req.log.error({ err }, "Create fruit error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.put("/:id", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = CreateFruitBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации" });
      return;
    }

    const [fruit] = await db.update(fruitsTable).set(parsed.data as any).where(eq(fruitsTable.id, id)).returning();
    if (!fruit) {
      res.status(404).json({ message: "Продукт не найден" });
      return;
    }
    res.json(withInStock(fruit));
  } catch (err) {
    req.log.error({ err }, "Update fruit error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.delete("/:id", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [fruit] = await db.delete(fruitsTable).where(eq(fruitsTable.id, id)).returning();
    if (!fruit) {
      res.status(404).json({ message: "Продукт не найден" });
      return;
    }
    res.json({ message: "Продукт удалён" });
  } catch (err) {
    req.log.error({ err }, "Delete fruit error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

export default router;
