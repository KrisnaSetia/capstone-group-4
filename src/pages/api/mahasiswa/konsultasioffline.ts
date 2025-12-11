/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { query as pgQuery } from "@/../db-postgresql-local.js"; // ⬇️ TAMBAHAN: koneksi PostgreSQL lokal
import { getUserFromRequest } from "@/lib/auth";

type KonsultasiOfflineRow = {
  id_konsultasi: number;
  status: number;
  id_jadwal: number;
};

type JadwalOfflineRow = {
  id_jadwal: number;
  tanggal: string; // ISO datetime dari DB
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

  // ⬇️ TAMBAHAN: baca mode DB dari env
  const useLocal = process.env.DB_PROVIDER === "local";

  if (req.method === "GET") {
    return handleGet(req, res, user.userId, useLocal);
  } else if (req.method === "POST") {
    return handlePost(req, res, user.userId, useLocal);
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

// 🔹 GET: list riwayat konsultasi offline mahasiswa
async function handleGet(
  _req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  useLocal: boolean // ⬇️ TAMBAHAN: param mode DB
) {
  try {
    let konsultasiList: KonsultasiOfflineRow[] = [];

    if (useLocal) {
      // ⬇️ MODE LOCAL: ambil dari PostgreSQL lokal
      const rows = (await pgQuery(
        `
        SELECT 
          id_konsultasi,
          status,
          id_jadwal
        FROM konsultasi_offline
        WHERE id_user = $1
        ORDER BY id_konsultasi DESC
        `,
        [userId]
      )) as KonsultasiOfflineRow[];
      konsultasiList = rows;
    } else {
      // ⬇️ MODE SUPABASE: kode lama
      const { data: konsulRows, error: konsulErr } = await supabaseServer
        .from("konsultasi_offline")
        .select("id_konsultasi, status, id_jadwal")
        .eq("id_user", userId)
        .order("id_konsultasi", { ascending: false });

      if (konsulErr) {
        console.error("Supabase error (konsultasi_offline GET):", konsulErr);
        return res.status(500).json({ message: "Database error" });
      }

      konsultasiList = (konsulRows ?? []) as KonsultasiOfflineRow[];
    }

    if (konsultasiList.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const idJadwalList = Array.from(
      new Set(konsultasiList.map((k) => k.id_jadwal))
    );

    let jadwalList: JadwalOfflineRow[] = [];

    if (useLocal) {
      // ⬇️ MODE LOCAL: ambil jadwal offline via SQL IN
      const placeholders = idJadwalList
        .map((_, idx) => `$${idx + 1}`)
        .join(", ");

      const rows = (await pgQuery(
        `
        SELECT 
          id_jadwal,
          tanggal,
          sesi
        FROM jadwal_offline
        WHERE id_jadwal IN (${placeholders})
        `,
        idJadwalList
      )) as JadwalOfflineRow[];

      jadwalList = rows;
    } else {
      // ⬇️ MODE SUPABASE
      const { data: jadwalRows, error: jadwalErr } = await supabaseServer
        .from("jadwal_offline")
        .select("id_jadwal, tanggal, sesi")
        .in("id_jadwal", idJadwalList);

      if (jadwalErr) {
        console.error("Supabase error (jadwal_offline GET):", jadwalErr);
        return res.status(500).json({ message: "Database error" });
      }

      jadwalList = (jadwalRows ?? []) as JadwalOfflineRow[];
    }

    const jadwalMap = new Map<number, JadwalOfflineRow>();
    for (const j of jadwalList) {
      jadwalMap.set(j.id_jadwal, j);
    }

    const formatted = konsultasiList
      .map((item) => {
        const jadwal = jadwalMap.get(item.id_jadwal);
        if (!jadwal) return null;

        return {
          id_konsultasi: item.id_konsultasi,
          status: item.status,
          tanggal: jadwal.tanggal, // biarkan ISO, frontend bisa format
          sesi: jadwal.sesi,
          jam: getJamSesi(jadwal.sesi),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return res.status(200).json({ data: formatted });
  } catch (err) {
    console.error("Server error (GET konsultasi offline):", err);
    return res.status(500).json({ message: "Database error" });
  }
}

// 🔹 POST: daftar konsultasi offline baru
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  useLocal: boolean // ⬇️ TAMBAHAN: param mode DB
) {
  const { id_jadwal, sesi, keluhan } = req.body;

  if (!id_jadwal || !sesi || !keluhan) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  try {
    // 1) Cek jadwal_offline ada dan ambil tanggal + status
    let jadwalRow: { tanggal: string; status: any } | null = null;

    if (useLocal) {
      // ⬇️ MODE LOCAL
      const rows = (await pgQuery(
        `
        SELECT tanggal, status
        FROM jadwal_offline
        WHERE id_jadwal = $1
        LIMIT 1
        `,
        [id_jadwal]
      )) as { tanggal: string; status: any }[];
      jadwalRow = rows[0] ?? null;
    } else {
      // ⬇️ MODE SUPABASE
      const { data, error: jadwalErr } = await supabaseServer
        .from("jadwal_offline")
        .select("tanggal, status")
        .eq("id_jadwal", id_jadwal)
        .maybeSingle();

      if (jadwalErr) {
        console.error("Supabase error (cek jadwal_offline):", jadwalErr);
        return res.status(500).json({ message: "Database error" });
      }

      jadwalRow = data;
    }

    if (!jadwalRow) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
    }

    const tanggal = new Date(jadwalRow.tanggal);
    const hari = tanggal.getDay(); // 0=Min,1=Sen,2=Sel,3=Rab,4=Kam,5=Jum,6=Sab

    // status di schema bertipe text, jadi amankan pakai Number()
    if (Number(jadwalRow.status) === 1) {
      return res.status(400).json({
        message: "Sesi ini sudah penuh. Silakan pilih jadwal lain.",
      });
    }

    // Hanya Selasa (2) dan Kamis (4)
    if (hari !== 2 && hari !== 4) {
      return res
        .status(400)
        .json({ message: "Konsultasi hanya hari Selasa dan Kamis." });
    }

    if (![1, 2, 3].includes(Number(sesi))) {
      return res.status(400).json({ message: "Sesi tidak valid." });
    }

    // 2) Cek jumlah peserta di jadwal ini
    let jumlah = 0;

    if (useLocal) {
      // ⬇️ MODE LOCAL
      const rows = (await pgQuery(
        `
        SELECT COUNT(*)::text AS count
        FROM konsultasi_offline
        WHERE id_jadwal = $1
        `,
        [id_jadwal]
      )) as { count: string }[];
      jumlah = rows.length > 0 ? Number(rows[0].count) : 0;
    } else {
      // ⬇️ MODE SUPABASE
      const { count, error: countErr } = await supabaseServer
        .from("konsultasi_offline")
        .select("id_konsultasi", { count: "exact", head: true })
        .eq("id_jadwal", id_jadwal);

      if (countErr) {
        console.error("Supabase error (cek kuota):", countErr);
        return res.status(500).json({ message: "Gagal cek kuota." });
      }

      jumlah = count ?? 0;
    }

    if (jumlah >= 5) {
      return res.status(400).json({ message: "Kuota sesi ini sudah penuh." });
    }

    // 3) Insert konsultasi baru
    const nowIso = new Date().toISOString();

    if (useLocal) {
      // ⬇️ MODE LOCAL
      try {
        await pgQuery(
          `
          INSERT INTO konsultasi_offline (id_user, id_jadwal, keluhan, tanggal_pengajuan, status)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [userId, id_jadwal, keluhan, nowIso, 1]
        );
      } catch (err) {
        console.error("PostgreSQL error (insert konsultasi_offline):", err);
        return res
          .status(500)
          .json({ message: "Gagal menyimpan pendaftaran." });
      }
    } else {
      // ⬇️ MODE SUPABASE
      const { error: insertErr } = await supabaseServer
        .from("konsultasi_offline")
        .insert({
          id_user: userId,
          id_jadwal,
          keluhan,
          tanggal_pengajuan: nowIso,
          status: 1, // terdaftar
        });

      if (insertErr) {
        console.error("Supabase error (insert konsultasi_offline):", insertErr);
        return res
          .status(500)
          .json({ message: "Gagal menyimpan pendaftaran." });
      }
    }

    // 4) Cek lagi kuota akhir setelah insert
    let finalCount = 0;

    if (useLocal) {
      // ⬇️ MODE LOCAL
      const rows = (await pgQuery(
        `
        SELECT COUNT(*)::text AS count
        FROM konsultasi_offline
        WHERE id_jadwal = $1
        `,
        [id_jadwal]
      )) as { count: string }[];
      finalCount = rows.length > 0 ? Number(rows[0].count) : 0;
    } else {
      // ⬇️ MODE SUPABASE
      const { count, error: finalCountErr } = await supabaseServer
        .from("konsultasi_offline")
        .select("id_konsultasi", { count: "exact", head: true })
        .eq("id_jadwal", id_jadwal);

      if (finalCountErr) {
        console.error("Supabase error (cek kuota akhir):", finalCountErr);
        return res
          .status(500)
          .json({ message: "Gagal verifikasi kuota akhir." });
      }

      finalCount = count ?? 0;
    }

    if (finalCount >= 5) {
      // Tutup jadwal kalau kuota sudah penuh
      if (useLocal) {
        // ⬇️ MODE LOCAL
        try {
          await pgQuery(
            `
            UPDATE jadwal_offline
            SET status = $1
            WHERE id_jadwal = $2
            `,
            ["1", id_jadwal] // status text, pakai "1"
          );
        } catch (err) {
          console.error("PostgreSQL error (update jadwal_offline):", err);
          return res.status(200).json({
            message:
              "Pendaftaran berhasil, tetapi gagal memperbarui status jadwal.",
          });
        }
      } else {
        // ⬇️ MODE SUPABASE
        const { error: updateErr } = await supabaseServer
          .from("jadwal_offline")
          .update({ status: 1 }) // 1 = penuh
          .eq("id_jadwal", id_jadwal);

        if (updateErr) {
          console.error("Supabase error (update jadwal_offline):", updateErr);
          // tetap anggap daftar berhasil, hanya gagal update flag penuh
          return res.status(200).json({
            message:
              "Pendaftaran berhasil, tetapi gagal memperbarui status jadwal.",
          });
        }
      }

      return res.status(200).json({
        message: "Pendaftaran berhasil dan jadwal sudah ditutup.",
      });
    }

    return res.status(200).json({ message: "Pendaftaran berhasil." });
  } catch (err) {
    console.error("Server error (POST konsultasi offline):", err);
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
