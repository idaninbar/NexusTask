const couponRepository = require("../repositories/couponRepository");
const couponService = require("../services/couponService");

exports.getAvailableProducts = async (req, res) => {
  try {
    // Customers view available coupons [cite: 161]
    const products = await couponRepository.findUnsold();
    // Uses the service to ensure private fields aren't leaked [cite: 97]
    res.json(products.map((p) => couponService.formatPublicProduct(p)));
  } catch (err) {
    res.status(500).json({ error_code: "SERVER_ERROR", message: err.message });
  }
};

exports.purchaseProduct = async (req, res) => {
  try {
    // Customers cannot override price [cite: 63]
    // We pass `undefined` for requested price and `false` for isReseller
    const result = await couponService.purchase(
      req.params.productId,
      undefined,
      false,
    );
    res.json(result);
  } catch (err) {
    // Proper error handling [cite: 169]
    if (err.status)
      res
        .status(err.status)
        .json({ error_code: err.code, message: err.message });
    else
      res
        .status(500)
        .json({ error_code: "SERVER_ERROR", message: err.message });
  }
};
