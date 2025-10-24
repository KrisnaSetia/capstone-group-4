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

  const {
    query: { id },
  } = req;

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  try {
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          r.waktu_mulai,
          r.waktu_selesai,
          k.keluhan,
          u.username AS namaMahasiswa
        FROM riwayat r
        INNER JOIN konsultasi_online k ON r.id_konsultasi_online = k.id_konsultasi_online
        INNER JOIN user u ON k.id_mahasiswa = u.id_user
        INNER JOIN psikolog p ON k.id_psikolog = p.id_psikolog
        WHERE r.id_riwayat = ? AND k.id_psikolog = ?`,
        [id, user.userId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results as RowDataPacket[]);
        }
      );
    });

    db.end();

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Riwayat tidak ditemukan" });
    }

    const data = result[0];

    const hariID = new Date(data.waktu_mulai).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const sesiFormatted = `${new Date(data.waktu_mulai).toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )} – ${new Date(data.waktu_selesai).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`.replace(/\./g, ":");

    const tanggalFormatted = new Date(data.waktu_mulai)
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":");

    return res.status(200).json({
      namaMahasiswa: data.namaMahasiswa,
      namaPsikolog: data.namaPsikolog,
      tanggalKonsultasi: tanggalFormatted,
      jadwalKonsultasi: hariID,
      sesiKonsultasi: sesiFormatted,
      keluhan: data.keluhan,
    });
  } catch (error: unknown) {
    db.end();
    console.error("Error saat ambil detail riwayat psikolog:", error);
    return res.status(500).json({ message: "Terjadi kesalahan internal" });
  }
}
