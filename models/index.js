// models/index.js
const KategoriPakaian = require("./KategoriPakaian");
const Pakaian = require("./Pakaian");
const VarianPakaian = require("./VarianPakaian");
const KategoriPermak = require("./KategoriPermak");
const JenisPermak = require("./JenisPermak");

// Relasi Pakaian dan VarianPakaian
Pakaian.hasMany(VarianPakaian, {
  foreignKey: "id_pakaian",
  as: "VarianPakaian",
});

VarianPakaian.belongsTo(Pakaian, {
  foreignKey: "id_pakaian",
  as: "Pakaian",
});

// Relasi KategoriPakaian dan Pakaian
KategoriPakaian.hasMany(Pakaian, {
  foreignKey: "id_kategori_pakaian",
});

Pakaian.belongsTo(KategoriPakaian, {
  foreignKey: "id_kategori_pakaian",
});

// Relasi KategoriPermak dan JenisPermak
KategoriPermak.hasMany(JenisPermak, {
  foreignKey: "id_kategori_permak",
  as: "jenis_permak",
});

JenisPermak.belongsTo(KategoriPermak, {
  foreignKey: "id_kategori_permak",
  as: "kategori_permak",
});

module.exports = {
  KategoriPakaian,
  Pakaian,
  VarianPakaian,
  KategoriPermak,
  JenisPermak,
};
