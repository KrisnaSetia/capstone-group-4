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

  // Pastikan id-nya valid number
  const konsulId = Array.isArray(id)
    ? parseInt(id[0], 10)
    : parseInt(id as string, 10);
  if (Number.isNaN(konsulId)) {
    return res.status(400).json({ message: "ID konsultasi tidak valid" });
  }

  try {
    // 1) Ambil konsultasi_online untuk id ini & milik mahasiswa yang login
    const { data: konsultasi, error: konsultasiErr } = await supabaseServer
      .from("konsultasi_online")
      .select(
        `
        id_konsultasi_online,
        id_mahasiswa,
        id_psikolog,
        id_jadwal,
        tanggal_pengajuan,
        status,
        keluhan,
        url_join_zoom,
        alasan_penolakan
      `
      )
      .eq("id_konsultasi_online", konsulId)
      .eq("id_mahasiswa", user.userId)
      .maybeSingle();

    if (konsultasiErr) {
      console.error("Supabase error (konsultasi_online):", konsultasiErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (!konsultasi) {
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    // 2) Ambil jadwal_online
    const { data: jadwal, error: jadwalErr } = await supabaseServer
      .from("jadwal_online")
      .select("tanggal, sesi")
      .eq("id_jadwal", konsultasi.id_jadwal)
      .maybeSingle();

    if (jadwalErr) {
      console.error("Supabase error (jadwal_online):", jadwalErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (!jadwal) {
      return res
        .status(404)
        .json({ message: "Jadwal konsultasi tidak ditemukan" });
    }

    // 3) Ambil nama psikolog dari tabel user (FK via psikolog.id_psikolog = user.id_user)
    const { data: psikologUser, error: psikologErr } = await supabaseServer
      .from("user")
      .select("username")
      .eq("id_user", konsultasi.id_psikolog)
      .maybeSingle();

    if (psikologErr) {
      console.error("Supabase error (user/psikolog):", psikologErr);
      return res.status(500).json({ message: "Database error" });
    }

    const namaPsikolog = psikologUser?.username ?? "Tidak diketahui";

    // 4) Mapping sesi & status seperti versi lama
    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 10.40)",
      2: "Sesi 2 (11.00 – 11.40)",
      3: "Sesi 3 (12.00 – 12.40)",
    };

    const statusMap: Record<number, string> = {
      0: "Ditolak",
      1: "Menunggu Persetujuan",
      2: "Telah Disetujui",
    };

    // 5) Format tanggal
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

    const statusNumber = konsultasi.status as number;

    return res.status(200).json({
      id: konsulId,
      namaPsikolog,
      tanggalPengajuan,
      jadwalKonsultasi: tanggalFormatted,
      sesiKonsultasi: sesiMap[jadwal.sesi] || "Tidak diketahui",
      keluhan: konsultasi.keluhan,
      status: statusMap[statusNumber] || "Status tidak diketahui",
      zoomLink: statusNumber === 2 ? konsultasi.url_join_zoom : null,
      alasanPenolakan: statusNumber === 0 ? konsultasi.alasan_penolakan : null,
    });
  } catch (err) {
    console.error("Server error (detail konsultasi online):", err);
    return res.status(500).json({ message: "Server error" });
  }
}
