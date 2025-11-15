 import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id_psikolog, id_riwayat, rating } = req.body;
  const id_user = user.userId;

  const psikologIdNum = Number(id_psikolog);
  const riwayatIdNum = Number(id_riwayat);
  const ratingNum = Number(rating);

  if (
    !psikologIdNum ||
    !riwayatIdNum ||
    !ratingNum ||
    ratingNum < 1 ||
    ratingNum > 5
  ) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  try {
    // 1) Cek apakah sudah pernah memberi rating untuk riwayat ini
    const { data: existing, error: existingErr } = await supabaseServer
      .from("rating_psikolog")
      .select("id_rating")
      .eq("id_user", id_user)
      .eq("id_riwayat", riwayatIdNum)
      .maybeSingle();

    if (existingErr) {
      console.error("Supabase error (cek rating existing):", existingErr);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat cek rating." });
    }

    if (existing) {
      return res.status(409).json({
        message: "Kamu sudah memberi rating untuk sesi ini.",
      });
    }

    // 2) Simpan rating baru
    const { error: insertErr } = await supabaseServer
      .from("rating_psikolog")
      .insert({
        id_psikolog: psikologIdNum,
        id_user,
        id_riwayat: riwayatIdNum,
        rating: ratingNum,
        waktu_rating: new Date().toISOString(),
      });

    if (insertErr) {
      console.error("Supabase error (insert rating):", insertErr);
      return res.status(500).json({
        message: "Terjadi kesalahan saat menyimpan rating.",
      });
    }

    // 3) Hitung rata-rata baru rating psikolog ini (di sisi server)
    const { data: ratingRows, error: avgErr } = await supabaseServer
      .from("rating_psikolog")
      .select("rating")
      .eq("id_psikolog", psikologIdNum);

    if (avgErr) {
      console.error("Supabase error (avg rating):", avgErr);
      return res.status(500).json({
        message: "Terjadi kesalahan saat menghitung rata-rata rating.",
      });
    }

    const ratings = (ratingRows ?? []).map((row: { rating: number }) =>
      Number(row.rating)
    );

    const sum = ratings.reduce(
      (acc: number, val: number) => acc + (isNaN(val) ? 0 : val),
      0
    );
    const count = ratings.length || 1;

    const newAverageRaw = sum / count;
    const newAverage = Math.round(newAverageRaw * 10) / 10;

    // 4) Update rating di tabel psikolog
    const { error: updateErr } = await supabaseServer
      .from("psikolog")
      .update({ rating: newAverage })
      .eq("id_psikolog", psikologIdNum);

    if (updateErr) {
      console.error("Supabase error (update psikolog rating):", updateErr);
      // rating user sudah tersimpan, jadi jangan di-rollback; cukup kasih info error
      return res.status(500).json({
        message:
          "Rating berhasil dikirim, tapi gagal memperbarui rata-rata psikolog.",
      });
    }

    return res.status(201).json({ message: "Rating berhasil dikirim." });
  } catch (err) {
    console.error("Error saat kirim rating:", err);
    return res.status(500).json({
      message: "Terjadi kesalahan saat menyimpan rating.",
    });
  }
}
