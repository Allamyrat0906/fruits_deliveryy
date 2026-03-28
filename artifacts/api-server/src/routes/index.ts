import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import fruitsRouter from "./fruits.js";
import ordersRouter from "./orders.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/fruits", fruitsRouter);
router.use("/orders", ordersRouter);

export default router;
