const Coupon = require("../models/Coupon");

class CouponRepository {
  async create(data) {
    return await Coupon.create(data);
  }
  async findAll() {
    return await Coupon.find();
  }
  async findUnsold() {
    return await Coupon.find({ is_sold: false });
  }
  async findById(id) {
    return await Coupon.findById(id);
  }
  async update(id, data) {
    // Find the document first
    const coupon = await Coupon.findById(id);
    if (!coupon) return null;

    // Apply the new data to the document
    Object.assign(coupon, data);

    // Call save() to trigger the pre('save') hook for the pricing math
    return await coupon.save();
  }
  async delete(id) {
    return await Coupon.findByIdAndDelete(id);
  }
  // Atomic update to ensure it isn't double-sold
  async markAsSoldAtomically(id) {
    return await Coupon.findOneAndUpdate(
      { _id: id, is_sold: false },
      { $set: { is_sold: true } },
      { new: true },
    );
  }
}
module.exports = new CouponRepository();
