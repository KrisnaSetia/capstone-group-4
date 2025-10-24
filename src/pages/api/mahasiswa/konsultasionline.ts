// File: pages/api/mahasiswa/konsultasionline/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

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

  const db = await connectDatabase();

  try {
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          ko.id_konsultasi_online AS id,
          u.username AS namaPsikolog,
          DATE_FORMAT(j.tanggal, '%d %M %Y') AS tanggal,
          j.sesi,
          ko.status
        FROM konsultasi_online ko
        INNER JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
        INNER JOIN psikolog p ON ko.id_psikolog = p.id_psikolog
        INNER JOIN user u ON p.id_psikolog = u.id_user
        WHERE ko.id_mahasiswa = ? AND ko.status != 3
        ORDER BY ko.id_konsultasi_online DESC`,
        [user.userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 - 10.40)",
      2: "Sesi 2 (11.00 - 11.40)",
      3: "Sesi 3 (12.00 - 12.40)",
    };

    const statusMap: Record<number, "menunggu" | "disetujui" | "ditolak"> = {
      1: "menunggu",
      2: "disetujui",
      0: "ditolak",
    };

    const data = result.map((row) => ({
      id: row.id.toString(),
      namaPsikolog: row.namaPsikolog,
      tanggal: row.tanggal,
      sesi: sesiMap[row.sesi] || `Sesi ${row.sesi}`,
      status: statusMap[row.status] || "menunggu",
    }));

    db.end();
    return res.status(200).json({ data });
  } catch (err) {
    console.error("Gagal mengambil data konsultasi:", err);
    db.end();
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data" });
  }
}
