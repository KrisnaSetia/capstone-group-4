import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

type PsikologRow = {
  id_psikolog: number;
  username: string;
  nomor_sertifikasi: string;
  kuota_harian: number;
  rating: number;
  deskripsi: string;
  url_foto: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validasi user adalah admin (role = 2)
  const me = getUserFromRequest(req);
  if (!me || me.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const db = await connectDatabase();

  const sql = `
    SELECT 
      p.id_psikolog,
      u.username,
      p.nomor_sertifikasi,
      p.kuota_harian,
      COALESCE(p.rating, 0) AS rating,
      p.deskripsi,
      p.url_foto
    FROM psikolog p
    INNER JOIN user u ON p.id_psikolog = u.id_user
    ORDER BY u.username ASC
  `;

  db.query(sql, (err: unknown, results: unknown) => {
    db.end();

    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const data = results as PsikologRow[];

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });
}