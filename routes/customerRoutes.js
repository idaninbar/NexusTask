const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/", customerController.getAvailableProducts);
router.post("/:productId/purchase", customerController.purchaseProduct);

module.exports = router;
