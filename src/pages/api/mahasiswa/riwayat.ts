// pages/api/mahasiswa/riwayat.ts (nama file diubah)
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  // Asumsi: roles mahasiswa adalah 0. Sesuaikan jika peran mahasiswa Anda berbeda.
  if (!user || user.roles !== 1) { // Ini sudah sesuai jika 0 adalah role mahasiswa
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  const query = `
     SELECT
    r.id_riwayat,
    r.waktu_mulai,
    r.waktu_selesai,
    r.status_akhir,
    k.id_konsultasi_online,
    k.id_psikolog,
    u.username AS namaPsikolog, 
    k.keluhan,
    k.tanggal_pengajuan,
    j.sesi
  FROM riwayat r
  INNER JOIN konsultasi_online k ON r.id_konsultasi_online = k.id_konsultasi_online
  INNER JOIN user u ON k.id_psikolog = u.id_user
  INNER JOIN jadwal_online j ON k.id_jadwal = j.id_jadwal
  WHERE k.id_mahasiswa = ? AND k.status = 3
  ORDER BY r.id_riwayat DESC;
  `;

  db.query(query, [user.userId], (error, results) => {
    db.end();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({ data: results });
  });
}