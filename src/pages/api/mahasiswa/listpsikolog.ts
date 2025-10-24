// pages/api/psikolog/index.ts
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

  if (!user  || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  const query = `
    SELECT 
      id_psikolog,
      username,
      nomor_sertifikasi,
      kuota_harian,
      rating,
      deskripsi,
      url_foto
    FROM psikolog
    INNER JOIN user ON psikolog.id_psikolog = user.id_user
  `;

  db.query(query, (error, results) => {
    db.end();

    if (error) {
      console.error("Query error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({ data: results });
  });
}
