const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getSettings).patch(updateSettings);

module.exports = router;