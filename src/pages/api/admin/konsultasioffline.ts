// file: src/pages/api/admin/konsultasi-offline.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";

type OfflineOrderRow = {
  id_konsultasi: number;
  tanggal_ymd: string; // hasil DATE(j.tanggal)
  sesi: number; // 1 | 2 | 3
  status: number; // 0/1/2/3 dari DB
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = getUserFromRequest(req);
  if (!me || me.roles !== 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { date, limit, offset } = req.query;
  if (!date || typeof date !== "string") {
    return res
      .status(400)
      .json({ message: "Query ?date=YYYY-MM-DD wajib diisi." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res
      .status(400)
      .json({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  const lim = Number(limit ?? 50);
  const off = Number(offset ?? 0);
  if (
    Number.isNaN(lim) ||
    Number.isNaN(off) ||
    lim < 1 ||
    lim > 200 ||
    off < 0
  ) {
    return res
      .status(400)
      .json({ message: "Parameter pagination tidak valid." });
  }

  const db = await connectDatabase();

  // Ambil langsung DATE(j.tanggal) agar jadi "YYYY-MM-DD" di MySQL (hindari masalah zona waktu)
  const sql = `
    SELECT
      ko.id_konsultasi,
      DATE(j.tanggal) AS tanggal_ymd,
      j.sesi,
      ko.status
    FROM konsultasi_offline ko
    INNER JOIN jadwal_offline j ON ko.id_jadwal = j.id_jadwal
    WHERE DATE(j.tanggal) = ?
    ORDER BY j.tanggal ASC, j.sesi ASC, ko.id_konsultasi DESC
    LIMIT ? OFFSET ?;
  `;

  db.query(sql, [date, lim, off], (err: unknown, rows: unknown) => {
    db.end();

    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const data = (rows as OfflineOrderRow[]).map((r) => ({
      id: r.id_konsultasi,
      judul: "Konsultasi Offline : SHCC ITS",
      tanggal: r.tanggal_ymd, // sudah "YYYY-MM-DD"
      sesiLabel: `Sesi ${r.sesi} (${getJamSesi(r.sesi).replace("-", "–")})`,
      status: mapStatusToBadge(r.status), // "terdaftar" | "batal"
    }));

    return res.status(200).json({
      meta: { date, count: data.length, limit: lim, offset: off },
      data, // <-- langsung array PesertaItem
    });
  });
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

/**
 * Kamu minta mapping simple:
 * 1 = terdaftar, 0 = batal
 * (Kalau ada 2=disetujui & 3=selesai, bebas kamu putuskan mau dianggap terdaftar/batal)
 */
function mapStatusToBadge(code: number): "terdaftar" | "batal" {
  if (code === 0) return "batal";
  if (code === 1) return "terdaftar";
  // opsi kebijakan:
  if (code === 2) return "terdaftar"; // disetujui -> tampil terdaftar
  if (code === 3) return "batal"; // selesai/dibatalkan -> tampil batal
  return "terdaftar";
}
