const express = require("express");
const router = express.Router();
const { synthesizeTts } = require("../controllers/ttsController");

router.post("/", synthesizeTts);

module.exports = router;
