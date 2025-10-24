/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

type KonsultasiOfflineRow = {
  id_konsultasi: number;
  status: number;
  tanggal: string;
  sesi: number;
};

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
      SELECT
        ko.id_konsultasi,
        ko.status,
        jo.tanggal,
        jo.sesi
      FROM konsultasi_offline ko
      INNER JOIN jadwal_offline jo ON ko.id_jadwal = jo.id_jadwal
      WHERE ko.id_user = ?
      ORDER BY ko.id_konsultasi DESC;
    `;

    db.query(query, [user.userId], (err: unknown, results: unknown) => {
      db.end();

      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const formatted = (results as KonsultasiOfflineRow[]).map((item) => ({
        id_konsultasi: item.id_konsultasi,
        status: item.status,
        tanggal: item.tanggal,
        sesi: item.sesi,
        jam: getJamSesi(item.sesi),
      }));

      return res.status(200).json({ data: formatted });
    });
  } else if (req.method === "POST") {
    const { id_jadwal, sesi, keluhan } = req.body;

    if (!id_jadwal || !sesi || !keluhan) {
      db.end();
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    db.query(
      "SELECT tanggal, status FROM jadwal_offline WHERE id_jadwal = ?",
      [id_jadwal],
      (err, rows) => {
        if (err || !rows || (rows as any[]).length === 0) {
          db.end();
          return res.status(404).json({ message: "Jadwal tidak ditemukan." });
        }

        const row = (rows as any[])[0];
        const tanggal = new Date(row.tanggal);
        const hari = tanggal.getDay();

        if (row.status === 1) {
          db.end();
          return res
            .status(400)
            .json({
              message: "Sesi ini sudah penuh. Silakan pilih jadwal lain.",
            });
        }

        if (hari !== 2 && hari !== 4) {
          db.end();
          return res
            .status(400)
            .json({ message: "Konsultasi hanya hari Selasa dan Kamis." });
        }

        if (![1, 2, 3].includes(Number(sesi))) {
          db.end();
          return res.status(400).json({ message: "Sesi tidak valid." });
        }

        db.query(
          "SELECT COUNT(*) AS jumlah FROM konsultasi_offline WHERE id_jadwal = ?",
          [id_jadwal],
          (err, result) => {
            if (err) {
              db.end();
              return res.status(500).json({ message: "Gagal cek kuota." });
            }

            const jumlah = (result as any[])[0].jumlah;
            if (jumlah >= 5) {
              db.end();
              return res
                .status(400)
                .json({ message: "Kuota sesi ini sudah penuh." });
            }

            db.query(
              `INSERT INTO konsultasi_offline (id_user, id_jadwal, keluhan, tanggal_pengajuan, status)
               VALUES (?, ?, ?, NOW(), 1)`,
              [user.userId, id_jadwal, keluhan],
              (err) => {
                if (err) {
                  db.end();
                  console.error("Insert error:", err);
                  return res
                    .status(500)
                    .json({ message: "Gagal menyimpan pendaftaran." });
                }

                db.query(
                  "SELECT COUNT(*) AS jumlah FROM konsultasi_offline WHERE id_jadwal = ?",
                  [id_jadwal],
                  (err, result2) => {
                    if (err) {
                      db.end();
                      return res
                        .status(500)
                        .json({ message: "Gagal verifikasi kuota akhir." });
                    }

                    const finalCount = (result2 as any[])[0].jumlah;
                    if (finalCount >= 5) {
                      db.query(
                        "UPDATE jadwal_offline SET status = 1 WHERE id_jadwal = ?",
                        [id_jadwal],
                        () => {
                          db.end();
                          return res.status(200).json({
                            message:
                              "Pendaftaran berhasil dan jadwal sudah ditutup.",
                          });
                        }
                      );
                    } else {
                      db.end();
                      return res
                        .status(200)
                        .json({ message: "Pendaftaran berhasil." });
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  } else {
    db.end();
    return res.status(405).json({ message: "Method not allowed" });
  }
}

function getJamSesi(sesi: number): string {
  switch (sesi) {
    case 1:
      return "10:00 - 11:30";
    case 2:
      return "12:00 - 13:30";
    case 3:
      return "14:00 - 15:30";
    default:
      return "Tidak diketahui";
  }
}
