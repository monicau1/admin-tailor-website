// controllers/kategoriController.js
const KategoriPakaian = require("../models/KategoriPakaian");
const KategoriPermak = require("../models/KategoriPermak");

// Get All Kategori
exports.getAllKategoriPakaian = async (req, res) => {
  try {
    const kategoriPakaian = await KategoriPakaian.findAll();

    res.status(200).json({
      status: "success",
      data: kategoriPakaian,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create Kategori
exports.createKategoriPakaian = async (req, res) => {
  try {
    const { nama_kategori_pakaian, deskripsi } = req.body;

    const newKategoriPakaian = await KategoriPakaian.create({
      nama_kategori_pakaian,
      deskripsi,
    });

    res.status(201).json({
      status: "success",
      data: newKategoriPakaian,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// // Get Kategori by ID
// exports.getKategoriPakaianById = async (req, res) => {
//   try {
//     const kategoriPakaian = await KategoriPakaian.findByPk(req.params.id);

//     if (!kategoriPakaian) {
//       return res.status(404).json({
//         status: "error",
//         message: "Kategori tidak ditemukan",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: kategoriPakaian,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// Get Pakaian by ID
exports.getPakaianById = async (req, res) => {
  try {
    const { id } = req.params;

    const pakaian = await Pakaian.findOne({
      where: { id_pakaian: id },
      include: [
        {
          model: VarianPakaian,
          as: "VarianPakaian",
          attributes: [
            "id_varian_pakaian",
            "ukuran",
            "warna",
            "stok",
            "kode_sku",
          ],
        },
        {
          model: Kategori,
          as: "Kategori", // Pastikan aliasnya sesuai dengan relasi di model
          attributes: ["id_kategori", "nama_kategori"],
        },
      ],
      order: [
        ["VarianPakaian", "ukuran", "ASC"],
        ["VarianPakaian", "warna", "ASC"],
      ],
    });

    if (!pakaian) {
      return res
        .status(404)
        .json({ status: "error", message: "Pakaian tidak ditemukan" });
    }

    const varian_pakaian = pakaian.VarianPakaian || [];
    const formattedResponse = {
      status: "success",
      data: {
        id_pakaian: pakaian.id_pakaian,
        nama_pakaian: pakaian.nama_pakaian,
        deskripsi_produk: pakaian.deskripsi_pakaian,
        harga: pakaian.harga,
        berat: pakaian.berat,
        id_kategori_pakaian: pakaian.id_kategori_pakaian,
        nama_kategori: pakaian.Kategori?.nama_kategori || "Unknown",
        status_produk: pakaian.status_produk,
        total_stok: varian_pakaian.reduce(
          (sum, varian) => sum + varian.stok,
          0
        ),
        varian_pakaian: varian_pakaian,
      },
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update Kategori
exports.updateKategoriPakaian = async (req, res) => {
  try {
    const { nama_kategori_pakaian, deskripsi } = req.body;
    const kategoriPakaian = await KategoriPakaian.findByPk(req.params.id);

    if (!kategoriPakaian) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    await kategoriPakaian.update({
      nama_kategori_pakaian,
      deskripsi,
    });

    res.status(200).json({
      status: "success",
      data: kategoriPakaian,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete Kategori
exports.deleteKategoriPakaian = async (req, res) => {
  try {
    const kategoriPakaian = await KategoriPakaian.findByPk(req.params.id);

    if (!kategoriPakaian) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    await kategoriPakaian.destroy();

    res.status(200).json({
      status: "success",
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get All Kategori Permak
exports.getAllKategoriPermak = async (req, res) => {
  try {
    const kategoriPermak = await KategoriPermak.findAll();

    res.status(200).json({
      status: "success",
      data: kategoriPermak,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create Kategori Permak
exports.createKategoriPermak = async (req, res) => {
  try {
    const { nama_kategori_permak, deskripsi } = req.body;

    const newKategoriPermak = await KategoriPermak.create({
      nama_kategori_permak,
      deskripsi,
    });

    res.status(201).json({
      status: "success",
      data: newKategoriPermak,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get Kategori Permak by ID
exports.getKategoriPermakById = async (req, res) => {
  try {
    const kategoriPermak = await KategoriPermak.findByPk(req.params.id);

    if (!kategoriPermak) {
      return res.status(404).json({
        status: "error",
        message: "Kategori permak tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      data: kategoriPermak,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update Kategori Permak
exports.updateKategoriPermak = async (req, res) => {
  try {
    const { nama_kategori_permak, deskripsi } = req.body;
    const kategoriPermak = await KategoriPermak.findByPk(req.params.id);

    if (!kategoriPermak) {
      return res.status(404).json({
        status: "error",
        message: "Kategori permak tidak ditemukan",
      });
    }

    await kategoriPermak.update({
      nama_kategori_permak,
      deskripsi,
    });

    res.status(200).json({
      status: "success",
      data: kategoriPermak,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete Kategori Permak
exports.deleteKategoriPermak = async (req, res) => {
  try {
    const kategoriPermak = await KategoriPermak.findByPk(req.params.id);

    if (!kategoriPermak) {
      return res.status(404).json({
        status: "error",
        message: "Kategori permak tidak ditemukan",
      });
    }

    await kategoriPermak.destroy();

    res.status(200).json({
      status: "success",
      message: "Kategori permak berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
