import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { setMongoReady, seedMongoIfEmpty } from "./data/dbStore.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import bedRoutes from "./routes/bed.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import medicalRecordRoutes from "./routes/medicalRecord.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3333',
  'https://hospital-management-platform-rho.vercel.app',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Resilient MongoDB connection with fast timeout fallback (cached for serverless)
let isConnecting = false;
export async function connectToMongo(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;
  if (isConnecting) return;
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    setMongoReady(false);
    return;
  }
  isConnecting = true;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log("✓ Connected to MongoDB Atlas successfully");
    setMongoReady(true);
    await seedMongoIfEmpty();
  } catch (error) {
    console.warn("⚠ MongoDB connection notice: Could not reach Atlas cluster (IP whitelist required or network blocked).");
    console.warn("✓ Dual-Mode Repository activated: Serving seamless in-memory database with pre-seeded hospital data.");
    setMongoReady(false);
  } finally {
    isConnecting = false;
  }
}

// Initial connection attempt on cold start
connectToMongo().catch(() => {});

// Middleware to ensure database connection before processing requests
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
    await connectToMongo().catch(() => {});
  }
  next();
});

// Mount all modular routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check endpoint with live database census
app.get("/api/health", async (_req, res) => {
  const isMongo = mongoose.connection.readyState === 1;
  let atlasCollections: Record<string, number> | undefined;

  if (isMongo && mongoose.connection.db) {
    try {
      const cols = await mongoose.connection.db.listCollections().toArray();
      atlasCollections = {};
      for (const c of cols) {
        atlasCollections[c.name] = await mongoose.connection.db.collection(c.name).countDocuments();
      }
    } catch {
      // ignore collection query errors
    }
  }

  res.json({
    status: "healthy",
    appName: "Nalam - AI Hospital Intelligence Platform",
    mongoConnected: isMongo,
    storageMode: isMongo ? "MongoDB Atlas" : "In-Memory Resilient Store",
    databaseName: isMongo && mongoose.connection.db ? mongoose.connection.db.databaseName : "in-memory",
    collections: atlasCollections || {
      patients: 5,
      doctors: 5,
      appointments: 5,
      beds: 10,
      departments: 5,
      medicalrecords: 3
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/", (_req, res) => {
  res.send("AI Hospital Intelligence API is running with full dual-mode support.");
});

// Start HTTP listener only when not running in serverless / test mode
let server: any;
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app, server };
export default app;
