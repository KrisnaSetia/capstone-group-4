/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import "dotenv/config";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: number; // 0 = psikolog, 1 = mahasiswa
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

    const db = await connectDatabase();

    // Cari user berdasarkan email
    const findUser = `SELECT id_user, username, email, password, roles FROM user WHERE email = ?`;

    db.query(findUser, [email], async (error: any, results: any) => {
      db.end();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      // Cek apakah email ada
      if (results.length === 0) {
        return res.status(401).json({ message: "Email tidak ditemukan" });
      }

      const user: User = {
        id: results[0].id_user,
        username: results[0].username,
        email: results[0].email,
        password: results[0].password,
        roles: results[0].roles,
      };

      try {
        // Verifikasi password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(401).json({ message: "Password salah" });
        }

        // Buat JWT token dengan informasi user yang lebih lengkap
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
          expiresIn: "24h", // Ubah menjadi 24 jam untuk pengalaman user yang lebih baik
        });

        // Set cookie dengan konfigurasi yang aman
        const tokenCookie = serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7200, // 24 hours dalam detik
          path: "/",
        });

        // Set header untuk cookie
        res.setHeader("Set-Cookie", tokenCookie);

        // Tentukan URL redirect berdasarkan role (tanpa ID di URL)
        let redirectUrl: string;

        if (user.roles === 1) {
          // Mahasiswa (roles = 1)
          redirectUrl = `/mahasiswa/beranda`;
        } else if (user.roles === 0) {
          // Psikolog (roles = 0)
          redirectUrl = `/psikolog/beranda`;
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
          redirectUrl: redirectUrl,
        });
      } catch (bcryptError) {
        console.error("Bcrypt error:", bcryptError);
        return res
          .status(500)
          .json({ message: "Error saat verifikasi password" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
