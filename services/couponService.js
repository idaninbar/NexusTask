const couponRepository = require("../repositories/couponRepository");

class CouponService {
  formatPublicProduct(product) {
    return {
      id: product._id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      price: product.minimum_sell_price, // Excludes cost_price and margin
    };
  }

  async purchase(productId, requestedPrice, isReseller = false) {
    const product = await couponRepository.findById(productId);

    if (!product)
      throw {
        status: 404,
        code: "PRODUCT_NOT_FOUND",
        message: "Product does not exist",
      };
    if (product.is_sold)
      throw {
        status: 409,
        code: "PRODUCT_ALREADY_SOLD",
        message: "Product is already sold",
      };

    if (isReseller && requestedPrice < product.minimum_sell_price) {
      throw {
        status: 400,
        code: "RESELLER_PRICE_TOO_LOW",
        message: "Reseller price is below minimum sell price",
      };
    }

    const finalPrice = isReseller ? requestedPrice : product.minimum_sell_price;
    const soldProduct = await couponRepository.markAsSoldAtomically(productId);

    if (!soldProduct) {
      throw {
        status: 409,
        code: "PRODUCT_ALREADY_SOLD",
        message: "Product was sold during transaction",
      };
    }

    return {
      product_id: soldProduct._id,
      final_price: finalPrice,
      value_type: soldProduct.value_type,
      value: soldProduct.value,
    };
  }
}
module.exports = new CouponService();
