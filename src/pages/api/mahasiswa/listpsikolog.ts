/* eslint-disable @typescript-eslint/no-explicit-any */
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

  try {
    // 1) Ambil semua psikolog
    const { data: psikologRows, error: psikologErr } = await supabaseServer
      .from("psikolog")
      .select(
        "id_psikolog, nomor_sertifikasi, kuota_harian, rating, deskripsi, url_foto"
      );

    if (psikologErr) {
      console.error("Supabase error (psikolog):", psikologErr);
      return res.status(500).json({ message: "Database error" });
    }

    const psikologList = psikologRows ?? [];

    if (psikologList.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // 2) Ambil username dari tabel user berdasarkan id_psikolog
    const ids = psikologList.map((p: any) => p.id_psikolog);

    const { data: userRows, error: userErr } = await supabaseServer
      .from("user")
      .select("id_user, username")
      .in("id_user", ids);

    if (userErr) {
      console.error("Supabase error (user):", userErr);
      return res.status(500).json({ message: "Database error" });
    }

    const userList = userRows ?? [];
    const userMap = new Map<number, string>();
    for (const u of userList as any[]) {
      userMap.set(u.id_user, u.username);
    }

    // 3) Gabungkan hasil supaya bentuknya sama seperti versi MySQL
    const combined = (psikologList as any[]).map((p) => ({
      id_psikolog: p.id_psikolog,
      username: userMap.get(p.id_psikolog) ?? null, // kalau user tidak ketemu
      nomor_sertifikasi: p.nomor_sertifikasi,
      kuota_harian: p.kuota_harian,
      rating: p.rating,
      deskripsi: p.deskripsi,
      url_foto: p.url_foto,
    }));

    return res.status(200).json({ data: combined });
  } catch (err) {
    console.error("Server error (listpsikolog):", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
