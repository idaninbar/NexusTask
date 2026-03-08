const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, default: "COUPON", enum: ["COUPON"] },
    image_url: { type: String, required: true },
    cost_price: { type: Number, required: true, min: 0 },
    margin_percentage: { type: Number, required: true, min: 0 },
    minimum_sell_price: { type: Number },
    is_sold: { type: Boolean, default: false },
    value_type: { type: String, enum: ["STRING", "IMAGE"], required: true },
    value: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Server-side calculation of minimum_sell_price before saving
couponSchema.pre("save", function () {
  if (this.isModified("cost_price") || this.isModified("margin_percentage")) {
    this.minimum_sell_price =
      this.cost_price * (1 + this.margin_percentage / 100);
  }
});

module.exports = mongoose.model("Coupon", couponSchema);
