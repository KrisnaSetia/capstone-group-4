import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectDatabase();

  if (req.method === "POST") {
    const { judul_lagu, artis, durasi, file_url, url_foto } = req.body;

    if (!judul_lagu || !artis || !durasi || !file_url || !url_foto) {
      db.end();
      return res.status(400).json({ message: "Field tidak boleh kosong" });
    }

    try {
      const query = `
        INSERT INTO lagu_tenang (judul_lagu, artis, durasi, file_url, url_foto)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [judul_lagu, artis, durasi, file_url, url_foto];

      db.query(query, values, (err, results) => {
        db.end();

        if (err) {
          console.error("DB Insert Error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(201).json({
          message: "Lagu berhasil ditambahkan",
          insertedId: results.insertId,
        });
      });
    } catch (err) {
      db.end();
      console.error("Connection Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  else if (req.method === "GET") {
    try {
      const query = `
        SELECT id_lagu AS id, judul_lagu AS judul, file_url AS file, url_foto AS cover
        FROM lagu_tenang
        ORDER BY id_lagu ASC
      `;

      db.query(query, (err, results) => {
        db.end();

        if (err) {
          console.error("DB Query Error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(200).json({ data: results });
      });
    } catch (err) {
      db.end();
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  else {
    db.end();
    return res.status(405).json({ message: "Method not allowed" });
  }
}
