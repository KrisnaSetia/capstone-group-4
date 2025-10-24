import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  const tanggal = req.query.tanggal || req.body?.tanggal;
  const user = getUserFromRequest(req);

  // Pastikan user login adalah psikolog (roles 0)
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idPsikolog = user.userId; // Dapatkan dari session
  if (!idPsikolog || !tanggal) {
    return res.status(400).json({ message: "Missing id or tanggal" });
  }

  const db = await connectDatabase();

  if (method === "GET") {
    const query = `SELECT sesi, status FROM jadwal_online WHERE id_psikolog = ? and DATE(tanggal) = ? ORDER BY sesi ASC`;
    db.query(query, [idPsikolog, tanggal], (err, results) => {
      db.end();
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      return res.status(200).json({ data: results });
    });
  } else if (method === "PUT") {
      const sesiData = req.body.sesi;
      if (!Array.isArray(sesiData)) {
        db.end();
        return res.status(400).json({ message: "Invalid sesi data" });
      }

      const promises = sesiData.map((item: { sesi: number; aktif: boolean }) => {
        const { sesi, aktif } = item;

        return new Promise((resolve, reject) => {
          const checkQuery = `
            SELECT 1 FROM konsultasi_online ko
            JOIN jadwal_online jo ON ko.id_jadwal = jo.id_jadwal
            WHERE jo.id_psikolog = ? AND DATE(jo.tanggal) = ? AND jo.sesi = ? AND jo.status = 1
            LIMIT 1
          `;
          db.query(checkQuery, [idPsikolog, tanggal, sesi], (err, checkResult) => {
            if (err) {
              console.error("Error saat cek booking:", err);
              return reject(err);
            }

            if (checkResult.length > 0) {
              console.log(`Sesi ${sesi} sudah dibooking, skip update.`);
              return resolve("SKIPPED");
            }

            const findQuery = `
              SELECT id_jadwal FROM jadwal_online
              WHERE id_psikolog = ? AND DATE(tanggal) = ? AND sesi = ?
            `;
            db.query(findQuery, [idPsikolog, tanggal, sesi], (err, rows) => {
              if (err) {
                console.error("Error saat find jadwal:", err);
                return reject(err);
              }

              const statusValue = aktif ? 0 : 2;

              if (rows.length > 0) {
                const updateQuery = `
                  UPDATE jadwal_online
                  SET status = ?
                  WHERE id_jadwal = ?
                `;
                db.query(updateQuery, [statusValue, rows[0].id_jadwal], (err) => {
                  if (err) {
                    console.error("Error saat update jadwal:", err);
                    return reject(err);
                  }
                  return resolve(true);
                });
              } else {
                const insertQuery = `
                  INSERT INTO jadwal_online (id_psikolog, tanggal, sesi, status)
                  VALUES (?, ?, ?, ?)
                `;
                db.query(insertQuery, [idPsikolog, tanggal, sesi, statusValue], (err) => {
                  if (err) {
                    console.error("Error saat insert jadwal:", err);
                    return reject(err);
                  }
                  return resolve(true);
                });
              }
            });
          });
        });
      });

      try {
        await Promise.all(promises);
        db.end();
        return res.status(200).json({ message: "Jadwal berhasil diperbarui." });
      } catch (error) {
        console.error("❌ Gagal saat Promise.all:", error);
        db.end();
        return res.status(500).json({ message: "Gagal memperbarui jadwal." });
      }
    } else {
    db.end();
    return res.status(405).json({ message: "Method not allowed" });
  }
}
