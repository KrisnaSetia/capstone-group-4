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
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const db = await connectDatabase();

  try {
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT
          u.username AS namaPsikolog,
          p.id_psikolog AS id_psikolog,
          r.waktu_mulai,
          r.waktu_selesai,
          k.keluhan
        FROM riwayat r
        INNER JOIN konsultasi_online k ON r.id_konsultasi_online = k.id_konsultasi_online
        INNER JOIN psikolog p ON k.id_psikolog = p.id_psikolog
        INNER JOIN user u ON p.id_psikolog = u.id_user
        WHERE r.id_riwayat = ? AND k.id_mahasiswa = ?
        LIMIT 1`,
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

    const tanggalKonsultasi = new Date(data.waktu_mulai)
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":");

    const jadwalKonsultasi = new Date(data.waktu_mulai).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

    const sesiKonsultasi = `${new Date(data.waktu_mulai).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )} – ${new Date(data.waktu_selesai).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`.replace(/\./g, ":");

    return res.status(200).json({
      id: Number(id), // ← id_riwayat
      id_user: user.userId,
      id_psikolog: data.id_psikolog,
      namaPsikolog: data.namaPsikolog,
      tanggalKonsultasi,
      jadwalKonsultasi,
      sesiKonsultasi,
      keluhan: data.keluhan,
    });
  } catch (error: unknown) {
    db.end();
    console.error("Error detail riwayat mahasiswa:", error);
    return res.status(500).json({ message: "Terjadi kesalahan internal" });
  }
}
