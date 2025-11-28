import express from "express";
import { getDashboardStats, exportDashboardStatsPDF } from "../controllers/report.controller.js";

const router = express.Router();

// GET /dashboard - admin sales report stats
router.get("/dashboard", getDashboardStats);

// GET /export-pdf - download pdf report
router.get("/export-pdf", exportDashboardStatsPDF);

export default router;
