// routes/pakaianRoutes.js
const express = require("express");
const router = express.Router();
const pakaianController = require("../controllers/pakaianController");

// Route untuk menampilkan daftar pakaian
router.get("/", pakaianController.getAllPakaian);
router.get("/create", pakaianController.showCreateForm);
router.post("/", pakaianController.createPakaian);
router.get("/:id", pakaianController.getPakaianById);
router.put("/:id", pakaianController.updatePakaian);
router.delete("/:id", pakaianController.deletePakaian);

module.exports = router;
