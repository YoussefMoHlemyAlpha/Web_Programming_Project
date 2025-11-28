import express from "express";
import { getDashboardStats } from "../controllers/report.controller.js";

const router = express.Router();

// GET /dashboard - admin sales report stats
router.get("/dashboard", getDashboardStats);

export default router;
