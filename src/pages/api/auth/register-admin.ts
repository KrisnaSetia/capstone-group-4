/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import bcrypt from "bcrypt";
import "dotenv/config";

interface RegisterAdminRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterAdminResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    roles: number; // 2 = admin
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterAdminResponse | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, email, password }: RegisterAdminRequest = req.body;

    // --- Validasi minimal ---
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, dan password harus diisi" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    // 🔹 1. Cek email sudah terdaftar atau belum
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

    // 🔹 2. Cek username sudah dipakai atau belum
    const { data: existingUsername, error: checkUsernameError } =
      await supabaseServer
        .from("user")
        .select("id_user")
        .eq("username", username)
        .maybeSingle();

    if (checkUsernameError) {
      console.error("Supabase check username error:", checkUsernameError);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingUsername) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // 🔹 3. Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error("Hashing error:", hashErr);
      return res.status(500).json({ message: "Gagal mengenkripsi password" });
    }

    // 🔹 4. Insert ke tabel user (admin)
    // Ingat: di schema kamu, usia & jenis_kelamin boleh null, roles = text.
    const { data: insertedUser, error: insertUserError } = await supabaseServer
      .from("user")
      .insert({
        username,
        email,
        password: hashedPassword,
        usia: null,
        jenis_kelamin: null,
        roles: "2", // simpan sebagai text
      })
      .select("id_user, username, email, roles")
      .single();

    if (insertUserError || !insertedUser) {
      console.error("User insert error:", insertUserError);
      return res.status(500).json({ message: "Gagal mendaftarkan admin" });
    }

    const userId = insertedUser.id_user;

    return res.status(201).json({
      message: "Registrasi admin berhasil",
      user: {
        id: userId,
        username: insertedUser.username,
        email: insertedUser.email,
        roles: 2, // dikembalikan sebagai number ke frontend
      },
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
