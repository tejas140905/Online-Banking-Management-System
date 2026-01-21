const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: require("path").join(__dirname, "..", "..", "env.example") });

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
