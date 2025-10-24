import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  if (req.method === "GET") {
    const query = `
      SELECT u.id_user, u.email, u.username, u.usia, u.jenis_kelamin, m.jurusan_mahasiswa
      FROM user u
      INNER JOIN mahasiswa m ON u.id_user = m.id_mahasiswa
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
    const { username, jenis_kelamin, usia, jurusan_mahasiswa } = req.body;

    if (!username || !jenis_kelamin || !usia || !jurusan_mahasiswa) {
      db.end();
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const updateUser = `UPDATE user SET username = ?, jenis_kelamin = ?, usia = ? WHERE id_user = ?`;
    const updateMahasiswa = `UPDATE mahasiswa SET jurusan_mahasiswa = ? WHERE id_mahasiswa = ?`;

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

          db.query(
            updateMahasiswa,
            [jurusan_mahasiswa, user.userId],
            (err2) => {
              if (err2) {
                return db.rollback(() => {
                  db.end();
                  res.status(500).json({ message: "Gagal update mahasiswa" });
                });
              }

              db.commit((err3) => {
                db.end();
                if (err3) {
                  return res.status(500).json({ message: "Gagal commit data" });
                }

                return res.status(200).json({ message: "Update berhasil" });
              });
            }
          );
        }
      );
    });
  } else {
    db.end();
    return res.status(405).json({ message: "Method not allowed" });
  }
}
