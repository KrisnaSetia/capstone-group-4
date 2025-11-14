import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid psikolog ID" });
  }

  const psikologId = parseInt(id as string, 10);
  if (Number.isNaN(psikologId)) {
    return res.status(400).json({ message: "Invalid psikolog ID" });
  }

  try {
    // 1) Ambil data psikolog dari tabel psikolog
    const { data: psikolog, error: psikologErr } = await supabaseServer
      .from("psikolog")
      .select("id_psikolog, nomor_sertifikasi, rating, deskripsi, url_foto")
      .eq("id_psikolog", psikologId)
      .maybeSingle();

    if (psikologErr) {
      console.error("Supabase error (psikolog):", psikologErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (!psikolog) {
      return res.status(404).json({ message: "Psikolog tidak ditemukan" });
    }

    // 2) Ambil username dari tabel user (FK: psikolog.id_psikolog = user.id_user)
    const { data: userRow, error: userErr } = await supabaseServer
      .from("user")
      .select("username")
      .eq("id_user", psikologId)
      .maybeSingle();

    if (userErr) {
      console.error("Supabase error (user):", userErr);
      return res.status(500).json({ message: "Database error" });
    }

    const responseData = {
      id_psikolog: psikolog.id_psikolog,
      username: userRow?.username ?? null,
      nomor_sertifikasi: psikolog.nomor_sertifikasi,
      rating: psikolog.rating,
      deskripsi: psikolog.deskripsi,
      url_foto: psikolog.url_foto,
    };

    return res.status(200).json({ data: responseData });
  } catch (err) {
    console.error("Server error (detailpsikolog):", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
