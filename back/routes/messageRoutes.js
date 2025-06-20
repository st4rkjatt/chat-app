const { sendMessage, getMessage } = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

const router = require('express').Router()

router.get("/:id",auth, getMessage);
router.post("/send/:id",auth, sendMessage);

module.exports = router;
