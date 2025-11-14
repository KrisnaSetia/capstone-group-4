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

  const { id_konsultasi, alasan_penolakan } = req.body;

  if (
    !id_konsultasi ||
    !alasan_penolakan ||
    typeof alasan_penolakan !== "string"
  ) {
    return res
      .status(400)
      .json({ message: "Data tidak lengkap atau tidak valid" });
  }

  try {
    // 1. Ambil id_jadwal terkait
    const { data: konsultasiData, error: konsultasiError } =
      (await supabaseServer
        .from("konsultasi_online")
        .select("id_jadwal")
        .eq("id_konsultasi_online", id_konsultasi)
        .eq("id_psikolog", user.userId)
        .single()) as { data: any; error: any };

    if (konsultasiError || !konsultasiData) {
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    const id_jadwal = konsultasiData.id_jadwal;

    // 2. Update konsultasi jadi ditolak
    const { data: updateData, error: updateError } = await supabaseServer
      .from("konsultasi_online")
      .update({
        status: 0,
        alasan_penolakan: alasan_penolakan.trim(),
      })
      .eq("id_konsultasi_online", id_konsultasi)
      .eq("id_psikolog", user.userId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return res
        .status(500)
        .json({ message: "Gagal mengupdate status konsultasi" });
    }

    if (!updateData || updateData.length === 0) {
      return res.status(404).json({
        message: "Konsultasi tidak ditemukan atau tidak berhak mengakses",
      });
    }

    // 3. Set status jadwal jadi 0 agar bisa dipakai ulang
    const { error: jadwalError } = await supabaseServer
      .from("jadwal_online")
      .update({ status: 0 })
      .eq("id_jadwal", id_jadwal);

    if (jadwalError) {
      console.error("Jadwal update error:", jadwalError);
      // Tidak return error karena konsultasi sudah ditolak
      // Hanya log saja
    }

    return res.status(200).json({
      message: "Konsultasi berhasil ditolak dan jadwal dibuka kembali",
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memproses" });
  }
}
