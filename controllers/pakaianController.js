// controllers/pakaianController.js
const { KategoriPakaian, Pakaian, VarianPakaian } = require("../models"); // Pastikan path ini sesuai
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");

exports.getAllPakaian = async (req, res) => {
  try {
    // Mengambil query parameters untuk pagination dan search
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const categoryFilter = req.query.category || "";

    // Menyiapkan where clause untuk pencarian
    let whereClause = {};
    if (search) {
      whereClause.nama_pakaian = {
        [Op.like]: `%${search}%`,
      };
    }
    if (categoryFilter) {
      whereClause.id_kategori_pakaian = categoryFilter;
    }

    // Query untuk mendapatkan total data berdasarkan filter
    const totalCount = await Pakaian.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Query untuk mendapatkan data pakaian
    const pakaian = await Pakaian.findAll({
      attributes: [
        "id_pakaian",
        "nama_pakaian",
        "id_kategori_pakaian",
        "harga",
        "status_produk",
        "deskripsi_pakaian",
        [
          sequelize.literal(`(
            SELECT SUM(vp.stok)
            FROM varian_pakaian vp
            WHERE vp.id_pakaian = Pakaian.id_pakaian
          )`),
          "total_stok",
        ],
        [
          sequelize.literal(`(
            SELECT vp.kode_sku
            FROM varian_pakaian vp
            WHERE vp.id_pakaian = Pakaian.id_pakaian
            LIMIT 1
          )`),
          "kode_sku",
        ],
      ],
      where: whereClause,
      include: [
        {
          model: KategoriPakaian,
          as: "KategoriPakaian",
          attributes: ["nama_kategori_pakaian"],
        },
      ],
      offset: offset,
      limit: limit,
      order: [["id_pakaian", "DESC"]],
      subQuery: false,
    });

    // Get kategori for filter dropdown
    const kategoriList = await KategoriPakaian.findAll({
      attributes: ["id_kategori_pakaian", "nama_kategori_pakaian"],
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    // Format response
    const formattedPakaian = pakaian.map((item) => ({
      id_pakaian: item.id_pakaian,
      nama_pakaian: item.nama_pakaian,
      id_kategori_pakaian: item.id_kategori_pakaian,
      kategori_nama:
        item.KategoriPakaian?.nama_kategori_pakaian || "Uncategorized",
      total_stok: parseInt(item.dataValues.total_stok) || 0,
      harga: item.harga,
      status_produk: item.status_produk,
      kode_sku: item.dataValues.kode_sku || "-",
      deskripsi_pakaian: item.deskripsi_pakaian,
    }));

    // Handle format response berdasarkan tipe request
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: formattedPakaian,
        pagination: {
          total_items: totalCount,
          total_pages: totalPages,
          current_page: page,
          items_per_page: limit,
        },
      });
    }

    // Render view dengan layout.ejs dan include data
    res.render("pakaian/pakaian", {
      layout: "partials/layout",
      pakaianList: formattedPakaian,
      kategoriList: kategoriList,
      title: "Daftar Pakaian",
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: page,
        items_per_page: limit,
      },
      query: {
        search: search,
        category: categoryFilter,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
    // Untuk request biasa, redirect dengan error message
    res.redirect("/api/pakaian?error=" + encodeURIComponent(error.message));
  }
};

// Controller untuk menampilkan form tambah pakaian (GET)
exports.showCreateForm = async (req, res) => {
  try {
    // Ambil data kategori untuk dropdown
    const kategoriList = await KategoriPakaian.findAll({
      attributes: ["id_kategori_pakaian", "nama_kategori_pakaian"],
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    // Render form dengan data awal
    res.render("pakaian/pakaian-tambah", {
      layout: "partials/layout",
      title: "Tambah Pakaian",
      isEdit: false,
      produk: null,
      kategoriList,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/api/pakaian?error=" +
        encodeURIComponent("Gagal memuat form tambah pakaian")
    );
  }
};

// Controller untuk memproses penambahan pakaian (POST)
exports.createPakaian = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      nama_pakaian,
      deskripsi_pakaian,
      harga,
      berat,
      id_kategori_pakaian,
      status_produk,
      varian_pakaian,
    } = req.body;

    // Validasi input
    if (!nama_pakaian || !harga || !id_kategori_pakaian) {
      return res.status(400).json({
        status: "error",
        message: "Nama pakaian, harga, dan kategori harus diisi",
      });
    }

    if (!Array.isArray(varian_pakaian) || varian_pakaian.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Minimal satu varian pakaian harus diisi",
      });
    }

    const pakaian = await Pakaian.create(
      {
        nama_pakaian,
        deskripsi_pakaian,
        harga,
        berat,
        id_kategori_pakaian,
        status_produk: status_produk || "active",
      },
      { transaction: t }
    );

    const varianPromises = varian_pakaian.map((varian) => {
      const sku = generateSKU(pakaian.id_pakaian, varian.ukuran, varian.warna);

      return VarianPakaian.create(
        {
          id_pakaian: pakaian.id_pakaian,
          ukuran: varian.ukuran,
          warna: varian.warna,
          stok: varian.stok,
          kode_sku: sku,
        },
        { transaction: t }
      );
    });

    await Promise.all(varianPromises);
    await t.commit();

    // Get full pakaian data with variants
    const fullPakaian = await Pakaian.findOne({
      where: { id_pakaian: pakaian.id_pakaian },
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
      ],
    });

    // Kirim response JSON untuk AJAX request
    res.status(201).json({
      status: "success",
      message: "Produk pakaian berhasil ditambahkan",
      data: fullPakaian,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Helper function untuk generate SKU
function generateSKU(id_pakaian, ukuran, warna) {
  const id = String(id_pakaian).padStart(5, "0");
  return `PRD-${id}-${ukuran}-${warna}`.toUpperCase();
}

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
          model: KategoriPakaian,
          as: "KategoriPakaian",
          attributes: ["id_kategori_pakaian", "nama_kategori_pakaian"],
        },
      ],
      order: [
        ["VarianPakaian", "ukuran", "ASC"],
        ["VarianPakaian", "warna", "ASC"],
      ],
    });

    if (!pakaian) {
      // Mengalihkan dengan query parameter untuk error
      return res.redirect("/pakaian?error=Pakaian%20tidak%20ditemukan");
    }

    // Ambil semua kategori untuk dropdown
    const kategoriList = await KategoriPakaian.findAll({
      attributes: ["id_kategori_pakaian", "nama_kategori_pakaian"],
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    const varian_pakaian = pakaian.VarianPakaian || [];
    const formattedData = {
      id_pakaian: pakaian.id_pakaian,
      nama_pakaian: pakaian.nama_pakaian,
      deskripsi_pakaian: pakaian.deskripsi_pakaian,
      harga: pakaian.harga,
      berat: pakaian.berat,
      kategori: pakaian.KategoriPakaian,
      status_produk: pakaian.status_produk,
      total_stok: varian_pakaian.reduce((sum, varian) => sum + varian.stok, 0),
      varian_pakaian: varian_pakaian, // Sesuaikan dengan nama yang digunakan di view
    };

    // Render view dengan layout.ejs dan include data
    res.render("pakaian/pakaian-detail", {
      layout: "partials/layout",
      title: "Detail Pakaian",
      produk: formattedData,
      kategoriList: kategoriList,
      error: req.query.error || null, // Menangkap pesan error dari query parameter
    });
  } catch (error) {
    console.error("Error:", error);
    // Mengalihkan dengan query parameter untuk error
    return res.redirect(
      "/pakaian?error=Terjadi%20kesalahan%20saat%20memuat%20detail%20pakaian"
    );
  }
};

exports.updatePakaian = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      nama_pakaian,
      deskripsi_pakaian,
      harga,
      berat,
      id_kategori_pakaian,
      status_produk,
      varian_pakaian,
    } = req.body;

    // Cek apakah pakaian ada
    const existingPakaian = await Pakaian.findByPk(id);
    if (!existingPakaian) {
      return res.status(404).json({
        status: "error",
        message: "Pakaian tidak ditemukan",
      });
    }

    // Validasi input
    if (!nama_pakaian || !harga || !id_kategori_pakaian) {
      return res.status(400).json({
        status: "error",
        message: "Nama pakaian, harga, dan kategori harus diisi",
      });
    }

    if (!Array.isArray(varian_pakaian) || varian_pakaian.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Minimal satu varian pakaian harus diisi",
      });
    }

    // Update data pakaian
    await existingPakaian.update(
      {
        nama_pakaian,
        deskripsi_pakaian,
        harga,
        berat,
        id_kategori_pakaian,
        status_produk: status_produk || existingPakaian.status_produk,
      },
      { transaction: t }
    );

    // Hapus varian lama
    await VarianPakaian.destroy({
      where: { id_pakaian: id },
      transaction: t,
    });

    // Buat varian baru
    const varianPromises = varian_pakaian.map((varian) => {
      const sku = generateSKU(id, varian.ukuran, varian.warna);

      return VarianPakaian.create(
        {
          id_pakaian: id,
          ukuran: varian.ukuran,
          warna: varian.warna,
          stok: varian.stok,
          kode_sku: sku,
        },
        { transaction: t }
      );
    });

    await Promise.all(varianPromises);
    await t.commit();

    // Ambil data pakaian yang sudah diupdate beserta variannya
    const updatedPakaian = await Pakaian.findOne({
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
      ],
    });

    const varian_pakaian_updated = updatedPakaian.VarianPakaian || [];

    const formattedResponse = {
      status: "success",
      message: "Produk pakaian berhasil diperbarui",
      data: {
        id_pakaian: updatedPakaian.id_pakaian,
        nama_pakaian: updatedPakaian.nama_pakaian,
        deskripsi_pakaian: updatedPakaian.deskripsi_pakaian,
        harga: updatedPakaian.harga,
        berat: updatedPakaian.berat,
        id_kategori_pakaian: updatedPakaian.id_kategori_pakaian,
        status_produk: updatedPakaian.status_produk,
        jumlah_varian: varian_pakaian_updated.length,
        total_stok: varian_pakaian_updated.reduce(
          (sum, varian) => sum + varian.stok,
          0
        ),
        varian_pakaian: varian_pakaian_updated,
      },
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deletePakaian = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Cek apakah pakaian ada
    const existingPakaian = await Pakaian.findOne({
      where: { id_pakaian: id },
      include: [
        {
          model: VarianPakaian,
          as: "VarianPakaian",
        },
      ],
    });

    if (!existingPakaian) {
      return res.status(404).json({
        status: "error",
        message: "Pakaian tidak ditemukan",
      });
    }

    // Hapus semua varian pakaian terlebih dahulu
    await VarianPakaian.destroy({
      where: { id_pakaian: id },
      transaction: t,
    });

    // Hapus pakaian
    await Pakaian.destroy({
      where: { id_pakaian: id },
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      status: "success",
      message: "Produk pakaian dan variannya berhasil dihapus",
      data: {
        id_pakaian: parseInt(id),
        jumlah_varian_terhapus: existingPakaian.VarianPakaian.length,
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
