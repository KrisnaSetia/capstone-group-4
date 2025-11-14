import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = getUserFromRequest(req);
  if (!me || me.roles !== 1) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = me.userId;

  if (req.method === "GET") {
    try {
      // Ambil data dari tabel user
      const { data: userRow, error: userErr } = await supabaseServer
        .from("user")
        .select("id_user, email, username, usia, jenis_kelamin")
        .eq("id_user", userId)
        .maybeSingle();

      if (userErr) {
        console.error("Supabase error (user GET):", userErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (!userRow) {
        return res.status(404).json({ message: "Data user tidak ditemukan" });
      }

      // Ambil data mahasiswa
      const { data: mhsRow, error: mhsErr } = await supabaseServer
        .from("mahasiswa")
        .select("jurusan_mahasiswa")
        .eq("id_mahasiswa", userId)
        .maybeSingle();

      if (mhsErr) {
        console.error("Supabase error (mahasiswa GET):", mhsErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (!mhsRow) {
        return res
          .status(404)
          .json({ message: "Data profil mahasiswa tidak ditemukan" });
      }

      return res.status(200).json({
        data: {
          id_user: userRow.id_user,
          email: userRow.email,
          username: userRow.username,
          usia: userRow.usia,
          jenis_kelamin: userRow.jenis_kelamin,
          jurusan_mahasiswa: mhsRow.jurusan_mahasiswa,
        },
      });
    } catch (err) {
      console.error("Server error (GET editprofil):", err);
      return res.status(500).json({ message: "Database error" });
    }
  } else if (req.method === "PUT") {
    const { username, jenis_kelamin, usia, jurusan_mahasiswa } = req.body;

    if (!username || !jenis_kelamin || !usia || !jurusan_mahasiswa) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
      // 1) Update tabel user
      const { error: updateUserErr } = await supabaseServer
        .from("user")
        .update({
          username,
          jenis_kelamin,
          usia: String(usia), // di schema kamu usia bertipe text
        })
        .eq("id_user", userId);

      if (updateUserErr) {
        console.error("Supabase error (update user):", updateUserErr);
        return res.status(500).json({ message: "Gagal update user" });
      }

      // 2) Update tabel mahasiswa
      const { error: updateMhsErr } = await supabaseServer
        .from("mahasiswa")
        .update({
          jurusan_mahasiswa,
        })
        .eq("id_mahasiswa", userId);

      if (updateMhsErr) {
        console.error("Supabase error (update mahasiswa):", updateMhsErr);
        return res.status(500).json({ message: "Gagal update mahasiswa" });
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
