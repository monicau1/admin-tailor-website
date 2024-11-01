// controllers/jenisPermakController.js
const JenisPermak = require("../models/JenisPermak.js");
const KategoriPermak = require("../models/KategoriPermak.js");
const sequelize = require("../utils/db.js");

// Create Jenis Permak
exports.createJenisPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      id_kategori_permak,
      nama_permak,
      deskripsi_jenis_permak,
      status,
      harga,
    } = req.body;

    // Validasi input
    if (!id_kategori_permak || !nama_permak || !harga) {
      return res.status(400).json({
        status: "error",
        message: "Kategori permak, nama permak, dan harga harus diisi",
      });
    }

    // Cek apakah kategori permak ada
    const kategoriPermak = await KategoriPermak.findByPk(id_kategori_permak);
    if (!kategoriPermak) {
      return res.status(404).json({
        status: "error",
        message: "Kategori permak tidak ditemukan",
      });
    }

    // Buat jenis permak baru
    const jenisPermak = await JenisPermak.create(
      {
        id_kategori_permak,
        nama_permak,
        deskripsi_jenis_permak,
        status: status || "active",
        harga,
      },
      { transaction: t }
    );

    await t.commit();

    // Ambil data lengkap dengan relasi kategori
    const createdJenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak: jenisPermak.id_jenis_permak },
      include: [
        {
          model: KategoriPermak,
          as: "kategori_permak",
          attributes: ["nama_kategori_permak"],
        },
      ],
    });

    res.status(201).json({
      status: "success",
      message: "Jenis permak berhasil ditambahkan",
      data: createdJenisPermak,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get All Jenis Permak
exports.getAllJenisPermak = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const kategori = req.query.kategori;

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (kategori) {
      whereClause.id_kategori_permak = kategori;
    }

    const { count, rows } = await JenisPermak.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: KategoriPermak,
          as: "kategori_permak",
          attributes: ["nama_kategori_permak"],
        },
      ],
      offset: offset,
      limit: limit,
      order: [["id_jenis_permak", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      status: "success",
      message: "Data jenis permak berhasil diambil",
      data: {
        jenis_permak: rows,
        pagination: {
          total_items: count,
          total_pages: totalPages,
          current_page: page,
          items_per_page: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get Jenis Permak by ID
exports.getJenisPermakById = async (req, res) => {
  try {
    const { id } = req.params;

    const jenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak: id },
      include: [
        {
          model: KategoriPermak,
          as: "kategori_permak",
          attributes: ["nama_kategori_permak"],
        },
      ],
    });

    if (!jenisPermak) {
      return res.status(404).json({
        status: "error",
        message: "Jenis permak tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      data: jenisPermak,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update Jenis Permak
exports.updateJenisPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      id_kategori_permak,
      nama_permak,
      deskripsi_jenis_permak,
      status,
      harga,
    } = req.body;

    const jenisPermak = await JenisPermak.findByPk(id);

    if (!jenisPermak) {
      return res.status(404).json({
        status: "error",
        message: "Jenis permak tidak ditemukan",
      });
    }

    if (id_kategori_permak) {
      const kategoriPermak = await KategoriPermak.findByPk(id_kategori_permak);
      if (!kategoriPermak) {
        return res.status(404).json({
          status: "error",
          message: "Kategori permak tidak ditemukan",
        });
      }
    }

    await jenisPermak.update(
      {
        id_kategori_permak:
          id_kategori_permak || jenisPermak.id_kategori_permak,
        nama_permak: nama_permak || jenisPermak.nama_permak,
        deskripsi_jenis_permak:
          deskripsi_jenis_permak || jenisPermak.deskripsi_jenis_permak,
        status: status || jenisPermak.status,
        harga: harga || jenisPermak.harga,
      },
      { transaction: t }
    );

    await t.commit();

    const updatedJenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak: id },
      include: [
        {
          model: KategoriPermak,
          as: "kategori_permak",
          attributes: ["nama_kategori_permak"],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Jenis permak berhasil diperbarui",
      data: updatedJenisPermak,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete Jenis Permak
exports.deleteJenisPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const jenisPermak = await JenisPermak.findByPk(id);

    if (!jenisPermak) {
      return res.status(404).json({
        status: "error",
        message: "Jenis permak tidak ditemukan",
      });
    }

    await jenisPermak.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({
      status: "success",
      message: "Jenis permak berhasil dihapus",
      data: {
        id_jenis_permak: parseInt(id),
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
