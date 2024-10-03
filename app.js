const express = require("express");
const app = express();
const path = require("path");

// Set view engine to EJS
app.set("view engine", "ejs");

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
