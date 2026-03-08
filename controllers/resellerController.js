const couponRepository = require("../repositories/couponRepository");
const couponService = require("../services/couponService");

exports.getAvailableProducts = async (req, res) => {
  try {
    const products = await couponRepository.findUnsold();
    res.json(products.map((p) => couponService.formatPublicProduct(p)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await couponRepository.findById(req.params.productId);
    if (!product || product.is_sold)
      return res
        .status(404)
        .json({ error_code: "PRODUCT_NOT_FOUND", message: "Not found" });
    res.json(couponService.formatPublicProduct(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.purchaseProduct = async (req, res) => {
  try {
    const { reseller_price } = req.body;
    const result = await couponService.purchase(
      req.params.productId,
      reseller_price,
      true,
    );
    res.json(result);
  } catch (err) {
    if (err.status)
      res
        .status(err.status)
        .json({ error_code: err.code, message: err.message });
    else res.status(500).json({ error: err.message });
  }
};
