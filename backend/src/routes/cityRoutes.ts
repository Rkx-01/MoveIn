import { Router } from "express";
import { CityController } from "../controllers/CityController";

const router = Router();

router.get("/", CityController.getAll);
router.get("/:id", CityController.getById);

export default router;
