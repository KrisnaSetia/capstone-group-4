import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

  const { id_konsultasi, alasan_penolakan } = req.body;

  if (
    !id_konsultasi ||
    !alasan_penolakan ||
    typeof alasan_penolakan !== "string"
  ) {
    return res
      .status(400)
      .json({ message: "Data tidak lengkap atau tidak valid" });
  }

  const db = await connectDatabase();

  try {
    // 1. Ambil id_jadwal terkait
    const jadwalResult = await new Promise<RowDataPacket[]>(
      (resolve, reject) => {
        db.query(
          `SELECT id_jadwal FROM konsultasi_online WHERE id_konsultasi_online = ? AND id_psikolog = ?`,
          [id_konsultasi, user.userId],
          (err, result) => {
            if (err) reject(err);
            else resolve(result as RowDataPacket[]);
          }
        );
      }
    );

    if (!jadwalResult || jadwalResult.length === 0) {
      db.end();
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    const id_jadwal = jadwalResult[0].id_jadwal;

    // 2. Update konsultasi jadi ditolak
    const updateResult = await new Promise<ResultSetHeader>(
      (resolve, reject) => {
        db.query(
          `UPDATE konsultasi_online
         SET status = 0, alasan_penolakan = ?
         WHERE id_konsultasi_online = ? AND id_psikolog = ?`,
          [alasan_penolakan.trim(), id_konsultasi, user.userId],
          (err, result) => {
            if (err) reject(err);
            else resolve(result as ResultSetHeader);
          }
        );
      }
    );

    if (updateResult.affectedRows === 0) {
      db.end();
      return res
        .status(404)
        .json({
          message: "Konsultasi tidak ditemukan atau tidak berhak mengakses",
        });
    }

    // 3. Set status jadwal jadi 0 agar bisa dipakai ulang
    await new Promise<void>((resolve, reject) => {
      db.query(
        `UPDATE jadwal_online SET status = 0 WHERE id_jadwal = ?`,
        [id_jadwal],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    db.end();
    return res
      .status(200)
      .json({
        message: "Konsultasi berhasil ditolak dan jadwal dibuka kembali",
      });
  } catch (error) {
    db.end();
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memproses" });
  }
}
