const express = require('express');
const router = express.Router();
const { getTeams, createTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // Require authentication for all team routes

router.route('/')
  .get(getTeams)
  .post(authorize('admin', 'manager'), createTeam);

module.exports = router;