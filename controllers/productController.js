// controllers/productController.js

const db = require("../utils/db"); // Menggunakan koneksi database dari db.js

// Controller untuk mengambil data produk
exports.getProductList = (req, res) => {
  const query = `
        SELECT p.product_name, pv.qty_in_stock, p.status 
        FROM product p
        JOIN product_variation pv ON p.product_id = pv.product_item_id
    `;

  db.execute(query)
    .then(([rows]) => {
      res.render("partials/layout", { products: rows });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving products");
    });
};
