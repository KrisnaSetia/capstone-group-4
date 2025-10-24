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
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid psikolog ID" });
  }

  const db = await connectDatabase();

  const query = `
    SELECT 
      p.id_psikolog,
      u.username,
      p.nomor_sertifikasi,
      p.rating,
      p.deskripsi,
      p.url_foto
    FROM psikolog p
    INNER JOIN user u ON p.id_psikolog = u.id_user
    WHERE p.id_psikolog = ?
  `;

  db.query(query, [id], (error, results) => {
    db.end();

    if (error) {
      console.error("Query error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Psikolog tidak ditemukan" });
    }

    return res.status(200).json({ data: results[0] });
  });
}
