import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idPsikolog = req.query.id;
  if (!idPsikolog || Array.isArray(idPsikolog)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const db = await connectDatabase();

  // ===== GET: Nama Psikolog + Sesi Tersedia =====
  if (req.method === "GET") {
    const tanggal = req.query.tanggal as string;

    // Ambil nama psikolog
    let namaPsikolog = "";
    try {
      const [result] = await new Promise<RowDataPacket[]>((resolve, reject) => {
        db.query(
          `SELECT u.username AS namaPsikolog FROM psikolog p
           INNER JOIN user u ON u.id_user = p.id_psikolog
           WHERE p.id_psikolog = ?`,
          [idPsikolog],
          (err, result) => {
            if (err) reject(err);
            else resolve(result as RowDataPacket[]);
          }
        );
      });

      if (!result) {
        db.end();
        return res.status(404).json({ message: "Psikolog not found" });
      }

      namaPsikolog = result.namaPsikolog;
    } catch {
      db.end();
      return res.status(500).json({ message: "Error fetching nama psikolog" });
    }

    // Jika belum pilih tanggal
    if (!tanggal) {
      db.end();
      return res
        .status(200)
        .json({ data: { namaPsikolog, sesi_tersedia: [] } });
    }

    try {
      const sesiMap: Record<number, string> = {
        1: "10.00 – 10.40",
        2: "11.00 – 11.40",
        3: "12.00 – 12.40",
      };

      const sesiResult: RowDataPacket[] = await new Promise(
        (resolve, reject) => {
          db.query(
            `SELECT sesi FROM jadwal_online
           WHERE id_psikolog = ? AND DATE(tanggal) = ? AND status = 0
           ORDER BY sesi ASC`,
            [idPsikolog, tanggal],
            (err, result) => {
              if (err) reject(err);
              else resolve(result as RowDataPacket[]);
            }
          );
        }
      );

      const sesi_tersedia = sesiResult.map(
        (row) => sesiMap[row.sesi] || `Sesi ${row.sesi}`
      );
      db.end();

      return res.status(200).json({ data: { namaPsikolog, sesi_tersedia } });
    } catch {
      db.end();
      return res
        .status(500)
        .json({ message: "Error fetching sesi konsultasi" });
    }
  }

  // ===== POST: Simpan Konsultasi =====
  if (req.method === "POST") {
    const { tanggal, sesi, keluhan } = req.body;
    if (!tanggal || !sesi || !keluhan) {
      db.end();
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Ubah sesi ke angka
    const sesiMap: Record<string, number> = {
      "10.00 – 10.40": 1,
      "11.00 – 11.40": 2,
      "12.00 – 12.40": 3,
    };

    const sesiNumber = sesiMap[sesi];
    if (!sesiNumber) {
      db.end();
      return res.status(400).json({ message: "Sesi tidak valid" });
    }

    try {
      // Cek jadwal tersedia
      const [jadwalRow]: RowDataPacket[] = await new Promise(
        (resolve, reject) => {
          db.query(
            `SELECT id_jadwal FROM jadwal_online
           WHERE id_psikolog = ? AND DATE(tanggal) = ? AND sesi = ? AND status = 0 LIMIT 1`,
            [idPsikolog, tanggal, sesiNumber],
            (err, result) => {
              if (err) reject(err);
              else resolve(result as RowDataPacket[]);
            }
          );
        }
      );

      if (!jadwalRow || !jadwalRow.id_jadwal) {
        db.end();
        return res
          .status(404)
          .json({ message: "Sesi tidak ditemukan atau sudah penuh" });
      }

      const id_jadwal = jadwalRow.id_jadwal;

      // Simpan ke konsultasi_online
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO konsultasi_online
           (id_mahasiswa, id_psikolog, id_jadwal, keluhan, status, tanggal_pengajuan)
           VALUES (?, ?, ?, ?, 1, NOW())`,
          [user.userId, idPsikolog, id_jadwal, keluhan],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      // Update jadwal menjadi penuh
      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE jadwal_online SET status = 1 WHERE id_jadwal = ?`,
          [id_jadwal],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      db.end();
      return res
        .status(200)
        .json({ message: "Konsultasi berhasil didaftarkan" });
    } catch (err) {
      console.error("Gagal menyimpan data konsultasi:", err);
      db.end();
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat menyimpan data" });
    }
  }

  // Method not allowed
  db.end();
  return res.status(405).json({ message: "Method not allowed" });
}
