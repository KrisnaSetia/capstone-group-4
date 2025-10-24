import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const db = await connectDatabase();

  try {
    const query = `
      SELECT id_jadwal, tanggal, sesi
      FROM jadwal_offline
      WHERE tanggal >= CURDATE()
      ORDER BY tanggal ASC, sesi ASC
    `;

    db.query(query, (error, results) => {
      db.end();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      return res.status(200).json(results);
    });
  } catch (error) {
    db.end();
    console.error("Server error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
