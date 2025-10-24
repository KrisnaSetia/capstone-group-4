import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id_konsultasi } = req.body;
  if (!id_konsultasi) {
    return res.status(400).json({ message: "ID konsultasi diperlukan" });
  }

  const db = await connectDatabase();

  try {
    // Ambil tanggal dari jadwal untuk waktu_mulai
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT ko.id_jadwal, j.tanggal
         FROM konsultasi_online ko
         JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
         WHERE ko.id_konsultasi_online = ? AND ko.id_psikolog = ? AND ko.status = 2`,
        [id_konsultasi, user.userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    if (result.length === 0) {
      db.end();
      return res
        .status(404)
        .json({ message: "Konsultasi tidak ditemukan atau belum disetujui" });
    }

    const waktuMulai: string = result[0].tanggal;

    // Update status ke "selesai"
    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE konsultasi_online SET status = 3 WHERE id_konsultasi_online = ?`,
        [id_konsultasi],
        (err) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });

    // Insert ke riwayat
    await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO riwayat (id_konsultasi_online, waktu_mulai, waktu_selesai, status_akhir)
         VALUES (?, ?, NOW(), 1)`,
        [id_konsultasi, waktuMulai],
        (err) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });

    db.end();
    return res
      .status(200)
      .json({ message: "Sesi berhasil diakhiri dan dicatat ke riwayat." });
  } catch (err: unknown) {
    db.end();
    console.error("Error saat mengakhiri sesi:", err);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengakhiri sesi" });
  }
}
