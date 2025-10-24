import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  if (req.method === "GET") {
    const query = `
      SELECT 
        u.id_user, u.username, u.email, u.usia, u.jenis_kelamin,
        p.nomor_sertifikasi, p.deskripsi
      FROM user u
      INNER JOIN psikolog p ON u.id_user = p.id_psikolog
      WHERE u.id_user = ?
    `;

    db.query(query, [user.userId], (err, results) => {
      db.end();
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Data profil tidak ditemukan" });
      }

      return res.status(200).json({ data: results[0] });
    });
  } else if (req.method === "PUT") {
    const { username, jenis_kelamin, usia, deskripsi } = req.body;

    if (!username || !jenis_kelamin || !usia || !deskripsi) {
      db.end();
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const updateUser = `UPDATE user SET username = ?, jenis_kelamin = ?, usia = ? WHERE id_user = ?`;
    const updatePsikolog = `UPDATE psikolog SET deskripsi = ? WHERE id_psikolog = ?`;

    db.beginTransaction((err) => {
      if (err) {
        db.end();
        return res.status(500).json({ message: "Gagal memulai transaksi" });
      }

      db.query(
        updateUser,
        [username, jenis_kelamin, usia, user.userId],
        (err1) => {
          if (err1) {
            return db.rollback(() => {
              db.end();
              res.status(500).json({ message: "Gagal update user" });
            });
          }

          db.query(updatePsikolog, [deskripsi, user.userId], (err2) => {
            if (err2) {
              return db.rollback(() => {
                db.end();
                res.status(500).json({ message: "Gagal update psikolog" });
              });
            }

            db.commit((err3) => {
              db.end();
              if (err3) {
                return res.status(500).json({ message: "Gagal commit data" });
              }

              return res.status(200).json({ message: "Update berhasil" });
            });
          });
        }
      );
    });
  } else {
    db.end();
    return res.status(405).json({ message: "Method not allowed" });
  }
}
