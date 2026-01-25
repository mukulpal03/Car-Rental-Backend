import express from "express";
import authRoutes from "./routes/auth";
import bookingRoutes from "./routes/booking";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);

export default app;
