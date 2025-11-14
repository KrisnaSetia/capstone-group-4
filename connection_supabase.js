import { supabaseServer } from "./db-supabase.js";

// Fungsi test koneksi
async function testConnection() {
  try {
    console.log("🔄 Testing Supabase connection...");

    // Query simple (cek total row pada tabel "user")
    const { error, count } = await supabaseServer
      .from("lagu_tenang")
      .select("*", { count: "exact", head: true }); // Tidak ambil data, hanya hitung

    if (error) {
      throw error;
    }

    console.log("✅ Connected to Supabase successfully!");
    console.log("📦 Total rows in 'lagu_tenang' table:", count);

    return {
      success: true,
      message: "Supabase connection successful!",
      rows: count,
    };
  } catch (err) {
    console.error("❌ Failed to connect to Supabase:", err.message);
    return {
      success: false,
      message: "Supabase connection failed!",
      error: err.message,
    };
  }
}

// Run tester
testConnection()
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
