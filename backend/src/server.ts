import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import collegeRoutes from "./routes/collegeRoutes";
import cityRoutes from "./routes/cityRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/cities", cityRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
