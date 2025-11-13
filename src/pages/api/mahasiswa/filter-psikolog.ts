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

  const { tanggal, sesi } = req.query;

  if (!tanggal || !sesi) {
    return res.status(400).json({ message: "Tanggal dan sesi wajib diisi." });
  }

  if (Array.isArray(tanggal) || Array.isArray(sesi)) {
    return res.status(400).json({ message: "Parameter tidak valid." });
  }

  // validasi tanggal & sesi
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return res
      .status(400)
      .json({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  const sesiNum = Number(sesi);
  if (Number.isNaN(sesiNum)) {
    return res.status(400).json({ message: "Sesi tidak valid." });
  }

  try {
    // 🔹 Range tanggal pakai zona waktu Asia/Jakarta (+07:00),
    // mirip dengan DATE(j.tanggal) = ? di MySQL
    const startLocal = new Date(`${tanggal}T00:00:00+07:00`);
    const endLocal = new Date(startLocal);
    endLocal.setDate(endLocal.getDate() + 1);

    const startIso = startLocal.toISOString();
    const endIso = endLocal.toISOString();

    // 1) Ambil jadwal_online yang match tanggal, sesi, status=0
    const { data: jadwalRows, error: jadwalErr } = await supabaseServer
      .from("jadwal_online")
      .select("id_psikolog")
      .gte("tanggal", startIso)
      .lt("tanggal", endIso)
      .eq("sesi", sesiNum)
      .eq("status", 0);

    if (jadwalErr) {
      console.error("Supabase error (jadwal_online filter):", jadwalErr);
      return res.status(500).json({ message: "Gagal mengambil data jadwal" });
    }

    const jadwalList = jadwalRows ?? [];
    if (jadwalList.length === 0) {
      // tidak ada psikolog di jadwal tsb
      return res.status(200).json({ data: [] });
    }

    const psikologIds = Array.from(
      new Set(jadwalList.map((j: any) => j.id_psikolog))
    );

    // 2) Ambil data psikolog
    const { data: psikologRows, error: psikologErr } = await supabaseServer
      .from("psikolog")
      .select("id_psikolog, rating, url_foto")
      .in("id_psikolog", psikologIds);

    if (psikologErr) {
      console.error("Supabase error (psikolog):", psikologErr);
      return res.status(500).json({ message: "Gagal mengambil data psikolog" });
    }

    const psikologList = psikologRows ?? [];

    // 3) Ambil username dari user
    const { data: userRows, error: userErr } = await supabaseServer
      .from("user")
      .select("id_user, username")
      .in(
        "id_user",
        psikologList.map((p: any) => p.id_psikolog)
      );

    if (userErr) {
      console.error("Supabase error (user):", userErr);
      return res.status(500).json({ message: "Gagal mengambil data user" });
    }

    const userList = userRows ?? [];
    const userMap = new Map<number, string>();
    userList.forEach((u: any) => userMap.set(u.id_user, u.username));

    // 4) Gabungkan hasil → bentuk sama seperti hasil query MySQL
    const result = psikologList.map((p: any) => ({
      id_psikolog: p.id_psikolog,
      username: userMap.get(p.id_psikolog) ?? null,
      rating: p.rating,
      url_foto: p.url_foto,
    }));

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error fetching available psikolog:", err);
    return res.status(500).json({ message: "Gagal mengambil data psikolog" });
  }
}
