const express = require("express");
const statsController = require("../controllers/statsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", statsController.getStats);

module.exports = router;