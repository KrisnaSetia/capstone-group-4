import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) return res.status(401).json({ message: "Unauthorized" });

  const { tanggal, sesi } = req.query;

  if (!tanggal || !sesi) {
    return res.status(400).json({ message: "Tanggal dan sesi wajib diisi." });
  }

  const db = await connectDatabase();

  try {
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          p.id_psikolog,
          u.username,
          p.rating,
          p.url_foto
        FROM jadwal_online j
        INNER JOIN psikolog p ON j.id_psikolog = p.id_psikolog
        INNER JOIN user u ON u.id_user = p.id_psikolog
        WHERE DATE(j.tanggal) = ? AND j.sesi = ? AND j.status = 0`,
        [tanggal, sesi],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    db.end();
    return res.status(200).json({ data: result });
  } catch (err) {
    db.end();
    console.error("Error fetching available psikolog:", err);
    return res.status(500).json({ message: "Gagal mengambil data psikolog" });
  }
}