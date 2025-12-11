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
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ⬇️ TAMBAHAN: pilih mode DB dari env
  const useLocal = process.env.DB_PROVIDER === "local";

  try {
    let rows: any[] = [];

    if (useLocal) {
      // ⬇️ MODE LOCAL: query ke PostgreSQL lokal
      rows = (await pgQuery(
        `
        SELECT
          ko.id_konsultasi_online,
          ko.tanggal_pengajuan,
          ko.keluhan,
          ko.status,
          ko.url_start_zoom,
          j.tanggal       AS jadwal_tanggal,
          j.sesi          AS sesi,
          u.username      AS nama_mahasiswa
        FROM konsultasi_online ko
        JOIN mahasiswa m ON ko.id_mahasiswa = m.id_mahasiswa
        JOIN "users" u    ON m.id_mahasiswa = u.id_user
        JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
        WHERE ko.id_psikolog = $1
          AND ko.status = 2
        ORDER BY ko.id_konsultasi_online ASC
        `,
        [user.userId]
      )) as {
        id_konsultasi_online: number;
        tanggal_pengajuan: string;
        keluhan: string;
        status: number;
        url_start_zoom: string | null;
        jadwal_tanggal: string;
        sesi: number;
        nama_mahasiswa: string;
      }[];
    } else {
      // ⬇️ MODE SUPABASE: kode asli kamu
      const { data, error } = await supabaseServer
        .from("konsultasi_online")
        .select(
          `
          id_konsultasi_online,
          tanggal_pengajuan,
          keluhan,
          status,
          url_start_zoom,
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
        .eq("status", 2) // status = 2 -> mulai konsultasi
        .order("id_konsultasi_online", { ascending: true });

      if (error) {
        console.error("Supabase error (mulai konsultasi):", error);
        return res
          .status(500)
          .json({ message: "Gagal mengambil data konsultasi" });
      }

      rows = (data ?? []) as any[];
    }

    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 10.40)",
      2: "Sesi 2 (11.00 – 11.40)",
      3: "Sesi 3 (12.00 – 12.40)",
    };

    const data =
      rows?.map((row: any) => {
        if (useLocal) {
          // 🔹 MODE LOCAL: pakai kolom datar hasil SELECT
          const tanggalJadwal = row.jadwal_tanggal;
          const sesi = row.sesi as number | undefined;

          const tanggalFormatted = tanggalJadwal
            ? new Date(tanggalJadwal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "";

          const pengajuanFormatted = row.tanggal_pengajuan
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
            tanggalPengajuan: pengajuanFormatted,
            jadwalKonsultasi: tanggalFormatted,
            sesiKonsultasi: sesi ? sesiMap[sesi] || `Sesi ${sesi}` : "",
            keluhan: row.keluhan,
            status: row.status,
            zoomStartUrl: row.url_start_zoom,
          };
        } else {
          // 🔹 MODE SUPABASE: struktur nested seperti sebelumnya
          const tanggalJadwal = row.jadwal_online?.tanggal;
          const sesi = row.jadwal_online?.sesi as number | undefined;

          const tanggalFormatted = tanggalJadwal
            ? new Date(tanggalJadwal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "";

          const pengajuanFormatted = row.tanggal_pengajuan
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
            tanggalPengajuan: pengajuanFormatted,
            jadwalKonsultasi: tanggalFormatted,
            sesiKonsultasi: sesi ? sesiMap[sesi] || `Sesi ${sesi}` : "",
            keluhan: row.keluhan,
            status: row.status,
            zoomStartUrl: row.url_start_zoom,
          };
        }
      }) ?? [];

    return res.status(200).json({ data });
  } catch (err) {
    console.error("Unhandled error (mulai konsultasi):", err);
    return res.status(500).json({ message: "Gagal mengambil data konsultasi" });
  }
}
