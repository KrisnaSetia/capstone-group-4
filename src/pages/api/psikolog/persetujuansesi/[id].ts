import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

interface DetailSesiRow {
  id_konsultasi_online: number;
  namaMahasiswa: string;
  tanggal_pengajuan: string;
  tanggal: string;
  sesi: number;
  keluhan: string;
  status: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  const db = await connectDatabase();

  const query = `
    SELECT 
      ko.id_konsultasi_online,
      u.username AS namaMahasiswa,
      ko.tanggal_pengajuan,
      j.tanggal,
      j.sesi,
      ko.keluhan,
      ko.status
    FROM konsultasi_online ko
    JOIN mahasiswa m ON ko.id_mahasiswa = m.id_mahasiswa
    JOIN user u ON m.id_mahasiswa = u.id_user
    JOIN jadwal_online j ON ko.id_jadwal = j.id_jadwal
    WHERE ko.id_konsultasi_online = ? AND ko.id_psikolog = ? AND ko.status = 1
  `;

  db.query(query, [id, user.userId], (err, results) => {
    db.end();

    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const row = (results as DetailSesiRow[])[0];
    if (!row) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 - 10.40)",
      2: "Sesi 2 (11.00 - 11.40)",
      3: "Sesi 3 (12.00 - 12.40)",
    };
    const tanggalKonsul = new Date(row.tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const tanggalPengajuan = new Date(row.tanggal_pengajuan).toLocaleString(
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

    return res.status(200).json({
      id: row.id_konsultasi_online.toString(),
      namaMahasiswa: row.namaMahasiswa,
      tanggalPengajuan,
      jadwalKonsultasi: tanggalKonsul,
      sesiKonsultasi: sesiMap[row.sesi] || `Sesi ${row.sesi}`,
      keluhan: row.keluhan,
      status: row.status,
    });
  });
}
