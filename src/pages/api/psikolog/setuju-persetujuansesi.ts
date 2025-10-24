import type { NextApiRequest, NextApiResponse } from "next";
import base64 from "base-64";
import { connectDatabase } from "@/../db";
import { getUserFromRequest } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

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

  const db = await connectDatabase();

  try {
    // Validasi: pastikan konsultasi milik psikolog ini dan belum diproses
    const result: RowDataPacket[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id_jadwal FROM konsultasi_online
         WHERE id_konsultasi_online = ? AND id_psikolog = ? AND status = 1`,
        [id_konsultasi, user.userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as RowDataPacket[]);
        }
      );
    });

    if (result.length === 0) {
      db.end();
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
    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE konsultasi_online
         SET status = 2, url_join_zoom = ?, url_start_zoom = ?
         WHERE id_konsultasi_online = ? AND id_psikolog = ?`,
        [meeting.join_url, meeting.start_url, id_konsultasi, user.userId],
        (err) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });

    db.end();
    return res
      .status(200)
      .json({ message: "Konsultasi berhasil disetujui", meeting });
  } catch (err: unknown) {
    db.end();
    if (err instanceof Error) {
      console.error("Error:", err.message);
      return res.status(500).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memproses persetujuan" });
  }
}
