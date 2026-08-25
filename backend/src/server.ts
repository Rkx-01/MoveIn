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

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express.json());

// Strip /api/backend prefix if routed through Vercel Multi-Service
app.use((req, res, next) => {
    if (req.url.startsWith("/api/backend")) {
        req.url = req.url.replace("/api/backend", "");
    }
    next();
});

// Ensure database connection is initialized (crucial for serverless environments)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/cities", cityRoutes);

app.use(errorHandler);

if (process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
}

export default app;
