/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

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

  try {
    // Query Supabase dengan multiple joins
    const { data: result, error } = await supabaseServer
      .from("konsultasi_online")
      .select(
        `
        id_konsultasi_online,
        status,
        jadwal_online!inner (
          tanggal,
          sesi
        ),
        psikolog!inner (
          user!inner (
            username
          )
        )
      `
      )
      .eq("id_mahasiswa", user.userId)
      .neq("status", 3)
      .order("id_konsultasi_online", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengambil data" });
    }

    const sesiMap: Record<number, string> = {
      1: "Sesi 1 (10.00 - 10.40)",
      2: "Sesi 2 (11.00 - 11.40)",
      3: "Sesi 3 (12.00 - 12.40)",
    };

    const statusMap: Record<number, "menunggu" | "disetujui" | "ditolak"> = {
      1: "menunggu",
      2: "disetujui",
      0: "ditolak",
    };

    // Format tanggal ke format "dd Month yyyy" (Indonesia)
    const formatTanggal = (isoDate: string): string => {
      const date = new Date(isoDate);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    const data = (result || []).map((row: any) => ({
      id: row.id_konsultasi_online.toString(),
      namaPsikolog: row.psikolog.user.username,
      tanggal: formatTanggal(row.jadwal_online.tanggal),
      sesi: sesiMap[row.jadwal_online.sesi] || `Sesi ${row.jadwal_online.sesi}`,
      status: statusMap[row.status] || "menunggu",
    }));

    return res.status(200).json({ data });
  } catch (err) {
    console.error("Gagal mengambil data konsultasi:", err);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data" });
  }
}
