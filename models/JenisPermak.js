// models/JenisPermak.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");
const KategoriPermak = require("./KategoriPermak");

const JenisPermak = sequelize.define(
  "JenisPermak",
  {
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_kategori_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KategoriPermak,
        key: "id_kategori_permak",
      },
      onDelete: "CASCADE", // Menambahkan opsi untuk menjaga referensial integrity
    },
    nama_permak: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    deskripsi_jenis_permak: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    harga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "jenis_permak",
    timestamps: false, // Menghilangkan kolom createdAt dan updatedAt
  }
);

// // Menetapkan relasi dengan KategoriPermak
// KategoriPermak.hasMany(JenisPermak, {
//   foreignKey: "id_kategori_permak",
//   as: "jenis_permak",
// });
// JenisPermak.belongsTo(KategoriPermak, {
//   foreignKey: "id_kategori_permak",
//   as: "kategori_permak",
// });

module.exports = JenisPermak;
