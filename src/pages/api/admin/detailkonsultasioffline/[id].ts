import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

type DetailPesanan = {
  id: number;
  namaPsikolog: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  lokasi: string;
  keluhan: string;
  status: "Terdaftar" | "Menunggu" | "Ditolak";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validasi user adalah admin (role = 2)
  const me = getUserFromRequest(req);
  if (!me || me.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const db = await connectDatabase();

  try {
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          ko.id_konsultasi,
          ko.keluhan,
          ko.status,
          ko.tanggal_pengajuan,
          j.tanggal AS jadwal_tanggal,
          j.sesi,
          u.username AS nama_mahasiswa
        FROM konsultasi_offline ko
        INNER JOIN jadwal_offline j ON ko.id_jadwal = j.id_jadwal
        INNER JOIN user u ON ko.id_user = u.id_user
        WHERE ko.id_konsultasi = ?`,
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    db.end();

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
    }

    const row = result[0];

    // Mapping status dari database
    const statusMap: Record<number, "Terdaftar" | "Menunggu" | "Ditolak"> = {
      0: "Ditolak",
      1: "Terdaftar",
      2: "Terdaftar",
      3: "Ditolak",
    };

    // Mapping sesi
    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 – 11.30)",
      2: "Sesi 2 (12.00 – 13.30)",
      3: "Sesi 3 (14.00 – 15.30)",
    };

    // Format tanggal pengajuan
    const tanggalPengajuan = new Date(row.tanggal_pengajuan).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Format jadwal konsultasi
    const jadwalKonsultasi = new Date(row.jadwal_tanggal).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    const detailData: DetailPesanan = {
      id: row.id_konsultasi,
      namaPsikolog: "SHCC ITS",
      tanggalPengajuan: tanggalPengajuan,
      jadwalKonsultasi: jadwalKonsultasi,
      sesiKonsultasi: sesiMap[row.sesi] || "Sesi tidak diketahui",
      lokasi: "Lantai 2 Kantin Pusat ITS",
      keluhan: row.keluhan,
      status: statusMap[row.status] || "Menunggu",
    };

    return res.status(200).json(detailData);
  } catch (err) {
    console.error("Database error:", err);
    db.end();
    return res.status(500).json({ message: "Database error" });
  }
}