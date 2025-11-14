/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import bcrypt from "bcrypt";
import "dotenv/config";

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  usia: number;
  jenis_kelamin: string;
  nomor_sertifikasi: string;
  kuota_harian: number;
  rating: number;
  deskripsi: string;
  url_foto?: string;
}

interface RegisterResponse {
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
  res: NextApiResponse<RegisterResponse | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      username,
      email,
      password,
      usia,
      jenis_kelamin,
      nomor_sertifikasi,
      kuota_harian,
      rating,
      deskripsi,
      url_foto = "",
    }: RegisterRequest = req.body;

    // 🔹 Validasi basic
    if (
      !username ||
      !email ||
      !password ||
      !usia ||
      !jenis_kelamin ||
      !nomor_sertifikasi
    ) {
      return res.status(400).json({
        message:
          "Username, email, password, usia, jenis kelamin, dan nomor sertifikasi harus diisi",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    if (usia < 18 || usia > 100) {
      return res
        .status(400)
        .json({ message: "Usia harus antara 18-100 tahun" });
    }

    if (!["L", "P", "Laki-laki", "Perempuan"].includes(jenis_kelamin)) {
      return res.status(400).json({
        message: "Jenis kelamin harus L/P atau Laki-laki/Perempuan",
      });
    }

    const finalKuotaHarian = kuota_harian || 10;
    const finalRating = rating || 0;

    // 🔹 1. Cek email sudah terdaftar di user
    const { data: existingEmail, error: checkEmailError } = await supabaseServer
      .from("user")
      .select("id_user")
      .eq("email", email)
      .maybeSingle();

    if (checkEmailError) {
      console.error("Supabase check email error:", checkEmailError);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // 🔹 2. Cek nomor sertifikasi unik di psikolog
    const { data: existingSertif, error: checkSertifError } =
      await supabaseServer
        .from("psikolog")
        .select("id_psikolog")
        .eq("nomor_sertifikasi", nomor_sertifikasi)
        .maybeSingle();

    if (checkSertifError) {
      console.error("Supabase check sertifikasi error:", checkSertifError);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingSertif) {
      return res
        .status(400)
        .json({ message: "Nomor sertifikasi sudah terdaftar" });
    }

    // 🔹 3. Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error("Hashing error:", hashErr);
      return res.status(500).json({ message: "Gagal mengenkripsi password" });
    }

    // 🔹 4. Insert ke tabel user (roles = 0 = psikolog)
    // di schema kamu: usia & roles = text, jadi kita simpan sebagai string
    const { data: insertedUser, error: insertUserError } = await supabaseServer
      .from("user")
      .insert({
        username,
        email,
        password: hashedPassword,
        usia: String(usia),
        jenis_kelamin,
        roles: "0",
      })
      .select("id_user, username, email, roles")
      .single();

    if (insertUserError || !insertedUser) {
      console.error("User insert error:", insertUserError);
      return res.status(500).json({ message: "Gagal mendaftarkan user" });
    }

    const userId = insertedUser.id_user;

    // 🔹 5. Insert ke tabel psikolog
    const { error: insertPsikologError } = await supabaseServer
      .from("psikolog")
      .insert({
        id_psikolog: userId,
        nomor_sertifikasi,
        kuota_harian: finalKuotaHarian,
        rating: finalRating,
        deskripsi: deskripsi || "",
        url_foto,
      });

    if (insertPsikologError) {
      console.error("Psikolog insert error:", insertPsikologError);
      // idealnya rollback user, tapi belum ada transaction di supabase-js
      return res.status(500).json({ message: "Gagal mendaftarkan psikolog" });
    }

    // 🔹 6. Response sukses
    return res.status(201).json({
      message: "Registrasi psikolog berhasil",
      user: {
        id: userId,
        username: insertedUser.username,
        email: insertedUser.email,
        roles: 0,
      },
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
