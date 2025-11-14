/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import "dotenv/config";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: number; // 0 = psikolog, 1 = mahasiswa, 2 = admin
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    roles: number;
  };
  redirectUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi" });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // 🔹 Cari user berdasarkan email di Supabase
    const { data, error } = await supabaseServer
      .from("user") // nama tabel di Supabase
      .select("id_user, username, email, password, roles")
      .eq("email", email)
      .maybeSingle(); // 1 row atau null

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    // Cek apakah email ada
    if (!data) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    // Di schema Supabase kamu, roles itu bertipe text, jadi kita parse ke number
    const user: User = {
      id: data.id_user,
      username: data.username,
      email: data.email,
      password: data.password,
      roles:
        typeof data.roles === "string" ? parseInt(data.roles, 10) : data.roles,
    };

    // 🔹 Verifikasi password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 🔹 Buat JWT token dengan informasi user yang lebih lengkap
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };

    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: "24h",
    });

    // Set cookie dengan konfigurasi yang aman
    const tokenCookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 jam dalam detik
      path: "/",
    });

    // Set header untuk cookie
    res.setHeader("Set-Cookie", tokenCookie);

    // 🔹 Tentukan URL redirect berdasarkan role (tanpa ID di URL)
    let redirectUrl: string;

    if (user.roles === 1) {
      // Mahasiswa (roles = 1)
      redirectUrl = `/mahasiswa/beranda`;
    } else if (user.roles === 0) {
      // Psikolog (roles = 0)
      redirectUrl = `/psikolog/beranda`;
    } else if (user.roles === 2) {
      // Admin (roles = 2)
      redirectUrl = `/admin/beranda`;
    } else {
      // Role tidak dikenali
      return res.status(400).json({ message: "Role user tidak valid" });
    }

    // Response sukses dengan informasi redirect
    return res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
