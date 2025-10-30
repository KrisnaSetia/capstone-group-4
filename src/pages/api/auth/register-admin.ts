/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
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

    const db = await connectDatabase();

    // Cek email sudah terdaftar
    const checkEmailQuery = `SELECT email FROM user WHERE email = ?`;
    db.query(checkEmailQuery, [email], async (error: any, results: any) => {
      if (error) {
        db.end();
        console.error("Database error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        db.end();
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // (Opsional) cek username unik juga
      const checkUsernameQuery = `SELECT username FROM user WHERE username = ?`;
      db.query(checkUsernameQuery, [username], async (e2: any, r2: any) => {
        if (e2) {
          db.end();
          console.error("Database error:", e2);
          return res.status(500).json({ message: "Database error" });
        }

        if (r2.length > 0) {
          db.end();
          return res.status(400).json({ message: "Username sudah digunakan" });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert hanya ke tabel user
          const insertUserQuery = `
            INSERT INTO user (username, email, password, usia, jenis_kelamin, roles)
            VALUES (?, ?, ?, NULL, NULL, 2)
          `;

          db.query(
            insertUserQuery,
            [username, email, hashedPassword],
            (userErr: any, userResult: any) => {
              db.end();

              if (userErr) {
                console.error("User insert error:", userErr);
                return res
                  .status(500)
                  .json({ message: "Gagal mendaftarkan admin" });
              }

              const userId = userResult.insertId;

              return res.status(201).json({
                message: "Registrasi admin berhasil",
                user: {
                  id: userId,
                  username,
                  email,
                  roles: 2,
                },
              });
            }
          );
        } catch (hashErr) {
          db.end();
          console.error("Hashing error:", hashErr);
          return res
            .status(500)
            .json({ message: "Gagal mengenkripsi password" });
        }
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
