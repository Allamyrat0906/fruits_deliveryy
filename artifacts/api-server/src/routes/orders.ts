import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, fruitsTable, usersTable } from "@workspace/db/schema";
import { eq, ilike, or, desc, count } from "drizzle-orm";
import { requireAuth, requireAdmin, AuthRequest } from "../middlewares/auth.js";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";

const router = Router();

async function buildOrderResponse(order: typeof ordersTable.$inferSelect) {
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

router.get("/", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = parseInt(String(req.query.limit ?? "20"), 10);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        status: ordersTable.status,
        totalPrice: ordersTable.totalPrice,
        address: ordersTable.address,
        phone: ordersTable.phone,
        paidAmount: ordersTable.paidAmount,
        createdAt: ordersTable.createdAt,
        customerName: usersTable.name,
        customerEmail: usersTable.email,
      })
      .from(ordersTable)
      .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id));

    const whereCondition = search
      ? or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.email, `%${search}%`),
          ilike(ordersTable.phone, `%${search}%`),
        )
      : undefined;

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(ordersTable)
      .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .where(whereCondition);

    const pageOrders = await baseQuery
      .where(whereCondition)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const fullOrders = await Promise.all(
      pageOrders.map(async (order) => {
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

        const changeDue =
          order.paidAmount != null ? order.paidAmount - order.totalPrice : null;

        return { ...order, items, changeDue };
      })
    );

    res.json({ orders: fullOrders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "Get all orders error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации", errors: parsed.error.errors });
      return;
    }

    const { address, phone, paidAmount, items } = parsed.data;

    const normalizedPhone = (phone ?? "").replace(/\s/g, "");
    if (normalizedPhone.length < 9) {
      res.status(400).json({ message: "Введите корректный номер телефона" });
      return;
    }
    if (paidAmount !== undefined && paidAmount < 0) {
      res.status(400).json({ message: "Сумма оплаты не может быть отрицательной" });
      return;
    }

    let totalPrice = 0;
    const enrichedItems: { fruitId: number; quantity: number; weight: string; unitPrice: number }[] = [];

    for (const item of items) {
      const [fruit] = await db.select().from(fruitsTable).where(eq(fruitsTable.id, item.fruitId)).limit(1);
      if (!fruit) {
        res.status(400).json({ message: `Продукт с id ${item.fruitId} не найден` });
        return;
      }
      const effectivePrice = fruit.discountPrice ?? fruit.price;
      const weightMultiplier = item.weight === "2кг" ? 2 : item.weight === "1кг" ? 1 : 0.5;
      const unitPrice = effectivePrice * weightMultiplier;
      const lineTotal = unitPrice * item.quantity;
      totalPrice += lineTotal;
      enrichedItems.push({ fruitId: item.fruitId, quantity: item.quantity, weight: item.weight, unitPrice });
    }

    const [order] = await db.insert(ordersTable).values({
      userId: req.user!.id,
      address,
      phone: normalizedPhone,
      paidAmount: paidAmount ?? null,
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
    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, req.user!.id))
      .orderBy(desc(ordersTable.createdAt));
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

    const statusValue: "ОЖИДАНИЕ" | "ПОДТВЕРЖДЁН" | "ОТПРАВЛЕН" | "ДОСТАВЛЕН" | "ОТМЕНЁН" = parsed.data.status;
    const [order] = await db.update(ordersTable)
      .set({ status: statusValue })
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
