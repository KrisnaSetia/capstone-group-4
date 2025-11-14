/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

type DetailPesanan = {
  id: number;
  namaPsikolog: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  lokasi: string;
  keluhan: string;
  status: "Terdaftar" | "Menunggu" | "Ditolak";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validasi user adalah admin (role = 2)
  const me = getUserFromRequest(req);
  if (!me || me.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    // Query Supabase dengan join ke jadwal_offline dan user
    const { data: result, error } = await supabaseServer
      .from("konsultasi_offline")
      .select(
        `
        id_konsultasi,
        keluhan,
        status,
        tanggal_pengajuan,
        jadwal_offline!inner (
          tanggal,
          sesi
        ),
        user!inner (
          username
        )
      `
      )
      .eq("id_konsultasi", id)
      .single() as { data: any; error: any };

    if (error) {
      // Jika error karena data tidak ditemukan
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
      }
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result) {
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    // Mapping status dari database
    const statusMap: Record<number, "Terdaftar" | "Menunggu" | "Ditolak"> = {
      0: "Ditolak",
      1: "Terdaftar",
      2: "Terdaftar",
      3: "Ditolak",
    };

    // Mapping sesi
    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 11.30)",
      2: "Sesi 2 (12.00 – 13.30)",
      3: "Sesi 3 (14.00 – 15.30)",
    };

    // Format tanggal pengajuan
    const tanggalPengajuan = new Date(result.tanggal_pengajuan).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Format jadwal konsultasi
    const jadwalKonsultasi = new Date(
      result.jadwal_offline.tanggal
    ).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const detailData: DetailPesanan = {
      id: result.id_konsultasi,
      namaPsikolog: "SHCC ITS",
      tanggalPengajuan: tanggalPengajuan,
      jadwalKonsultasi: jadwalKonsultasi,
      sesiKonsultasi:
        sesiMap[result.jadwal_offline.sesi] || "Sesi tidak diketahui",
      lokasi: "Lantai 2 Kantin Pusat ITS",
      keluhan: result.keluhan,
      status: statusMap[result.status] || "Menunggu",
    };

    return res.status(200).json(detailData);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}