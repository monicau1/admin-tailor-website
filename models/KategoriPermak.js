const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js"); // sesuaikan dengan konfigurasi database Anda

const KategoriPermak = sequelize.define(
  "KategoriPermak",
  {
    id_kategori_permak: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_kategori_permak: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true, // deskripsi opsional, bisa diisi atau tidak
    },
  },
  {
    tableName: "kategori_permak",
    timestamps: false, // nonaktifkan jika Anda tidak menggunakan createdAt dan updatedAt
  }
);

module.exports = KategoriPermak;
