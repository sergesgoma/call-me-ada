const express = require("express");
const router = express.Router();

// import of controllers
const mainController = require("./controllers/mainController");

// HOMEPAGE
router.get("/", mainController.homePage);

// WEBHOOK
router.get("/webhook", mainController.getWebHook);
router.post("/webhook", mainController.postWebHook);


module.exports = router;