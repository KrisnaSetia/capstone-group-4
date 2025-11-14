/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idPsikolog = req.query.id;
  if (!idPsikolog || Array.isArray(idPsikolog)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  // ===== GET: Nama Psikolog + Sesi Tersedia =====
  if (req.method === "GET") {
    const tanggal = req.query.tanggal as string;

    try {
      // Ambil nama psikolog
      const { data: psikologData, error: psikologError } = (await supabaseServer
        .from("psikolog")
        .select(
          `
          user!inner (
            username
          )
        `
        )
        .eq("id_psikolog", idPsikolog)
        .single()) as { data: any; error: any };

      if (psikologError || !psikologData) {
        return res.status(404).json({ message: "Psikolog not found" });
      }

      const namaPsikolog = psikologData.user.username;

      // Jika belum pilih tanggal
      if (!tanggal) {
        return res
          .status(200)
          .json({ data: { namaPsikolog, sesi_tersedia: [] } });
      }

      // Ambil sesi yang tersedia
      const sesiMap: Record<number, string> = {
        1: "10.00 – 10.40",
        2: "11.00 – 11.40",
        3: "12.00 – 12.40",
      };

      const { data: sesiResult, error: sesiError } = await supabaseServer
        .from("jadwal_online")
        .select("sesi")
        .eq("id_psikolog", idPsikolog)
        .gte("tanggal", `${tanggal}T00:00:00`)
        .lt("tanggal", `${tanggal}T23:59:59`)
        .eq("status", 0)
        .order("sesi", { ascending: true });

      if (sesiError) {
        console.error("Supabase error:", sesiError);
        return res
          .status(500)
          .json({ message: "Error fetching sesi konsultasi" });
      }

      const sesi_tersedia = (sesiResult || []).map(
        (row: any) => sesiMap[row.sesi] || `Sesi ${row.sesi}`
      );

      return res.status(200).json({ data: { namaPsikolog, sesi_tersedia } });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // ===== POST: Simpan Konsultasi =====
  if (req.method === "POST") {
    const { tanggal, sesi, keluhan } = req.body;
    if (!tanggal || !sesi || !keluhan) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Ubah sesi ke angka
    const sesiMap: Record<string, number> = {
      "10.00 – 10.40": 1,
      "11.00 – 11.40": 2,
      "12.00 – 12.40": 3,
    };

    const sesiNumber = sesiMap[sesi];
    if (!sesiNumber) {
      return res.status(400).json({ message: "Sesi tidak valid" });
    }

    try {
      // Cek jadwal tersedia
      const { data: jadwalData, error: jadwalError } = (await supabaseServer
        .from("jadwal_online")
        .select("id_jadwal")
        .eq("id_psikolog", idPsikolog)
        .gte("tanggal", `${tanggal}T00:00:00`)
        .lt("tanggal", `${tanggal}T23:59:59`)
        .eq("sesi", sesiNumber)
        .eq("status", 0)
        .limit(1)
        .single()) as { data: any; error: any };

      if (jadwalError || !jadwalData) {
        return res
          .status(404)
          .json({ message: "Sesi tidak ditemukan atau sudah penuh" });
      }

      const id_jadwal = jadwalData.id_jadwal;

      // Simpan ke konsultasi_online
      const { error: insertError } = await supabaseServer
        .from("konsultasi_online")
        .insert({
          id_mahasiswa: user.userId,
          id_psikolog: idPsikolog,
          id_jadwal: id_jadwal,
          keluhan: keluhan,
          status: 1,
          tanggal_pengajuan: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        return res
          .status(500)
          .json({ message: "Terjadi kesalahan saat menyimpan data" });
      }

      // Update jadwal menjadi penuh
      const { error: updateError } = await supabaseServer
        .from("jadwal_online")
        .update({ status: 1 })
        .eq("id_jadwal", id_jadwal);

      if (updateError) {
        console.error("Update error:", updateError);
        return res
          .status(500)
          .json({ message: "Terjadi kesalahan saat update jadwal" });
      }

      return res
        .status(200)
        .json({ message: "Konsultasi berhasil didaftarkan" });
    } catch (err) {
      console.error("Gagal menyimpan data konsultasi:", err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat menyimpan data" });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: "Method not allowed" });
}
