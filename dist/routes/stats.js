import express from "express";
import { getDashboardStats } from "../controllers/stats.js";
const app = express.Router();
// route - /api/v1/dashboard/stats
app.get("/stats", getDashboardStats);
export default app;
