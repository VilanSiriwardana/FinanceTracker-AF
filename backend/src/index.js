const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const auth = require("./routes/authRoutes");
const transactions = require("./routes/transactionRoutes");
const categories = require("./routes/categoryRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", auth);
app.use("/api/transactions", transactions);
app.use("/api/categories", categories);
// app.use("/api/budgets", require("./routes/budgetRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
