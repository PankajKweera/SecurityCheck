const express = require('express');
const { getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProfile);

module.exports = router;
