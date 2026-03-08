exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error_code: "UNAUTHORIZED",
      message: "Missing or invalid token",
    });
  }
  const token = authHeader.split(" ")[1];
  // Simple static token check for the scope of the exercise
  if (token !== "secret-reseller-token") {
    return res
      .status(401)
      .json({ error_code: "UNAUTHORIZED", message: "Invalid token" });
  }
  next();
};
