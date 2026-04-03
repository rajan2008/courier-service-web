const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authMiddleware } = require('../middleware/authMiddleware');

// Get Revenue Analytics
router.get('/analytics', authenticateToken, authMiddleware(['admin', 'courier_admin']), async (req, res) => {
    try {
        const { role, courier_owner } = req.user;
        let params = [];
        
        let statsQuery = `
            SELECT 
                COUNT(*) as total_shipments,
                SUM(price) as total_revenue,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_shipments,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_shipments
            FROM shipments
        `;
        
        let revenueByMonthQuery = `
            SELECT 
                to_char(created_at, 'Mon YYYY') as month,
                SUM(price) as revenue
            FROM shipments
        `;
        
        if (role === 'courier_admin') {
            statsQuery += ` WHERE courier_owner = $1`;
            revenueByMonthQuery += ` WHERE courier_owner = $1 GROUP BY to_char(created_at, 'Mon YYYY'), date_trunc('month', created_at) ORDER BY date_trunc('month', created_at) DESC LIMIT 6`;
            params = [courier_owner];
        } else {
            revenueByMonthQuery += ` GROUP BY to_char(created_at, 'Mon YYYY'), date_trunc('month', created_at) ORDER BY date_trunc('month', created_at) DESC LIMIT 6`;
        }

        const statsResult = await db.query(statsQuery, params);
        const revenueResult = await db.query(revenueByMonthQuery, params);

        res.json({
            stats: {
                total_shipments: parseInt(statsResult.rows[0].total_shipments) || 0,
                total_revenue: parseFloat(statsResult.rows[0].total_revenue) || 0,
                pending_shipments: parseInt(statsResult.rows[0].pending_shipments) || 0,
                delivered_shipments: parseInt(statsResult.rows[0].delivered_shipments) || 0,
            },
            revenueData: revenueResult.rows.reverse() // Chronological order
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
