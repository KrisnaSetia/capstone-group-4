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
      k.tanggal_pengajuan,
      k.status,
      k.keluhan,
      j.tanggal AS jadwal,
      j.sesi
    FROM konsultasi_offline k
    INNER JOIN jadwal_offline j ON k.id_jadwal = j.id_jadwal
    WHERE k.id_konsultasi = ? AND k.id_user = ?
    `,
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
        1: "Sesi 1 (10.00 – 11.30)",
        2: "Sesi 2 (12.00 – 13.30)",
        3: "Sesi 3 (14.00 – 15.30)",
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
        id: id,
        namaPsikolog: "SHCC ITS", // konstan
        tanggalPengajuan,
        jadwalKonsultasi: tanggalFormatted,
        sesiKonsultasi: sesiMap[row.sesi] || "Tidak diketahui",
        lokasi: "Lantai 2 Kantin Pusat ITS", // konstan
        keluhan: row.keluhan,
        status: "Terdaftar", // bisa dikembangkan jika status > 1
      });
    }
  );
}
