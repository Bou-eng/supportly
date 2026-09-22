const express = require('express');
const router = express.Router();
const { getSummaryReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('manager', 'admin')); // Only Managers & Admins can access reports

router.get('/summary', getSummaryReport);

module.exports = router;