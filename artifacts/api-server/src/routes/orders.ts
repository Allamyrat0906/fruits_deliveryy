import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, fruitsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin, AuthRequest } from "../middlewares/auth.js";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";

const router = Router();

async function buildOrderResponse(order: any) {
  const items = await db.select({
    id: orderItemsTable.id,
    fruitId: orderItemsTable.fruitId,
    fruitName: fruitsTable.name,
    quantity: orderItemsTable.quantity,
    weight: orderItemsTable.weight,
    unitPrice: orderItemsTable.unitPrice,
  })
    .from(orderItemsTable)
    .innerJoin(fruitsTable, eq(orderItemsTable.fruitId, fruitsTable.id))
    .where(eq(orderItemsTable.orderId, order.id));

  return { ...order, items };
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации", errors: parsed.error.errors });
      return;
    }

    const { address, items } = parsed.data;

    let totalPrice = 0;
    const enrichedItems: { fruitId: number; quantity: number; weight: string; unitPrice: number }[] = [];

    for (const item of items) {
      const [fruit] = await db.select().from(fruitsTable).where(eq(fruitsTable.id, item.fruitId)).limit(1);
      if (!fruit) {
        res.status(400).json({ message: `Продукт с id ${item.fruitId} не найден` });
        return;
      }
      const weightMultiplier = item.weight === "2кг" ? 2 : item.weight === "1кг" ? 1 : 0.5;
      const unitPrice = fruit.price * weightMultiplier;
      const lineTotal = unitPrice * item.quantity;
      totalPrice += lineTotal;
      enrichedItems.push({ fruitId: item.fruitId, quantity: item.quantity, weight: item.weight, unitPrice });
    }

    const [order] = await db.insert(ordersTable).values({
      userId: req.user!.id,
      address,
      totalPrice,
      status: "ОЖИДАНИЕ",
    }).returning();

    for (const item of enrichedItems) {
      await db.insert(orderItemsTable).values({
        orderId: order.id,
        ...item,
      });
    }

    const fullOrder = await buildOrderResponse(order);
    res.status(201).json(fullOrder);
  } catch (err) {
    req.log.error({ err }, "Create order error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.get("/my", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.user!.id));
    const fullOrders = await Promise.all(orders.map(buildOrderResponse));
    res.json(fullOrders);
  } catch (err) {
    req.log.error({ err }, "Get my orders error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);

    if (!order) {
      res.status(404).json({ message: "Заказ не найден" });
      return;
    }

    if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Доступ запрещён" });
      return;
    }

    const fullOrder = await buildOrderResponse(order);
    res.json(fullOrder);
  } catch (err) {
    req.log.error({ err }, "Get order by id error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.patch("/:id/status", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateOrderStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации" });
      return;
    }

    const [order] = await db.update(ordersTable)
      .set({ status: parsed.data.status as any })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      res.status(404).json({ message: "Заказ не найден" });
      return;
    }

    const fullOrder = await buildOrderResponse(order);
    res.json(fullOrder);
  } catch (err) {
    req.log.error({ err }, "Update order status error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

export default router;
