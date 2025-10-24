import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Memuat konfigurasi dari file .env
dotenv.config();

// Buat pool connection menggunakan DATABASE_PORT dari .env
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST, // Host database
  user: process.env.DATABASE_USER, // Username database
  password: process.env.DATABASE_PASSWORD, // Password database
  database: process.env.DATABASE_NAME, // Nama database
  port: process.env.DATABASE_PORT, // Port yang digunakan
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fungsi untuk test koneksi
async function testConnection() {
  try {
    // Mencoba melakukan koneksi
    const connection = await pool.getConnection();
    console.log("Database connection successful!");

    // Cek versi MySQL
    const [rows] = await connection.query("SELECT VERSION() as version");
    console.log("MySQL Version:", rows[0].version);

    // Tampilkan nama database yang terkoneksi
    const [dbResult] = await connection.query(
      "SELECT DATABASE() as database_name"
    );
    console.log("Connected to database:", dbResult[0].database_name);

    // Release koneksi kembali ke pool
    connection.release();

    return {
      success: true,
      message: "Database connection successful!",
    };
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return {
      success: false,
      message: "Database connection failed!",
      error: error.message,
    };
  } finally {
    // Menutup pool koneksi
    await pool.end();
  }
}

// Jalankan fungsi test koneksi
testConnection()
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
