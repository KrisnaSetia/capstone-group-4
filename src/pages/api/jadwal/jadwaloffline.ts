import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Ambil tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Query Supabase
    const { data, error } = await supabaseServer
      .from("jadwal_offline")
      .select("id_jadwal, tanggal, sesi")
      .gte("tanggal", today)     // tanggal >= NOW()
      .order("tanggal", { ascending: true })
      .order("sesi", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error", error });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
