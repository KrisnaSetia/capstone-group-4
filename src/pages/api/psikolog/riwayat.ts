/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/psikolog/riwayat.ts
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
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Query Supabase dengan multiple joins
    const { data: results, error } = await supabaseServer
      .from("riwayat")
      .select(
        `
        id_riwayat,
        waktu_mulai,
        waktu_selesai,
        status_akhir,
        konsultasi_online!inner (
          id_konsultasi_online,
          id_mahasiswa,
          keluhan,
          tanggal_pengajuan,
          id_psikolog,
          status,
          mahasiswa!inner (
            user!inner (
              username
            )
          ),
          jadwal_online!inner (
            sesi
          )
        )
      `
      )
      .eq("konsultasi_online.id_psikolog", user.userId)
      .eq("konsultasi_online.status", 3)
      .order("id_riwayat", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    // Transform data untuk match dengan format yang diharapkan
    const data = (results || []).map((row: any) => ({
      id_riwayat: row.id_riwayat,
      waktu_mulai: row.waktu_mulai,
      waktu_selesai: row.waktu_selesai,
      status_akhir: row.status_akhir,
      id_konsultasi_online: row.konsultasi_online.id_konsultasi_online,
      id_mahasiswa: row.konsultasi_online.id_mahasiswa,
      namaMahasiswa: row.konsultasi_online.mahasiswa.user.username,
      keluhan: row.konsultasi_online.keluhan,
      tanggal_pengajuan: row.konsultasi_online.tanggal_pengajuan,
      sesi: row.konsultasi_online.jadwal_online.sesi,
    }));

    return res.status(200).json({ data });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
