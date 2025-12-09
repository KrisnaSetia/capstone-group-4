/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js"; // Supabase cloud
import { query as pgQuery } from "@/../db-postgresql-local.js"; // PostgreSQL lokal
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

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    const useLocal = process.env.DB_PROVIDER === "local";

    let user: User | null = null;

    if (useLocal) {
      // 🔹 MODE: PostgreSQL lokal
      const rows = await pgQuery(
        `
        SELECT 
          id_user,
          username,
          email,
          password,
          roles
        FROM "users"
        WHERE email = $1
        LIMIT 1
        `,
        [email]
      );

      const row = rows[0];
      if (!row) {
        return res.status(401).json({ message: "Email tidak ditemukan" });
      }

      user = {
        id: row.id_user,
        username: row.username,
        email: row.email,
        password: row.password,
        roles:
          typeof row.roles === "string"
            ? parseInt(row.roles, 10)
            : row.roles ?? 0,
      };
    } else {
      // 🔹 MODE: Supabase
      const { data, error } = await supabaseServer
        .from("user")
        .select("id_user, username, email, password, roles")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      if (!data) {
        return res.status(401).json({ message: "Email tidak ditemukan" });
      }

      user = {
        id: data.id_user,
        username: data.username,
        email: data.email,
        password: data.password,
        roles:
          typeof data.roles === "string"
            ? parseInt(data.roles, 10)
            : data.roles ?? 0,
      };
    }

    // 🔹 Verifikasi password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password salah" });
    }

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

    const tokenCookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    res.setHeader("Set-Cookie", tokenCookie);

    let redirectUrl: string;
    if (user.roles === 1) {
      redirectUrl = `/mahasiswa/beranda`;
    } else if (user.roles === 0) {
      redirectUrl = `/psikolog/beranda`;
    } else if (user.roles === 2) {
      redirectUrl = `/admin/beranda`;
    } else {
      return res.status(400).json({ message: "Role user tidak valid" });
    }

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
