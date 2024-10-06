// app.js

const express = require("express");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set up public folder for static assets (CSS, images)
app.use(express.static(path.join(__dirname, "public")));

// Use product routes
app.use(productRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
