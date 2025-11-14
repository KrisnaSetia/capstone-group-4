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

  const {
    query: { id },
  } = req;

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Query Supabase dengan multiple joins
    const { data: result, error } = (await supabaseServer
      .from("riwayat")
      .select(
        `
        waktu_mulai,
        waktu_selesai,
        konsultasi_online!inner (
          keluhan,
          id_psikolog,
          mahasiswa!inner (
            user!inner (
              username
            )
          )
        )
      `
      )
      .eq("id_riwayat", id)
      .eq("konsultasi_online.id_psikolog", user.userId)
      .single()) as { data: any; error: any };

    if (error || !result) {
      if (error?.code === "PGRST116") {
        return res.status(404).json({ message: "Riwayat tidak ditemukan" });
      }
      console.error("Supabase error:", error);
      return res.status(404).json({ message: "Riwayat tidak ditemukan" });
    }

    const hariID = new Date(result.waktu_mulai).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const sesiFormatted = `${new Date(result.waktu_mulai).toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )} – ${new Date(result.waktu_selesai).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`.replace(/\./g, ":");

    const tanggalFormatted = new Date(result.waktu_mulai)
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":");

    return res.status(200).json({
      namaMahasiswa: result.konsultasi_online.mahasiswa.user.username,
      tanggalKonsultasi: tanggalFormatted,
      jadwalKonsultasi: hariID,
      sesiKonsultasi: sesiFormatted,
      keluhan: result.konsultasi_online.keluhan,
    });
  } catch (error: unknown) {
    console.error("Error saat ambil detail riwayat psikolog:", error);
    return res.status(500).json({ message: "Terjadi kesalahan internal" });
  }
}
