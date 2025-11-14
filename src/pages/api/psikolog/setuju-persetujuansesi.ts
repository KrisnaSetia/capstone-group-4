/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import base64 from "base-64";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

const CLIENT_ID = process.env.ZOOM_CLIENT_ID!;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!;
const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID!;

async function getAccessToken(): Promise<string> {
  const encoded = base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gagal ambil token: ${errorData.error_description}`);
  }

  const data = await response.json();
  return data.access_token;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id_konsultasi } = req.body;
  if (!id_konsultasi) {
    return res.status(400).json({ message: "ID konsultasi diperlukan" });
  }

  try {
    // Validasi: pastikan konsultasi milik psikolog ini dan belum diproses
    const { data: konsultasiData, error: konsultasiError } =
      (await supabaseServer
        .from("konsultasi_online")
        .select("id_jadwal")
        .eq("id_konsultasi_online", id_konsultasi)
        .eq("id_psikolog", user.userId)
        .eq("status", 1)
        .single()) as { data: any; error: any };

    if (konsultasiError || !konsultasiData) {
      return res
        .status(404)
        .json({ message: "Konsultasi tidak ditemukan atau sudah diproses" });
    }

    // Buat Zoom meeting
    const accessToken = await getAccessToken();
    const createMeetingRes = await fetch(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: "Sesi Konsultasi Online",
          type: 1,
          settings: {
            host_video: true,
            participant_video: true,
          },
        }),
      }
    );

    const meeting = await createMeetingRes.json();
    if (!createMeetingRes.ok) {
      throw new Error(meeting.message || "Gagal membuat meeting Zoom");
    }

    // Update status dan simpan Zoom URL ke database
    const { error: updateError } = await supabaseServer
      .from("konsultasi_online")
      .update({
        status: 2,
        url_join_zoom: meeting.join_url,
        url_start_zoom: meeting.start_url,
      })
      .eq("id_konsultasi_online", id_konsultasi)
      .eq("id_psikolog", user.userId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Gagal mengupdate status konsultasi");
    }

    return res
      .status(200)
      .json({ message: "Konsultasi berhasil disetujui", meeting });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error:", err.message);
      return res.status(500).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memproses persetujuan" });
  }
}
