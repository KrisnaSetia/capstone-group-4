/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
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

    const db = await connectDatabase();

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

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = `
          INSERT INTO user (username, email, password, usia, jenis_kelamin, roles)
          VALUES (?, ?, ?, ?, ?, 1)
        `;

        db.query(
          insertUserQuery,
          [username, email, hashedPassword, usia, jenis_kelamin],
          (userError: any, userResults: any) => {
            if (userError) {
              db.end();
              console.error("Database error:", userError);
              return res.status(500).json({ message: "Gagal menyimpan user" });
            }

            const userId = userResults.insertId;
            const insertMahasiswaQuery = `
              INSERT INTO mahasiswa (id_mahasiswa, jurusan_mahasiswa)
              VALUES (?, ?)
            `;

            db.query(
              insertMahasiswaQuery,
              [userId, jurusan],
              (mhsError: any) => {
                db.end();

                if (mhsError) {
                  console.error("Database error:", mhsError);
                  return res
                    .status(500)
                    .json({ message: "Gagal menyimpan data mahasiswa" });
                }

                return res.status(201).json({
                  message: "Registrasi mahasiswa berhasil",
                  user: {
                    id: userId,
                    username,
                    email,
                    roles: 1,
                  },
                });
              }
            );
          }
        );
      } catch (err) {
        db.end();
        console.error("Hashing error:", err);
        return res.status(500).json({ message: "Gagal mengenkripsi password" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
