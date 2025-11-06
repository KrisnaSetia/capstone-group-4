import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idPsikolog = req.query.id;
  if (!idPsikolog || Array.isArray(idPsikolog)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const db = await connectDatabase();

  try {
    const [result]: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          p.id_psikolog,
          u.username,
          p.nomor_sertifikasi,
          p.kuota_harian,
          COALESCE(p.rating, 0) AS rating,
          p.deskripsi,
          p.url_foto
        FROM psikolog p
        INNER JOIN user u ON p.id_psikolog = u.id_user
        WHERE p.id_psikolog = ?`,
        [idPsikolog],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    db.end();

    if (!result) {
      return res.status(404).json({ message: "Psikolog tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id_psikolog: result.id_psikolog,
        username: result.username,
        nomor_sertifikasi: result.nomor_sertifikasi,
        kuota_harian: result.kuota_harian,
        rating: result.rating,
        deskripsi: result.deskripsi,
        url_foto: result.url_foto,
      },
    });
  } catch (err) {
    console.error("Database error:", err);
    db.end();
    return res.status(500).json({ message: "Database error" });
  }
}