import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // pastikan id valid number
  const konsulId = Array.isArray(id)
    ? parseInt(id[0], 10)
    : parseInt(id as string, 10);
  if (Number.isNaN(konsulId)) {
    return res.status(400).json({ message: "ID konsultasi tidak valid" });
  }

  try {
    // 1) Ambil konsultasi_offline milik user ini
    const { data: konsultasi, error: konsulErr } = await supabaseServer
      .from("konsultasi_offline")
      .select(
        "id_konsultasi, id_user, id_jadwal, tanggal_pengajuan, status, keluhan"
      )
      .eq("id_konsultasi", konsulId)
      .eq("id_user", user.userId)
      .maybeSingle();

    if (konsulErr) {
      console.error("Supabase error (konsultasi_offline):", konsulErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (!konsultasi) {
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    // 2) Ambil jadwal_offline untuk konsultasi ini
    const { data: jadwal, error: jadwalErr } = await supabaseServer
      .from("jadwal_offline")
      .select("tanggal, sesi")
      .eq("id_jadwal", konsultasi.id_jadwal)
      .maybeSingle();

    if (jadwalErr) {
      console.error("Supabase error (jadwal_offline):", jadwalErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (!jadwal) {
      return res
        .status(404)
        .json({ message: "Jadwal konsultasi tidak ditemukan" });
    }

    // 3) Mapping sesi & format tanggal seperti versi MySQL
    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 11.30)",
      2: "Sesi 2 (12.00 – 13.30)",
      3: "Sesi 3 (14.00 – 15.30)",
    };

    const tanggalJadwal = new Date(jadwal.tanggal);
    const hariOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    } as const;
    const tanggalFormatted = tanggalJadwal.toLocaleDateString(
      "id-ID",
      hariOptions
    );

    const tanggalPengajuan = konsultasi.tanggal_pengajuan
      ? new Date(konsultasi.tanggal_pengajuan).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : null;

    return res.status(200).json({
      id: konsulId,
      namaPsikolog: "SHCC ITS", // konstan
      tanggalPengajuan,
      jadwalKonsultasi: tanggalFormatted,
      sesiKonsultasi: sesiMap[jadwal.sesi] || "Tidak diketahui",
      lokasi: "Lantai 2 Kantin Pusat ITS", // konstan
      keluhan: konsultasi.keluhan,
      status: "Terdaftar", // sama seperti komentar kamu, bisa dikembangkan kalau status > 1
    });
  } catch (err) {
    console.error("Server error (detail konsultasi offline):", err);
    return res.status(500).json({ message: "Server error" });
  }
}
