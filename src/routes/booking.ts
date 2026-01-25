import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
} from "../controllers/booking";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.route("/").post(createBooking).get(getBookings);
router.route("/:bookingId").put(updateBooking).delete(deleteBooking);

export default router;
