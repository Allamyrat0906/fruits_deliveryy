import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth, AuthRequest } from "../middlewares/auth.js";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const parsed = RegisterUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации", errors: parsed.error.errors });
      return;
    }

    const { name, email, password } = parsed.data;

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ message: "Пользователь с таким email уже существует" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      role: "CUSTOMER",
    }).returning();

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Ошибка валидации" });
      return;
    }

    const { email, password } = parsed.data;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user || !user.password) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.post("/google/verify", async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(501).json({ message: "Вход через Google не настроен на сервере" });
    return;
  }

  const { accessToken } = req.body as { accessToken?: unknown };
  if (typeof accessToken !== "string" || !accessToken) {
    res.status(400).json({ message: "Отсутствует Google access token" });
    return;
  }

  try {
    const infoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!infoRes.ok) {
      res.status(401).json({ message: "Недействительный Google токен" });
      return;
    }

    const info = await infoRes.json() as { email?: string; name?: string; picture?: string };
    if (!info.email) {
      res.status(401).json({ message: "Не удалось получить email от Google" });
      return;
    }

    const { email, name: googleName, picture } = info;
    const displayName = googleName || email.split("@")[0];

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    let user = existing[0];
    if (!user) {
      const [created] = await db.insert(usersTable).values({
        name: displayName,
        email,
        avatar: picture ?? null,
        role: "CUSTOMER",
      }).returning();
      user = created;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error({ err }, "Google verify error");
    res.status(401).json({ message: "Не удалось верифицировать Google токен" });
  }
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ message: "Выход выполнен успешно" });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (!user) {
      res.status(401).json({ message: "Пользователь не найден" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

export default router;
