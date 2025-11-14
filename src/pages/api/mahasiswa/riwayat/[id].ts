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

  const {
    query: { id },
  } = req;

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // validasi id riwayat
  const riwayatId = Array.isArray(id)
    ? parseInt(id[0], 10)
    : parseInt(id as string, 10);
  if (Number.isNaN(riwayatId)) {
    return res.status(400).json({ message: "ID riwayat tidak valid" });
  }

  try {
    // 1) Ambil riwayat berdasarkan id_riwayat
    const { data: riwayat, error: riwayatErr } = await supabaseServer
      .from("riwayat")
      .select("id_riwayat, id_konsultasi_online, waktu_mulai, waktu_selesai")
      .eq("id_riwayat", riwayatId)
      .maybeSingle();

    if (riwayatErr) {
      console.error("Supabase error (riwayat):", riwayatErr);
      return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }

    if (!riwayat) {
      return res.status(404).json({ message: "Riwayat tidak ditemukan" });
    }

    // 2) Ambil konsultasi_online dan pastikan milik mahasiswa yang login
    const { data: konsultasi, error: konsultasiErr } = await supabaseServer
      .from("konsultasi_online")
      .select("id_psikolog, id_mahasiswa, keluhan")
      .eq("id_konsultasi_online", riwayat.id_konsultasi_online)
      .eq("id_mahasiswa", user.userId)
      .maybeSingle();

    if (konsultasiErr) {
      console.error("Supabase error (konsultasi_online):", konsultasiErr);
      return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }

    if (!konsultasi) {
      // entah tidak ada, atau bukan milik mahasiswa ini
      return res.status(404).json({ message: "Riwayat tidak ditemukan" });
    }

    // 3) Ambil data psikolog dari user (via id_psikolog = user.id_user)
    const { data: psikologUser, error: psikologErr } = await supabaseServer
      .from("user")
      .select("username")
      .eq("id_user", konsultasi.id_psikolog)
      .maybeSingle();

    if (psikologErr) {
      console.error("Supabase error (user - psikolog):", psikologErr);
      return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }

    const namaPsikolog = psikologUser?.username ?? "Tidak diketahui";

    // 4) Format tanggal & jam seperti versi MySQL
    if (!riwayat.waktu_mulai || !riwayat.waktu_selesai) {
      return res
        .status(500)
        .json({ message: "Data riwayat tidak lengkap (waktu tidak tersedia)" });
    }

    const mulai = new Date(riwayat.waktu_mulai);
    const selesai = new Date(riwayat.waktu_selesai);

    const tanggalKonsultasi = mulai
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":"); // locale ID kadang pakai '.' untuk pemisah jam

    const jadwalKonsultasi = mulai.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const sesiKonsultasi = `${mulai.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} – ${selesai.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`.replace(/\./g, ":");

    return res.status(200).json({
      id: riwayatId, // id_riwayat
      id_user: user.userId,
      id_psikolog: konsultasi.id_psikolog,
      namaPsikolog,
      tanggalKonsultasi,
      jadwalKonsultasi,
      sesiKonsultasi,
      keluhan: konsultasi.keluhan,
    });
  } catch (error) {
    console.error("Error detail riwayat mahasiswa:", error);
    return res.status(500).json({ message: "Terjadi kesalahan internal" });
  }
}
