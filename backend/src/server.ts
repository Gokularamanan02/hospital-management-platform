import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { setMongoReady } from "./data/dbStore.js";
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

app.use(cors());
app.use(express.json());

// Resilient MongoDB connection with fast timeout fallback
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 4000 })
    .then(() => {
      console.log("✓ Connected to MongoDB Atlas successfully");
      setMongoReady(true);
    })
    .catch((error) => {
      console.warn("⚠ MongoDB connection notice: Could not reach Atlas cluster (IP whitelist required or network blocked).");
      console.warn("✓ Dual-Mode Repository activated: Serving seamless in-memory database with pre-seeded hospital data.");
      setMongoReady(false);
    });
} else {
  console.log("ℹ No MONGO_URI provided. Running in high-performance in-memory repository mode.");
  setMongoReady(false);
}

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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    appName: "Nalam - AI Hospital Intelligence Platform",
    mongoConnected: mongoose.connection.readyState === 1,
    storageMode: mongoose.connection.readyState === 1 ? "MongoDB Atlas" : "In-Memory Resilient Store",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (_req, res) => {
  res.send("AI Hospital Intelligence API is running with full dual-mode support.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
