const express = require('express');
const router = express.Router();
const { getTeams, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');

router.use(protect); // Require authentication for all team routes

router.route('/')
  .get(getTeams)
  .post(authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), createTeam);
router.route('/:id')
  .patch(authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), updateTeam)
  .delete(authorize(USER_ROLES.ADMIN), deleteTeam);

module.exports = router;