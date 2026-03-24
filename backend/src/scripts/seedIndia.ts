import { AppDataSource } from "../config/database";
import { City } from "../models/City";
import { College, CollegeType } from "../models/College";
import { Property, PropertyStatus, GenderPreference } from "../models/Property";
import { Host } from "../models/Host";
import { UserRole } from "../models/User";
import { MASTER_CITIES, MASTER_COLLEGES, MASTER_LOCALITIES } from "../data/masterData";
import bcrypt from "bcryptjs";

const getRandomOffset = () => (Math.random() - 0.5) * 0.01; // Roughly 1km range

const seed = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected for Pune MVP seeding...");

        const cityRepo = AppDataSource.getRepository(City);
        const collegeRepo = AppDataSource.getRepository(College);
        const propertyRepo = AppDataSource.getRepository(Property);
        const hostRepo = AppDataSource.getRepository(Host);

        // Clear existing data for fresh startup launch
        console.log("Cleaning existing data...");
        await AppDataSource.query('DELETE FROM "properties"');
        await AppDataSource.query('DELETE FROM "colleges"');
        await AppDataSource.query('DELETE FROM "cities"');
        await AppDataSource.query('DELETE FROM "users"');

        // 1. Seed Cities (Pune Only)
        const cityMap = new Map();
        for (const c of MASTER_CITIES) {
            const city = await cityRepo.save(cityRepo.create({
                name: c.name,
                state: c.state,
                latitude: c.lat,
                longitude: c.lon,
                tier: c.tier
            }));
            cityMap.set(c.name, city);
        }
        console.log(`Seeded City: Pune.`);

        // 2. Seed Pune Colleges
        const collegeList = [];
        for (const c of MASTER_COLLEGES) {
            const college = await collegeRepo.save(collegeRepo.create({
                name: c.name,
                type: c.type as CollegeType,
                area: c.area,
                latitude: c.lat,
                longitude: c.lon,
                city: cityMap.get(c.city)
            }));
            collegeList.push(college);
        }
        console.log(`Seeded ${MASTER_COLLEGES.length} Pune Colleges.`);

        // 3. Seed Production Host
        const hashedPassword = await bcrypt.hash("password123", 10);
        const adminHost = (await hostRepo.save(hostRepo.create({
            name: "MoveIn Pune Host",
            email: "host@movein.pune",
            password: hashedPassword,
            role: UserRole.HOST,
            phone_number: "+91 20 2567 1234",
            verified_host: true
        } as any))) as unknown as Host;

        // Seed Test Tenant
        const tenantRepo = AppDataSource.getRepository(require("../models/Tenant").Tenant);
        await tenantRepo.save(tenantRepo.create({
            name: "John Doe",
            email: "john@gmail.com",
            password: hashedPassword,
            role: UserRole.TENANT
        } as any));

        // 4. Seed Realistic Pune Properties (5 per college)
        const propertyTitles = [
            "Premium Student PG", "Safe Home Stay", "Modern Hostel Pod", 
            "Sharing Apartment for Students", "Co-Living Space", "Budget Study Loft"
        ];

        const amenitiesPool = ["wifi", "food", "security", "laundry", "ro_water", "ac", "power_backup"];

        const photoPool = [
            "/properties/room1.jpg",
            "/properties/room2.jpg",
            "/properties/room3.jpg",
            "/properties/room4.jpg",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
            "https://images.unsplash.com/photo-1554995207-c18c20360a59?w=800",
            "https://images.unsplash.com/photo-1536376074432-8d2a3ea56f4d?w=800",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
        ];

        for (const college of collegeList) {
            for (let i = 0; i < 5; i++) {
                const title = propertyTitles[Math.floor(Math.random() * propertyTitles.length)];
                // Pricing: ₹6,000 – ₹20,000
                const price = Math.floor(Math.random() * (20000 - 6000) + 6000);
                const gender = [GenderPreference.BOYS, GenderPreference.GIRLS, GenderPreference.CO_LIVING][Math.floor(Math.random() * 3)];
                
                const amenities = amenitiesPool.sort(() => 0.5 - Math.random()).slice(0, 5);
                const photo = photoPool[Math.floor(Math.random() * photoPool.length)];

                await propertyRepo.save(propertyRepo.create({
                    title: `${title} near ${college.name}`,
                    description: `Verified student housing located in the heart of ${college.area}, Pune. Designed for students of ${college.name}. Safe, clean, and study-friendly environment.`,
                    address: `Building ${10 + i}, Lane ${i + 1}, ${college.area}, Pune`,
                    locality: college.area,
                    price: price,
                    status: PropertyStatus.AVAILABLE,
                    latitude: college.latitude + getRandomOffset(),
                    longitude: college.longitude + getRandomOffset(),
                    city: college.city,
                    linked_college: college,
                    amenities: JSON.stringify(amenities),
                    photo_urls: JSON.stringify([photo]),
                    is_verified: true,
                    safety_score: parseFloat((Math.random() * (9.9 - 8.8) + 8.8).toFixed(1)), // Higher safety for MVP
                    student_friendly: true,
                    gender_preference: gender,
                    roommate_option: Math.random() > 0.3,
                    host: adminHost
                } as any));
            }
        }

        console.log(`Seeded ${collegeList.length * 5} realistic Pune Properties.`);
        console.log("Pune Startup Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Pune Seeding failed:", error);
        process.exit(1);
    }
};

seed();
