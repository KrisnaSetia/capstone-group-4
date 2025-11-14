/* eslint-disable @typescript-eslint/no-explicit-any */
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
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id_konsultasi } = req.body;
  if (!id_konsultasi) {
    return res.status(400).json({ message: "ID konsultasi diperlukan" });
  }

  try {
    // Ambil tanggal dari jadwal untuk waktu_mulai
    const { data: konsultasiData, error: konsultasiError } =
      (await supabaseServer
        .from("konsultasi_online")
        .select(
          `
          id_jadwal,
          jadwal_online!inner (
            tanggal
          )
        `
        )
        .eq("id_konsultasi_online", id_konsultasi)
        .eq("id_psikolog", user.userId)
        .eq("status", 2)
        .single()) as { data: any; error: any };

    if (konsultasiError || !konsultasiData) {
      return res
        .status(404)
        .json({ message: "Konsultasi tidak ditemukan atau belum disetujui" });
    }

    const waktuMulai = konsultasiData.jadwal_online.tanggal;

    // Update status ke "selesai" (status = 3)
    const { error: updateError } = await supabaseServer
      .from("konsultasi_online")
      .update({ status: 3 })
      .eq("id_konsultasi_online", id_konsultasi);

    if (updateError) {
      console.error("Update error:", updateError);
      return res
        .status(500)
        .json({ message: "Gagal mengupdate status konsultasi" });
    }

    // Insert ke riwayat
    const { error: insertError } = await supabaseServer.from("riwayat").insert({
      id_konsultasi_online: id_konsultasi,
      waktu_mulai: waktuMulai,
      waktu_selesai: new Date().toISOString(),
      status_akhir: 1,
    });

    if (insertError) {
      console.error("Insert riwayat error:", insertError);
      return res
        .status(500)
        .json({ message: "Gagal menyimpan data ke riwayat" });
    }

    return res
      .status(200)
      .json({ message: "Sesi berhasil diakhiri dan dicatat ke riwayat." });
  } catch (err: unknown) {
    console.error("Error saat mengakhiri sesi:", err);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengakhiri sesi" });
  }
}
