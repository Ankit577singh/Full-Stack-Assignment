const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireManager } = require('../middleware/auth');

const router = express.Router();

router.get('/daily-summary', authenticateToken, requireManager, async (req, res) => {
    try {
        const { date, employee_id } = req.query;

        // Validation
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
        }

        

        let query = `
            SELECT 
                u.id as employee_id,
                u.name as employee_name,
                COUNT(ch.id) as total_checkins,
                COUNT(DISTINCT ch.client_id) as unique_clients_visited,
                SUM(
                    CASE 
                        WHEN ch.checkout_time IS NOT NULL 
                        THEN (strftime('%s', ch.checkout_time) - strftime('%s', ch.checkin_time)) / 3600.0 
                        ELSE 0 
                    END
                ) as total_hours
            FROM users u
            LEFT JOIN checkins ch ON u.id = ch.employee_id AND DATE(ch.checkin_time) = ?
            WHERE u.manager_id = ?
        `;

        const params = [date, req.user.id];

        // Optional filter for specific employee
        if (employee_id) {
            query += ` AND u.id = ?`;
            params.push(employee_id);
        }

        query += ` GROUP BY u.id`;

        const [rows] = await pool.execute(query, params);

      // Team Level Aggregates 
        const teamStats = rows.reduce((acc, curr) => {
            acc.total_checkins += curr.total_checkins;
            acc.total_hours += curr.total_hours;
            acc.active_members += curr.total_checkins > 0 ? 1 : 0;
            return acc;
        }, { total_checkins: 0, total_hours: 0, active_members: 0 });

        // Response Format
        res.json({
            success: true,
            date: date,
            data: {
                team_summary: teamStats,
                employee_breakdown: rows
            }
        });

    } catch (error) {
        console.error('Report Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
});

module.exports = router;