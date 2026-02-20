import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: (process.env.DB_TYPE as any) || "postgres",
    url: process.env.DATABASE_URL, // Use URL for production (Render/Railway)
    database: !process.env.DATABASE_URL && process.env.DB_TYPE === "sqlite" 
        ? path.join(__dirname, "../../database.sqlite")
        : process.env.DB_NAME || "movein_db",
    host: !process.env.DATABASE_URL ? (process.env.DB_HOST || "localhost") : undefined,
    port: !process.env.DATABASE_URL ? parseInt(process.env.DB_PORT || "5432") : undefined,
    username: !process.env.DATABASE_URL ? (process.env.DB_USER || "postgres") : undefined,
    password: !process.env.DATABASE_URL ? (process.env.DB_PASSWORD || "postgres") : undefined,
    synchronize: true, // DEV ONLY - should be migrations in production
    logging: false,
    entities: [path.join(__dirname, "../models/**/*.{ts,js}")],
    migrations: [],
    subscribers: [],
});

export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connection established.");
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    }
};
