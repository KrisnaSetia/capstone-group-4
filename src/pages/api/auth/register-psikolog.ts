/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { connectDatabase } from "@/../db";
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
  url_foto?: string; // ✅ Tambahkan ini
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
      url_foto = "", // ✅ Default kosong
    }: RegisterRequest = req.body;

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
      return res
        .status(400)
        .json({ message: "Jenis kelamin harus L/P atau Laki-laki/Perempuan" });
    }

    const finalKuotaHarian = kuota_harian || 10;
    const finalRating = rating || 0;

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

      const checkSertifikasiQuery = `SELECT nomor_sertifikasi FROM psikolog WHERE nomor_sertifikasi = ?`;
      db.query(
        checkSertifikasiQuery,
        [nomor_sertifikasi],
        async (err2: any, results2: any) => {
          if (err2) {
            db.end();
            console.error("Database error:", err2);
            return res.status(500).json({ message: "Database error" });
          }

          if (results2.length > 0) {
            db.end();
            return res
              .status(400)
              .json({ message: "Nomor sertifikasi sudah terdaftar" });
          }

          try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertUserQuery = `
            INSERT INTO user (username, email, password, usia, jenis_kelamin, roles) 
            VALUES (?, ?, ?, ?, ?, 0)
          `;

            db.query(
              insertUserQuery,
              [username, email, hashedPassword, usia, jenis_kelamin],
              (userErr: any, userResult: any) => {
                if (userErr) {
                  db.end();
                  console.error("User insert error:", userErr);
                  return res
                    .status(500)
                    .json({ message: "Gagal mendaftarkan user" });
                }

                const userId = userResult.insertId;

                const insertPsikologQuery = `
                INSERT INTO psikolog 
                (id_psikolog, nomor_sertifikasi, kuota_harian, rating, deskripsi, url_foto)
                VALUES (?, ?, ?, ?, ?, ?)
              `;

                db.query(
                  insertPsikologQuery,
                  [
                    userId,
                    nomor_sertifikasi,
                    finalKuotaHarian,
                    finalRating,
                    deskripsi || "",
                    url_foto,
                  ],
                  (psiErr: any) => {
                    db.end();

                    if (psiErr) {
                      console.error("Psikolog insert error:", psiErr);
                      return res
                        .status(500)
                        .json({ message: "Gagal mendaftarkan psikolog" });
                    }

                    return res.status(201).json({
                      message: "Registrasi psikolog berhasil",
                      user: {
                        id: userId,
                        username,
                        email,
                        roles: 0,
                      },
                    });
                  }
                );
              }
            );
          } catch (hashErr) {
            db.end();
            console.error("Hashing error:", hashErr);
            return res
              .status(500)
              .json({ message: "Gagal mengenkripsi password" });
          }
        }
      );
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
