/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idPsikolog = req.query.id;
  if (!idPsikolog || Array.isArray(idPsikolog)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Query Supabase untuk mendapatkan detail psikolog berdasarkan ID
    const { data: results, error } = (await supabaseServer
      .from("psikolog")
      .select(
        `
        id_psikolog,
        nomor_sertifikasi,
        kuota_harian,
        rating,
        deskripsi,
        url_foto,
        user!inner (
          username
        )
      `
      )
      .eq("id_psikolog", idPsikolog)
      .single()) as { data: any; error: any }; // Mengambil single row

    if (error) {
      // Jika error karena data tidak ditemukan
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Psikolog tidak ditemukan" });
      }
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    if (!results) {
      return res.status(404).json({ message: "Psikolog tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id_psikolog: results.id_psikolog,
        username: results.user.username,
        nomor_sertifikasi: results.nomor_sertifikasi,
        kuota_harian: results.kuota_harian,
        rating: results.rating ?? 0, // COALESCE equivalent
        deskripsi: results.deskripsi,
        url_foto: results.url_foto,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
