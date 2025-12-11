/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { query as pgQuery } from "@/../db-postgresql-local.js"; // ⬇️ TAMBAHAN
import { getUserFromRequest } from "@/lib/auth";
import "dotenv/config"; // ⬇️ TAMBAHAN

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

  // ⬇️ TAMBAHAN: pilih sumber DB dari env
  const useLocal = process.env.DB_PROVIDER === "local";

  try {
    let rows: any[] = [];

    if (useLocal) {
      // ⬇️ MODE LOCAL: query ke PostgreSQL lokal dengan JOIN
      const dateStart = `${date}T00:00:00`;
      const dateEnd = `${date}T23:59:59`;

      rows = (await pgQuery(
        `
        SELECT
          ko.id_konsultasi,
          ko.status,
          j.tanggal,
          j.sesi
        FROM konsultasi_offline ko
        JOIN jadwal_offline j ON ko.id_jadwal = j.id_jadwal
        WHERE j.tanggal >= $1
          AND j.tanggal < $2
        ORDER BY j.tanggal ASC, j.sesi ASC, ko.id_konsultasi DESC
        LIMIT $3 OFFSET $4
        `,
        [dateStart, dateEnd, lim, off]
      )) as {
        id_konsultasi: number;
        status: number;
        tanggal: string;
        sesi: number;
      }[];
    } else {
      // ⬇️ MODE SUPABASE: kode asli kamu
      const { data, error } = await supabaseServer
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

      rows = (data ?? []) as any[];
    }

    // Transform data untuk match format yang diharapkan
    const data = (rows || []).map((r: any) => {
      if (useLocal) {
        // 🔹 MODE LOCAL: pakai field datar (tanggal, sesi)
        const tanggalYmd = (r.tanggal as string).split("T")[0];

        return {
          id: r.id_konsultasi,
          judul: "Konsultasi Offline : SHCC ITS",
          tanggal: tanggalYmd,
          sesiLabel: `Sesi ${r.sesi} (${getJamSesi(r.sesi).replace("-", "–")})`,
          status: mapStatusToBadge(r.status),
        };
      } else {
        // 🔹 MODE SUPABASE: pakai struktur nested jadwal_offline
        const tanggalYmd = (r.jadwal_offline.tanggal as string).split("T")[0];

        return {
          id: r.id_konsultasi,
          judul: "Konsultasi Offline : SHCC ITS",
          tanggal: tanggalYmd,
          sesiLabel: `Sesi ${r.jadwal_offline.sesi} (${getJamSesi(
            r.jadwal_offline.sesi
          ).replace("-", "–")})`,
          status: mapStatusToBadge(r.status),
        };
      }
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
