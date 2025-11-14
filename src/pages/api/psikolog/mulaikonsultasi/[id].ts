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

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Query Supabase dengan multiple joins
    const { data: result, error } = (await supabaseServer
      .from("konsultasi_online")
      .select(
        `
        id_konsultasi_online,
        tanggal_pengajuan,
        keluhan,
        status,
        url_start_zoom,
        jadwal_online!inner (
          tanggal,
          sesi
        ),
        mahasiswa!inner (
          user!inner (
            username
          )
        )
      `
      )
      .eq("id_konsultasi_online", id)
      .eq("id_psikolog", user.userId)
      .eq("status", 2)
      .single()) as { data: any; error: any };

    if (error || !result) {
      if (error?.code === "PGRST116") {
        return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
      }
      console.error("Supabase error:", error);
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 10.40)",
      2: "Sesi 2 (11.00 – 11.40)",
      3: "Sesi 3 (12.00 – 12.40)",
    };

    const tanggalFormatted = new Date(
      result.jadwal_online.tanggal
    ).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pengajuanFormatted = new Date(
      result.tanggal_pengajuan
    ).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return res.status(200).json({
      id: result.id_konsultasi_online.toString(),
      namaMahasiswa: result.mahasiswa.user.username,
      tanggalPengajuan: pengajuanFormatted,
      jadwalKonsultasi: tanggalFormatted,
      sesiKonsultasi:
        sesiMap[result.jadwal_online.sesi] ||
        `Sesi ${result.jadwal_online.sesi}`,
      keluhan: result.keluhan,
      zoomStartUrl: result.url_start_zoom,
    });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data konsultasi" });
  }
}
