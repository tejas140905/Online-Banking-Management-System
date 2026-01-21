const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", "..", "env.example") });

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorize = (roles = []) => (req, res, next) => {
  if (!roles.length || roles.includes(req.user?.role)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

module.exports = { authenticate, authorize };
