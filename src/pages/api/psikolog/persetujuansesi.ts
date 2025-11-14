/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya izinkan GET
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Cek user login & role psikolog
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Query ke Supabase
    const { data: rows, error } = await supabaseServer
      .from("konsultasi_online")
      .select(
        `
        id_konsultasi_online,
        tanggal_pengajuan,
        keluhan,
        status,
        jadwal_online:jadwal_online (
          tanggal,
          sesi
        ),
        mahasiswa:mahasiswa (
          id_mahasiswa,
          user:user (
            id_user,
            username
          )
        )
      `
      )
      .eq("id_psikolog", user.userId)
      .eq("status", 1)
      .order("id_konsultasi_online", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    // Map sesi → label
    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 - 10.40)",
      2: "Sesi 2 (11.00 - 11.40)",
      3: "Sesi 3 (12.00 - 12.40)",
    };

    const data =
      rows?.map((row: any) => {
        const jadwalTanggal = row.jadwal_online?.tanggal;
        const sesi = row.jadwal_online?.sesi;

        // Format tanggal jadwal
        const tanggalFormatted = jadwalTanggal
          ? new Date(jadwalTanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";

        // Format tanggal pengajuan (tanggal + jam)
        const tanggalPengajuan = row.tanggal_pengajuan
          ? new Date(row.tanggal_pengajuan).toLocaleString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "";

        const namaMahasiswa =
          row.mahasiswa?.user?.username ??
          row.mahasiswa?.username ??
          "Mahasiswa";

        return {
          id: row.id_konsultasi_online.toString(),
          namaMahasiswa,
          tanggal_pengajuan: tanggalPengajuan,
          jadwalKonsultasi: tanggalFormatted,
          sesiKonsultasi: sesi ? sesiMap[sesi] || `Sesi ${sesi}` : "",
          keluhan: row.keluhan,
          status: row.status, // tetap angka, frontend yang map ke label
        };
      }) ?? [];

    return res.status(200).json({ data });
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
