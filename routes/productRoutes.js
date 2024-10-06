// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Route to get the product list for admin
router.get("/admin/products", productController.getProductList);

module.exports = router;
