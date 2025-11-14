import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = user.userId;

  if (req.method === "GET") {
    try {
      // Ambil data dari tabel user
      const { data: userRow, error: userErr } = await supabaseServer
        .from("user")
        .select("id_user, username, email, usia, jenis_kelamin")
        .eq("id_user", userId)
        .maybeSingle();

      if (userErr) {
        console.error("Supabase error (user GET):", userErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (!userRow) {
        return res.status(404).json({ message: "Data user tidak ditemukan" });
      }

      // Ambil data psikolog
      const { data: psikologRow, error: psikologErr } = await supabaseServer
        .from("psikolog")
        .select("nomor_sertifikasi, deskripsi")
        .eq("id_psikolog", userId)
        .maybeSingle();

      if (psikologErr) {
        console.error("Supabase error (psikolog GET):", psikologErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (!psikologRow) {
        return res
          .status(404)
          .json({ message: "Data profil psikolog tidak ditemukan" });
      }

      return res.status(200).json({
        data: {
          id_user: userRow.id_user,
          username: userRow.username,
          email: userRow.email,
          usia: userRow.usia,
          jenis_kelamin: userRow.jenis_kelamin,
          nomor_sertifikasi: psikologRow.nomor_sertifikasi,
          deskripsi: psikologRow.deskripsi,
        },
      });
    } catch (err) {
      console.error("Server error (GET editprofil):", err);
      return res.status(500).json({ message: "Database error" });
    }
  } else if (req.method === "PUT") {
    const { username, jenis_kelamin, usia, deskripsi } = req.body;

    if (!username || !jenis_kelamin || !usia || !deskripsi) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
      // 1) Update tabel user
      const { error: updateUserErr } = await supabaseServer
        .from("user")
        .update({
          username,
          jenis_kelamin,
          usia: String(usia), // pastikan usia bertipe text sesuai schema
        })
        .eq("id_user", userId);

      if (updateUserErr) {
        console.error("Supabase error (update user):", updateUserErr);
        return res.status(500).json({ message: "Gagal update user" });
      }

      // 2) Update tabel psikolog
      const { error: updatePsikologErr } = await supabaseServer
        .from("psikolog")
        .update({
          deskripsi,
        })
        .eq("id_psikolog", userId);

      if (updatePsikologErr) {
        console.error("Supabase error (update psikolog):", updatePsikologErr);
        return res.status(500).json({ message: "Gagal update psikolog" });
      }

      return res.status(200).json({ message: "Update berhasil" });
    } catch (err) {
      console.error("Server error (PUT editprofil):", err);
      return res.status(500).json({ message: "Gagal commit data" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
