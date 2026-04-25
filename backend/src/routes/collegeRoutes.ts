import { Router } from "express";
import { CollegeController } from "../controllers/CollegeController";

const router = Router();

router.get("/", CollegeController.getAll);
router.get("/:id", CollegeController.getById);

export default router;
