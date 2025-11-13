/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
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

    const validGender = ["L", "P", "Laki-laki", "Perempuan"];
    if (!validGender.includes(jenis_kelamin)) {
      return res.status(400).json({ message: "Jenis kelamin tidak valid" });
    }

    // 🔹 1. Cek email sudah terdaftar atau belum di Supabase
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

    // 🔹 2. Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.error("Hashing error:", err);
      return res.status(500).json({ message: "Gagal mengenkripsi password" });
    }

    // 🔹 3. Insert ke tabel user
    // Di schema Supabase kamu: usia & roles bertipe text, jadi kita cast ke string
    const { data: insertedUser, error: insertUserError } = await supabaseServer
      .from("user")
      .insert({
        username,
        email,
        password: hashedPassword,
        usia: String(usia),
        jenis_kelamin,
        roles: "1", // 1 = mahasiswa (disimpan sebagai text)
      })
      .select("id_user, username, email, roles")
      .single();

    if (insertUserError || !insertedUser) {
      console.error("Supabase insert user error:", insertUserError);
      return res.status(500).json({ message: "Gagal menyimpan user" });
    }

    const userId = insertedUser.id_user;

    // 🔹 4. Insert ke tabel mahasiswa (extend dari user)
    const { error: insertMahasiswaError } = await supabaseServer
      .from("mahasiswa")
      .insert({
        id_mahasiswa: userId,
        jurusan_mahasiswa: jurusan,
      });

    if (insertMahasiswaError) {
      console.error("Supabase insert mahasiswa error:", insertMahasiswaError);
      // NOTE: idealnya di sini pakai transaction & rollback user,
      // tapi supabase-js belum support transaction langsung.
      return res
        .status(500)
        .json({ message: "Gagal menyimpan data mahasiswa" });
    }

    // 🔹 5. Response sukses
    return res.status(201).json({
      message: "Registrasi mahasiswa berhasil",
      user: {
        id: userId,
        username: insertedUser.username,
        email: insertedUser.email,
        roles: 1, // kita kembalikan sebagai number
      },
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
