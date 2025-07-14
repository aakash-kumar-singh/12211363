const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const linkRoutes = require("./routes/linkRoutes");
const logRequest = require("./middleware/logRequest");
dotenv.config();
const app = express();
app.use(express.json());
app.use(logRequest);
app.use("/", linkRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connection established.");
    app.listen(process.env.PORT, () => {
      console.log(`App is live at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
  });
