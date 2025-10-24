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
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id_psikolog, id_riwayat, rating } = req.body;
  const id_user = user.userId;

  if (!id_psikolog || !id_riwayat || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  const db = await connectDatabase();

  try {
    // Cek apakah sudah pernah memberi rating untuk riwayat ini
    const checkQuery = `
      SELECT * FROM rating_psikolog
      WHERE id_user = ? AND id_riwayat = ?
      LIMIT 1
    `;

    const [existing]: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(checkQuery, [id_user, id_riwayat], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (existing) {
      db.end();
      return res.status(409).json({ message: "Kamu sudah memberi rating untuk sesi ini." });
    }

    // Simpan rating
    const insertQuery = `
      INSERT INTO rating_psikolog (id_psikolog, id_user, id_riwayat, rating)
      VALUES (?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [id_psikolog, id_user, id_riwayat, rating], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Hitung rata-rata baru
    const avgQuery = `
      SELECT ROUND(AVG(rating), 1) AS average FROM rating_psikolog WHERE id_psikolog = ?
    `;

    const [avgResult]: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(avgQuery, [id_psikolog], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const newAverage = avgResult?.average || 0;

    // Update ke tabel psikolog
    const updatePsikologQuery = `
      UPDATE psikolog SET rating = ? WHERE id_psikolog = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(updatePsikologQuery, [newAverage, id_psikolog], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    db.end();
    return res.status(201).json({ message: "Rating berhasil dikirim." });
  } catch (err) {
    console.error("Error saat kirim rating:", err);
    db.end();
    return res.status(500).json({ message: "Terjadi kesalahan saat menyimpan rating." });
  }
}