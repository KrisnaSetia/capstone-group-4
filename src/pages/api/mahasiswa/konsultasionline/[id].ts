/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const db = await connectDatabase();

  db.query(
    `SELECT
      ko.tanggal_pengajuan,
      ko.status,
      ko.keluhan,
      ko.url_join_zoom,
      ko.alasan_penolakan,
      u.username AS nama_psikolog,
      j.tanggal AS jadwal,
      j.sesi
    FROM konsultasi_online ko
    INNER JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
    INNER JOIN psikolog p ON ko.id_psikolog = p.id_psikolog
    INNER JOIN user u ON p.id_psikolog = u.id_user
    WHERE ko.id_konsultasi_online = ? AND ko.id_mahasiswa = ?`,
    [id, user.userId],
    (err, results) => {
      db.end();

      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!results || (results as any[]).length === 0) {
        return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
      }

      const row = (results as any[])[0];

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

      const tanggalJadwal = new Date(row.jadwal);
      const hariOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" } as const;
      const tanggalFormatted = tanggalJadwal.toLocaleDateString("id-ID", hariOptions);

      const tanggalPengajuan = new Date(row.tanggal_pengajuan).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return res.status(200).json({
        id,
        namaPsikolog: row.nama_psikolog,
        tanggalPengajuan,
        jadwalKonsultasi: tanggalFormatted,
        sesiKonsultasi: sesiMap[row.sesi] || "Tidak diketahui",
        keluhan: row.keluhan,
        status: statusMap[row.status] || "Status tidak diketahui",
        zoomLink: row.status === 2 ? row.url_join_zoom : null,
        alasanPenolakan: row.status === 0 ? row.alasan_penolakan : null,
      });
    }
  );
}
