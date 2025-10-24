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

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  try {
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          ko.id_konsultasi_online AS id,
          u.username AS namaMahasiswa,
          ko.tanggal_pengajuan,
          j.tanggal AS jadwal,
          j.sesi,
          ko.keluhan,
          ko.status,
          ko.url_start_zoom
        FROM konsultasi_online ko
        JOIN mahasiswa m ON ko.id_mahasiswa = m.id_mahasiswa
        JOIN user u on m.id_mahasiswa = u.id_user
        JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
        WHERE ko.id_konsultasi_online = ? AND ko.id_psikolog = ? AND ko.status = 2`,
        [id, user.userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    if (result.length === 0) {
      db.end();
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    const row = result[0];

    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 10.40)",
      2: "Sesi 2 (11.00 – 11.40)",
      3: "Sesi 3 (12.00 – 12.40)",
    };

    const tanggalFormatted = new Date(row.jadwal).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pengajuanFormatted = new Date(row.tanggal_pengajuan).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

    db.end();
    return res.status(200).json({
      id: row.id.toString(),
      namaMahasiswa: row.namaMahasiswa,
      tanggalPengajuan: pengajuanFormatted,
      jadwalKonsultasi: tanggalFormatted,
      sesiKonsultasi: sesiMap[row.sesi] || `Sesi ${row.sesi}`,
      keluhan: row.keluhan,
      zoomStartUrl: row.url_start_zoom,
    });
  } catch (err) {
    db.end();
    console.error("Error:", err);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data konsultasi" });
  }
}
