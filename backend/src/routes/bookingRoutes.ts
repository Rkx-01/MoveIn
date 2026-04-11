import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../models/User";

const router = Router();

router.post("/", protect, authorize(UserRole.TENANT), BookingController.create);
router.get("/my-bookings", protect, authorize(UserRole.TENANT), BookingController.getTenantBookings);

export default router;
