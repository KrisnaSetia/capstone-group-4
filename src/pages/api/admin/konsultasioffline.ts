/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

// type OfflineOrderRow = {
//   id_konsultasi: number;
//   tanggal_ymd: string; // hasil DATE(j.tanggal)
//   sesi: number; // 1 | 2 | 3
//   status: number; // 0/1/2/3 dari DB
// };

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

  try {
    // Query Supabase dengan join dan filter
    const { data: rows, error } = await supabaseServer
      .from("konsultasi_offline")
      .select(
        `
        id_konsultasi,
        status,
        jadwal_offline!inner (
          tanggal,
          sesi
        )
      `
      )
      .gte("jadwal_offline.tanggal", `${date}T00:00:00`)
      .lt("jadwal_offline.tanggal", `${date}T23:59:59`)
      .order("jadwal_offline(tanggal)", { ascending: true })
      .order("jadwal_offline(sesi)", { ascending: true })
      .order("id_konsultasi", { ascending: false })
      .range(off, off + lim - 1);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    // Transform data untuk match dengan format yang diharapkan
    const data = (rows || []).map((r: any) => {
      // Extract tanggal dari timestamp dan convert ke YYYY-MM-DD
      const tanggalYmd = r.jadwal_offline.tanggal.split("T")[0];

      return {
        id: r.id_konsultasi,
        judul: "Konsultasi Offline : SHCC ITS",
        tanggal: tanggalYmd,
        sesiLabel: `Sesi ${r.jadwal_offline.sesi} (${getJamSesi(
          r.jadwal_offline.sesi
        ).replace("-", "–")})`,
        status: mapStatusToBadge(r.status),
      };
    });

    return res.status(200).json({
      meta: { date, count: data.length, limit: lim, offset: off },
      data,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Server error" });
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
