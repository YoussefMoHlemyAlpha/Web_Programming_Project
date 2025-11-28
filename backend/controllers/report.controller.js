import { OrderModel } from "../models/order.model.js";
import PDFDocument from "pdfkit";

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue & Count
        const totalStats = await OrderModel.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
        ]);

        // 2. Revenue by Day (Last 7 days)
        const dailyStats = await OrderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 7 }
        ]);

        // 3. Pending Orders Count
        const pendingCount = await OrderModel.countDocuments({ status: "pending" });

        res.status(200).json({
            totalRevenue: totalStats[0]?.totalRevenue || 0,
            totalOrders: totalStats[0]?.totalOrders || 0,
            pendingOrders: pendingCount,
            dailyStats,
            topSellingItems: await OrderModel.aggregate([
                { $unwind: "$items" },
                { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ])
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const exportDashboardStatsPDF = async (req, res) => {
    try {
        // Fetch Stats
        const totalStats = await OrderModel.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
        ]);

        const pendingCount = await OrderModel.countDocuments({ status: "pending" });

        const topSellingItems = await OrderModel.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        const dailyStats = await OrderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 7 }
        ]);

        // Generate PDF
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=dashboard_report.pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('Admin Dashboard Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary Stats
        doc.fontSize(18).text('Summary Statistics', { underline: true });
        doc.moveDown();
        doc.fontSize(14).text(`Total Revenue: $${(totalStats[0]?.totalRevenue || 0).toFixed(2)}`);
        doc.text(`Total Orders: ${totalStats[0]?.totalOrders || 0}`);
        doc.text(`Pending Orders: ${pendingCount}`);
        doc.moveDown(2);

        // Top Selling Items
        doc.fontSize(18).text('Top Selling Items', { underline: true });
        doc.moveDown();
        topSellingItems.forEach((item, index) => {
            doc.fontSize(14).text(`${index + 1}. ${item._id} - ${item.totalSold} sold`);
        });
        doc.moveDown(2);

        // Daily Stats
        doc.fontSize(18).text('Last 7 Days Performance', { underline: true });
        doc.moveDown();

        // Simple Table Header
        const tableTop = doc.y;
        const dateX = 50;
        const revenueX = 200;
        const ordersX = 350;

        doc.fontSize(12).text('Date', dateX, tableTop, { bold: true });
        doc.text('Revenue', revenueX, tableTop, { bold: true });
        doc.text('Orders', ordersX, tableTop, { bold: true });

        doc.moveDown();
        let y = doc.y;

        dailyStats.forEach(stat => {
            doc.text(stat._id, dateX, y);
            doc.text(`$${stat.dailyRevenue.toFixed(2)}`, revenueX, y);
            doc.text(stat.orderCount.toString(), ordersX, y);
            y += 20;
        });

        doc.end();

    } catch (error) {
        console.error("PDF Export Error:", error);
        res.status(500).json({ message: "Failed to generate PDF report" });
    }
};