import { Router } from "express";
import { PropertyController } from "../controllers/PropertyController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../models/User";

const router = Router();

router.get("/", PropertyController.getAvailable);
router.get("/available", PropertyController.getAvailable);
router.get("/:id", PropertyController.getDetails);

router.post("/", protect, authorize(UserRole.HOST), PropertyController.create);

export default router;
