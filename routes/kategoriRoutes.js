// routes/kategoriRoutes.js
const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategoriController");

// Kategori Pakaian routes
router.get("/pakaian/", kategoriController.getAllKategoriPakaian);
router.post("/pakaian/", kategoriController.createKategoriPakaian);
//router.get("/pakaian/:id", kategoriController.getKategoriPakaianById);
router.put("/pakaian/:id", kategoriController.updateKategoriPakaian);
router.delete("/pakaian/:id", kategoriController.deleteKategoriPakaian);

// Kategori Permak routes
router.get("/permak", kategoriController.getAllKategoriPermak);
router.post("/permak", kategoriController.createKategoriPermak);
router.get("/permak/:id", kategoriController.getKategoriPermakById);
router.put("/permak/:id", kategoriController.updateKategoriPermak);
router.delete("/permak/:id", kategoriController.deleteKategoriPermak);

module.exports = router;
