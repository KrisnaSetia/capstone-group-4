import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

type RiwayatRow = {
  id_riwayat: number;
  id_konsultasi_online: number;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  status_akhir: number;
};

type KonsultasiRow = {
  id_konsultasi_online: number;
  id_psikolog: number;
  id_mahasiswa: number;
  id_jadwal: number;
  keluhan: string | null;
  tanggal_pengajuan: string | null;
  status: number;
};

type JadwalOnlineRow = {
  id_jadwal: number;
  sesi: number;
};

type UserRow = {
  id_user: number;
  username: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const mahasiswaId = user.userId;

  try {
    // 1) Ambil semua konsultasi_online milik mahasiswa ini dengan status = 3
    const { data: konsultasiRows, error: konsultasiErr } = await supabaseServer
      .from("konsultasi_online")
      .select(
        "id_konsultasi_online, id_psikolog, id_mahasiswa, id_jadwal, keluhan, tanggal_pengajuan, status"
      )
      .eq("id_mahasiswa", mahasiswaId)
      .eq("status", 3); // sama seperti WHERE k.status = 3

    if (konsultasiErr) {
      console.error("Supabase error (konsultasi_online):", konsultasiErr);
      return res.status(500).json({ message: "Database error" });
    }

    const konsultasiList = (konsultasiRows ?? []) as KonsultasiRow[];
    if (konsultasiList.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const konsulIds = konsultasiList.map((k) => k.id_konsultasi_online);

    // 2) Ambil riwayat untuk id_konsultasi_online tersebut
    const { data: riwayatRows, error: riwayatErr } = await supabaseServer
      .from("riwayat")
      .select(
        "id_riwayat, id_konsultasi_online, waktu_mulai, waktu_selesai, status_akhir"
      )
      .in("id_konsultasi_online", konsulIds);

    if (riwayatErr) {
      console.error("Supabase error (riwayat):", riwayatErr);
      return res.status(500).json({ message: "Database error" });
    }

    const riwayatList = (riwayatRows ?? []) as RiwayatRow[];
    if (riwayatList.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // 3) Ambil nama psikolog dari user dan sesi dari jadwal_online
    const psikologIds = Array.from(
      new Set(konsultasiList.map((k) => k.id_psikolog))
    );
    const jadwalIds = Array.from(
      new Set(konsultasiList.map((k) => k.id_jadwal))
    );

    const [
      { data: userRows, error: userErr },
      { data: jadwalRows, error: jadwalErr },
    ] = await Promise.all([
      supabaseServer
        .from("user")
        .select("id_user, username")
        .in("id_user", psikologIds),
      supabaseServer
        .from("jadwal_online")
        .select("id_jadwal, sesi")
        .in("id_jadwal", jadwalIds),
    ]);

    if (userErr) {
      console.error("Supabase error (user):", userErr);
      return res.status(500).json({ message: "Database error" });
    }
    if (jadwalErr) {
      console.error("Supabase error (jadwal_online):", jadwalErr);
      return res.status(500).json({ message: "Database error" });
    }

    const userList = (userRows ?? []) as UserRow[];
    const jadwalList = (jadwalRows ?? []) as JadwalOnlineRow[];

    const userMap = new Map<number, string>();
    userList.forEach((u) => userMap.set(u.id_user, u.username));

    const jadwalMap = new Map<number, JadwalOnlineRow>();
    jadwalList.forEach((j) => jadwalMap.set(j.id_jadwal, j));

    const konsultasiMap = new Map<number, KonsultasiRow>();
    konsultasiList.forEach((k) => konsultasiMap.set(k.id_konsultasi_online, k));

    // 4) Gabungkan sesuai SELECT SQL lama
    let combined = riwayatList
      .map((r) => {
        const k = konsultasiMap.get(r.id_konsultasi_online);
        if (!k) return null;
        const jadwal = jadwalMap.get(k.id_jadwal);
        const namaPsikolog = userMap.get(k.id_psikolog) ?? null;

        return {
          id_riwayat: r.id_riwayat,
          waktu_mulai: r.waktu_mulai,
          waktu_selesai: r.waktu_selesai,
          status_akhir: r.status_akhir,
          id_konsultasi_online: k.id_konsultasi_online,
          id_psikolog: k.id_psikolog,
          namaPsikolog,
          keluhan: k.keluhan,
          tanggal_pengajuan: k.tanggal_pengajuan,
          sesi: jadwal?.sesi ?? null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // 5) Urutkan: ORDER BY r.id_riwayat DESC
    combined = combined.sort((a, b) => b.id_riwayat - a.id_riwayat);

    return res.status(200).json({ data: combined });
  } catch (error) {
    console.error("Server error (riwayat):", error);
    return res.status(500).json({ message: "Database error" });
  }
}
