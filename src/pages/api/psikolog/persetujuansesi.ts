/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { query as pgQuery } from "@/../db-postgresql-local.js"; // ⬇️ TAMBAHAN: koneksi PostgreSQL lokal
import { getUserFromRequest } from "@/lib/auth";
import "dotenv/config";

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

  // ⬇️ TAMBAHAN: pilih sumber DB dari env
  const useLocal = process.env.DB_PROVIDER === "local";

  try {
    let rows: any[] = [];

    if (useLocal) {
      // ⬇️ MODE LOCAL: query ke PostgreSQL lokal dengan JOIN manual
      rows = (await pgQuery(
        `
        SELECT
          ko.id_konsultasi_online,
          ko.tanggal_pengajuan,
          ko.keluhan,
          ko.status,
          j.tanggal       AS jadwal_tanggal,
          j.sesi          AS sesi,
          u.username      AS nama_mahasiswa
        FROM konsultasi_online ko
        JOIN mahasiswa m ON ko.id_mahasiswa = m.id_mahasiswa
        JOIN "users" u    ON m.id_mahasiswa = u.id_user
        JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
        WHERE ko.id_psikolog = $1
          AND ko.status = 1
        ORDER BY ko.id_konsultasi_online ASC
        `,
        [user.userId]
      )) as {
        id_konsultasi_online: number;
        tanggal_pengajuan: string;
        keluhan: string;
        status: number;
        jadwal_tanggal: string;
        sesi: number;
        nama_mahasiswa: string;
      }[];
    } else {
      // ⬇️ MODE SUPABASE: kode lama kamu
      const { data, error } = await supabaseServer
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

      rows = (data ?? []) as any[];
    }

    // Map sesi → label
    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 - 10.40)",
      2: "Sesi 2 (11.00 - 11.40)",
      3: "Sesi 3 (12.00 - 12.40)",
    };

    // ⬇️ Mapping output disesuaikan dengan 2 mode
    const data = rows.map((row: any) => {
      if (useLocal) {
        // 🔹 MODE LOCAL: pakai kolom hasil SELECT manual
        const jadwalTanggal = row.jadwal_tanggal;
        const sesi = row.sesi;

        const tanggalFormatted = jadwalTanggal
          ? new Date(jadwalTanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";

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

        return {
          id: row.id_konsultasi_online.toString(),
          namaMahasiswa: row.nama_mahasiswa,
          tanggal_pengajuan: tanggalPengajuan,
          jadwalKonsultasi: tanggalFormatted,
          sesiKonsultasi: sesi ? sesiMap[sesi] || `Sesi ${sesi}` : "",
          keluhan: row.keluhan,
          status: row.status,
        };
      } else {
        // 🔹 MODE SUPABASE: struktur nested seperti sebelumnya
        const jadwalTanggal = row.jadwal_online?.tanggal;
        const sesi = row.jadwal_online?.sesi;

        const tanggalFormatted = jadwalTanggal
          ? new Date(jadwalTanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";

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
      }
    });

    return res.status(200).json({ data });
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
