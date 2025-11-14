/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { judul_lagu, artis, durasi, file_url, url_foto } = req.body;

    if (!judul_lagu || !artis || !durasi || !file_url || !url_foto) {
      return res.status(400).json({ message: "Field tidak boleh kosong" });
    }

    try {
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

      return res.status(201).json({
        message: "Lagu berhasil ditambahkan",
        insertedId: data?.id_lagu ?? null,
      });
    } catch (err) {
      console.error("Connection/Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    try {
      const { data, error } = await supabaseServer
        .from("lagu_tenang")
        .select("id_lagu, judul_lagu, file_url, url_foto")
        .order("id_lagu", { ascending: true });

      if (error) {
        console.error("Supabase Query Error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      const mapped =
        (data ?? []).map((row: any) => ({
          id: row.id_lagu,
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
