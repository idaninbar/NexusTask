const couponRepository = require("../repositories/couponRepository");

exports.createProduct = async (req, res) => {
  try {
    // Admin creates the product [cite: 145]
    const product = await couponRepository.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error_code: "BAD_REQUEST", message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    // Admin views all products [cite: 148]
    const products = await couponRepository.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error_code: "SERVER_ERROR", message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Admin updates the product [cite: 146]
    const product = await couponRepository.update(req.params.id, req.body);
    if (!product)
      return res.status(404).json({
        error_code: "PRODUCT_NOT_FOUND",
        message: "Product not found",
      });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error_code: "BAD_REQUEST", message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // Admin deletes the product [cite: 147]
    const product = await couponRepository.delete(req.params.id);
    if (!product)
      return res.status(404).json({
        error_code: "PRODUCT_NOT_FOUND",
        message: "Product not found",
      });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error_code: "SERVER_ERROR", message: err.message });
  }
};
