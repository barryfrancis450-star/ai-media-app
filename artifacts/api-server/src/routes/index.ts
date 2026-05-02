import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { imagesRouter } from "./openai/images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imagesRouter);

export default router;
