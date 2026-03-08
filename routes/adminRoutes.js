const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/", adminController.createProduct);
router.get("/", adminController.getProducts);
router.put("/:id", adminController.updateProduct);
router.delete("/:id", adminController.deleteProduct);

module.exports = router;
