/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { query as pgQuery } from "@/../db-postgresql-local.js"; // ⬇️ TAMBAHAN: import koneksi lokal
import bcrypt from "bcrypt";
import "dotenv/config";

interface RegisterMahasiswaRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  usia: number;
  jenis_kelamin: string;
  jurusan: string;
}

interface RegisterMahasiswaResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    roles: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterMahasiswaResponse | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      usia,
      jenis_kelamin,
      jurusan,
    }: RegisterMahasiswaRequest = req.body;

    // ⬇️ TAMBAHAN: baca mode DB dari env
    const useLocal = process.env.DB_PROVIDER === "local";

    // 🔹 Validasi basic
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !usia ||
      !jenis_kelamin ||
      !jurusan
    ) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    if (email.endsWith("@psikolog.com")) {
      return res.status(400).json({
        message:
          "Gunakan email lain selain @psikolog.com untuk mendaftar sebagai mahasiswa",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password dan konfirmasi tidak cocok" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    if (usia < 18) {
      return res.status(400).json({ message: "Usia harus diatas 18 tahun" });
    }

    // 🔁 Normalisasi & validasi gender
    const rawGender = (jenis_kelamin || "").trim().toLowerCase();
    let genderForDb: "L" | "P";

    if (
      rawGender === "l" ||
      rawGender === "laki-laki" ||
      rawGender === "laki laki"
    ) {
      genderForDb = "L";
    } else if (rawGender === "p" || rawGender === "perempuan") {
      genderForDb = "P";
    } else {
      return res.status(400).json({ message: "Jenis kelamin tidak valid" });
    }

    // 🔹 1. Cek email sudah terdaftar atau belum
    //    —> dibagi dua: mode local vs supabase
    if (useLocal) {
      // ⬇️ MODE LOCAL: PostgreSQL lokal
      const rows = await pgQuery(
        `
        SELECT id_user
        FROM "users"
        WHERE email = $1
        LIMIT 1
        `,
        [email]
      );

      if (rows.length > 0) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }
    } else {
      // ⬇️ MODE SUPABASE (seperti sebelumnya)
      const { data: existingUser, error: checkError } = await supabaseServer
        .from("user")
        .select("id_user")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        console.error("Supabase check email error:", checkError);
        return res.status(500).json({ message: "Database error" });
      }

      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }
    }

    // 🔹 2. Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.error("Hashing error:", err);
      return res.status(500).json({ message: "Gagal mengenkripsi password" });
    }

    // 🔹 3. Insert ke tabel user
    let userId: number;
    let returnedUser: { username: string; email: string; roles: number };

    if (useLocal) {
      // ⬇️ MODE LOCAL: insert ke PostgreSQL lokal
      const rows = await pgQuery(
        `
        INSERT INTO "users" (username, email, password, usia, jenis_kelamin, roles)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_user, username, email, roles
        `,
        [username, email, hashedPassword, String(usia), genderForDb, "1"] // roles "1" = mahasiswa
      );

      const row = rows[0];
      if (!row) {
        console.error("Insert user lokal gagal, row kosong");
        return res.status(500).json({ message: "Gagal menyimpan user" });
      }

      userId = row.id_user;
      returnedUser = {
        username: row.username,
        email: row.email,
        roles:
          typeof row.roles === "string"
            ? parseInt(row.roles, 10)
            : row.roles ?? 1,
      };
    } else {
      // ⬇️ MODE SUPABASE: seperti kode lama
      const { data: insertedUser, error: insertUserError } =
        await supabaseServer
          .from("user")
          .insert({
            username,
            email,
            password: hashedPassword,
            usia: String(usia),
            jenis_kelamin: genderForDb, // ⬅️ hanya "L" atau "P" yang disimpan
            roles: "1", // 1 = mahasiswa (disimpan sebagai text)
          })
          .select("id_user, username, email, roles")
          .single();

      if (insertUserError || !insertedUser) {
        console.error("Supabase insert user error:", insertUserError);
        return res.status(500).json({ message: "Gagal menyimpan user" });
      }

      userId = insertedUser.id_user;
      returnedUser = {
        username: insertedUser.username,
        email: insertedUser.email,
        roles:
          typeof insertedUser.roles === "string"
            ? parseInt(insertedUser.roles, 10)
            : insertedUser.roles ?? 1,
      };
    }

    // 🔹 4. Insert ke tabel mahasiswa
    if (useLocal) {
      // ⬇️ MODE LOCAL
      try {
        await pgQuery(
          `
          INSERT INTO mahasiswa (id_mahasiswa, jurusan_mahasiswa)
          VALUES ($1, $2)
          `,
          [userId, jurusan]
        );
      } catch (err) {
        console.error("Insert mahasiswa lokal error:", err);
        return res
          .status(500)
          .json({ message: "Gagal menyimpan data mahasiswa" });
      }
    } else {
      // ⬇️ MODE SUPABASE
      const { error: insertMahasiswaError } = await supabaseServer
        .from("mahasiswa")
        .insert({
          id_mahasiswa: userId,
          jurusan_mahasiswa: jurusan,
        });

      if (insertMahasiswaError) {
        console.error("Supabase insert mahasiswa error:", insertMahasiswaError);
        return res
          .status(500)
          .json({ message: "Gagal menyimpan data mahasiswa" });
      }
    }

    // 🔹 5. Response sukses
    return res.status(201).json({
      message: "Registrasi mahasiswa berhasil",
      user: {
        id: Number(userId),
        username: returnedUser.username,
        email: returnedUser.email,
        roles: 1, // dikembalikan sebagai number
      },
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
