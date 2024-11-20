const schedule = require('node-schedule');
const db = require('../config/Database'); // Adjust path to your database connection

// Cleanup job to permanently delete soft-deleted products older than 30 days
function runCleanupJob() {
    // This job will run daily at midnight
    schedule.scheduleJob('0 0 1 * *', async () => {
        console.log('Running cleanup job for soft-deleted products...');

        // Query to permanently delete products soft-deleted for over 30 days
        const query = `DELETE FROM product_table WHERE is_deleted = 1 AND deleted_at < NOW() - INTERVAL 30 DAY`;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error running cleanup job:', err.message);
            } else {
                console.log('Cleanup job completed:', results.affectedRows, 'products permanently deleted');
            }
        });
    });
}

module.exports = { runCleanupJob };

// 0 0 1 * * - 1 month -  INTERVAL 30 DAY

//*/10 * * * * - 10 min -  INTERVAL 10 DAY