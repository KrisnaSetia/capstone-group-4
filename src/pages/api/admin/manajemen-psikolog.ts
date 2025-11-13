/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

type PsikologRow = {
  id_psikolog: number;
  username: string;
  nomor_sertifikasi: string;
  kuota_harian: number;
  rating: number;
  deskripsi: string;
  url_foto: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validasi user adalah admin (role = 2)
  const me = getUserFromRequest(req);
  if (!me || me.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Query Supabase dengan join ke tabel user
    const { data: results, error } = await supabaseServer
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
      .order("user(username)", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    // Transform data untuk match dengan format yang diharapkan
    const data: PsikologRow[] = (results || []).map((r: any) => ({
      id_psikolog: r.id_psikolog,
      username: r.user.username,
      nomor_sertifikasi: r.nomor_sertifikasi,
      kuota_harian: r.kuota_harian,
      rating: r.rating ?? 0, // COALESCE equivalent
      deskripsi: r.deskripsi,
      url_foto: r.url_foto,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}