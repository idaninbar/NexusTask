const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve the minimal frontend

// Connect DB (Options removed for newer Mongoose versions)
// Update this line in server.js
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/digital_coupon")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
const resellerRoutes = require("./routes/resellerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");

app.use("/api/v1/products", resellerRoutes);
app.use("/api/v1/admin/products", adminRoutes);
app.use("/api/v1/customer/products", customerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
