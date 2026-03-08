const express = require("express");
const router = express.Router();
const resellerController = require("../controllers/resellerController");
const authParams = require("../middleware/auth");

router.use(authParams.verifyToken); // Apply to all reseller routes
router.get("/", resellerController.getAvailableProducts);
router.get("/:productId", resellerController.getProductById);
router.post("/:productId/purchase", resellerController.purchaseProduct);

module.exports = router;
