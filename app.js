// app.js

const express = require("express");
const path = require("path");
const sequelize = require("./utils/db.js");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

require("dotenv").config();

const pakaianRoutes = require("./routes/pakaianRoutes");
const permakRoutes = require("./routes/permakRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");
const app = express();

// Middleware untuk parsing JSON dan form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method")); // Untuk mendukung PUT/DELETE di form

// Set the view engine to EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "partials/layout");

// Konfigurasi express-ejs-layouts
app.locals.extractScripts = true;
app.locals.extractStyles = true;

// Set up public folder for static assets (CSS, images)
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/api/pakaian", pakaianRoutes);
app.use("/api/permak", permakRoutes);
app.use("/api/kategori", kategoriRoutes);

// Sync database (dalam development)
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });

// // Rute default untuk homepage
// app.get("/", (req, res) => {
//   res.redirect("/pakaian");
// });

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
