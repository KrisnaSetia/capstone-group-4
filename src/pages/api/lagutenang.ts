  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { NextApiRequest, NextApiResponse } from "next";
  import { supabaseServer } from "@/../db-supabase.js";
  import { query as pgQuery } from "@/../db-postgresql-local.js"; // ⬇️ TAMBAHAN: koneksi PostgreSQL lokal
  import "dotenv/config";

  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    // ⬇️ TAMBAHAN: pilih sumber DB dari env
    const useLocal = process.env.DB_PROVIDER === "local";

    if (req.method === "POST") {
      const { judul_lagu, artis, durasi, file_url, url_foto } = req.body;

      if (!judul_lagu || !artis || !durasi || !file_url || !url_foto) {
        return res.status(400).json({ message: "Field tidak boleh kosong" });
      }

      try {
        let insertedId: number | null = null;

        if (useLocal) {
          // ⬇️ MODE LOCAL: insert ke PostgreSQL lokal
          const rows = (await pgQuery(
            `
            INSERT INTO lagu_tenang (judul_lagu, artis, durasi, file_url, url_foto)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_lagu
            `,
            [judul_lagu, artis, durasi, file_url, url_foto]
          )) as { id_lagu: number }[];

          insertedId = rows[0]?.id_lagu ?? null;
        } else {
          // ⬇️ MODE SUPABASE: kode lama
          const { data, error } = await supabaseServer
            .from("lagu_tenang")
            .insert({
              judul_lagu,
              artis,
              durasi,
              file_url,
              url_foto,
            })
            .select("id_lagu")
            .maybeSingle();

          if (error) {
            console.error("Supabase Insert Error:", error);
            return res.status(500).json({ message: "Database error" });
          }

          insertedId = data?.id_lagu ?? null;
        }

        return res.status(201).json({
          message: "Lagu berhasil ditambahkan",
          insertedId,
        });
      } catch (err) {
        console.error("Connection/Error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
    } else if (req.method === "GET") {
      try {
        let rows: any[] = [];

        if (useLocal) {
          // ⬇️ MODE LOCAL: ambil data dari PostgreSQL
          rows = (await pgQuery(
            `
            SELECT id_lagu, judul_lagu, file_url, url_foto
            FROM lagu_tenang
            ORDER BY id_lagu ASC
            `
          )) as {
            id_lagu: number;
            judul_lagu: string;
            file_url: string;
            url_foto: string;
          }[];
        } else {
          // ⬇️ MODE SUPABASE: kode lama
          const { data, error } = await supabaseServer
            .from("lagu_tenang")
            .select("id_lagu, judul_lagu, file_url, url_foto")
            .order("id_lagu", { ascending: true });

          if (error) {
            console.error("Supabase Query Error:", error);
            return res.status(500).json({ message: "Database error" });
          }

          rows = (data ?? []) as any[];
        }

        const mapped =
          (rows ?? []).map((row: any) => ({
            id: Number(row.id_lagu),
            judul: row.judul_lagu,
            file: row.file_url,
            cover: row.url_foto,
          })) ?? [];

        return res.status(200).json({ data: mapped });
      } catch (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
