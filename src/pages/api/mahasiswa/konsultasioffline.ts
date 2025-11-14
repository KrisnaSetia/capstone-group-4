import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

type KonsultasiOfflineRow = {
  id_konsultasi: number;
  status: number;
  id_jadwal: number;
};

type JadwalOfflineRow = {
  id_jadwal: number;
  tanggal: string; // ISO datetime dari Supabase
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

  if (req.method === "GET") {
    return handleGet(req, res, user.userId);
  } else if (req.method === "POST") {
    return handlePost(req, res, user.userId);
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

// 🔹 GET: list riwayat konsultasi offline mahasiswa
async function handleGet(
  _req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  try {
    // 1) Ambil semua konsultasi_offline milik user
    const { data: konsulRows, error: konsulErr } = await supabaseServer
      .from("konsultasi_offline")
      .select("id_konsultasi, status, id_jadwal")
      .eq("id_user", userId)
      .order("id_konsultasi", { ascending: false });

    if (konsulErr) {
      console.error("Supabase error (konsultasi_offline GET):", konsulErr);
      return res.status(500).json({ message: "Database error" });
    }

    const konsultasiList = (konsulRows ?? []) as KonsultasiOfflineRow[];

    if (konsultasiList.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const idJadwalList = Array.from(
      new Set(konsultasiList.map((k) => k.id_jadwal))
    );

    // 2) Ambil semua jadwal_offline yang terkait
    const { data: jadwalRows, error: jadwalErr } = await supabaseServer
      .from("jadwal_offline")
      .select("id_jadwal, tanggal, sesi")
      .in("id_jadwal", idJadwalList);

    if (jadwalErr) {
      console.error("Supabase error (jadwal_offline GET):", jadwalErr);
      return res.status(500).json({ message: "Database error" });
    }

    const jadwalList = (jadwalRows ?? []) as JadwalOfflineRow[];
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
  userId: number
) {
  const { id_jadwal, sesi, keluhan } = req.body;

  if (!id_jadwal || !sesi || !keluhan) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  try {
    // 1) Cek jadwal_offline ada dan ambil tanggal + status
    const { data: jadwalRow, error: jadwalErr } = await supabaseServer
      .from("jadwal_offline")
      .select("tanggal, status")
      .eq("id_jadwal", id_jadwal)
      .maybeSingle();

    if (jadwalErr) {
      console.error("Supabase error (cek jadwal_offline):", jadwalErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (!jadwalRow) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
    }

    const tanggal = new Date(jadwalRow.tanggal);
    const hari = tanggal.getDay(); // 0=Min,1=Sen,2=Sel,3=Rab,4=Kam,5=Jum,6=Sab

    if (jadwalRow.status === 1) {
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
    const { count: jumlah, error: countErr } = await supabaseServer
      .from("konsultasi_offline")
      .select("id_konsultasi", { count: "exact", head: true })
      .eq("id_jadwal", id_jadwal);

    if (countErr) {
      console.error("Supabase error (cek kuota):", countErr);
      return res.status(500).json({ message: "Gagal cek kuota." });
    }

    if ((jumlah ?? 0) >= 5) {
      return res.status(400).json({ message: "Kuota sesi ini sudah penuh." });
    }

    // 3) Insert konsultasi baru
    const nowIso = new Date().toISOString();

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
      return res.status(500).json({ message: "Gagal menyimpan pendaftaran." });
    }

    // 4) Cek lagi kuota akhir setelah insert
    const { count: finalCount, error: finalCountErr } = await supabaseServer
      .from("konsultasi_offline")
      .select("id_konsultasi", { count: "exact", head: true })
      .eq("id_jadwal", id_jadwal);

    if (finalCountErr) {
      console.error("Supabase error (cek kuota akhir):", finalCountErr);
      return res.status(500).json({ message: "Gagal verifikasi kuota akhir." });
    }

    if ((finalCount ?? 0) >= 5) {
      // Tutup jadwal kalau kuota sudah penuh
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
