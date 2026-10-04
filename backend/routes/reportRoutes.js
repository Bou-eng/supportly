const express = require('express');
const router = express.Router();
const { getSummaryReport, getAgentPerformance, getTeamWorkload, getTicketVolume } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');

router.use(protect);
router.get('/summary', getSummaryReport);
router.use(authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN));
router.get('/agent-performance', getAgentPerformance);
router.get('/team-workload', getTeamWorkload);
router.get('/ticket-volume', getTicketVolume);

module.exports = router;