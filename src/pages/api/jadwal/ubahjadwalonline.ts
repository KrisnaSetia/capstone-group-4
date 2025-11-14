import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/../db-supabase.js";
import { getUserFromRequest } from "@/lib/auth";

type SesiItem = {
  sesi: number;
  aktif: boolean;
};

function normalizeTanggal(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  const tanggalParam = normalizeTanggal(
    (req.query.tanggal as string | string[] | undefined) ??
      (req.body?.tanggal as string | string[] | undefined)
  );
  const user = getUserFromRequest(req);

  // Pastikan user login adalah psikolog (roles 0)
  if (!user || user.roles !== 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idPsikolog = user.userId; // dari token
  if (!idPsikolog || !tanggalParam) {
    return res.status(400).json({ message: "Missing id or tanggal" });
  }

  // kita anggap tanggalParam = "YYYY-MM-DD"
  const tanggal = tanggalParam;

  // Buat range hari (>= tanggal, < tanggal+1)
  const startDate = tanggal; // "2025-01-20"
  const nextDay = new Date(tanggal);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split("T")[0]; // "2025-01-21"

  if (method === "GET") {
    try {
      const { data, error } = await supabaseServer
        .from("jadwal_online")
        .select("sesi, status")
        .eq("id_psikolog", idPsikolog)
        .gte("tanggal", startDate)
        .lt("tanggal", nextDayStr)
        .order("sesi", { ascending: true });

      if (error) {
        console.error("Supabase error (GET jadwal_online):", error);
        return res.status(500).json({ message: "Database error" });
      }

      return res.status(200).json({ data: data ?? [] });
    } catch (err) {
      console.error("Server error (GET):", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (method === "PUT") {
    const sesiData = req.body.sesi as SesiItem[];

    if (!Array.isArray(sesiData)) {
      return res.status(400).json({ message: "Invalid sesi data" });
    }

    try {
      // Proses tiap sesi secara paralel (seperti Promise.all sebelumnya)
      await Promise.all(
        sesiData.map(async (item) => {
          const { sesi, aktif } = item;

          // 1. Cek apakah sesi ini sudah dibooking
          //    Aslinya: join konsultasi_online + jadwal_online dengan jo.status = 1
          //    Di sini kita lakukan dua langkah:

          // 1a. Cari jadwal_online dengan status = 1
          const { data: jadwalBooked, error: jadwalBookedErr } =
            await supabaseServer
              .from("jadwal_online")
              .select("id_jadwal")
              .eq("id_psikolog", idPsikolog)
              .eq("sesi", sesi)
              .eq("status", 1) // jo.status = 1 (sudah dikonfirmasi / aktif utk booking)
              .gte("tanggal", startDate)
              .lt("tanggal", nextDayStr);

          if (jadwalBookedErr) {
            console.error("Error saat cek jadwal booked:", jadwalBookedErr);
            throw jadwalBookedErr;
          }

          if (jadwalBooked && jadwalBooked.length > 0) {
            const jadwalIds = jadwalBooked.map((j) => j.id_jadwal);

            // 1b. Cek apakah ada konsultasi_online yang pakai salah satu jadwal ini
            const { data: booked, error: konsultasiErr } = await supabaseServer
              .from("konsultasi_online")
              .select("id_konsultasi_online")
              .in("id_jadwal", jadwalIds)
              .limit(1);

            if (konsultasiErr) {
              console.error("Error saat cek booking konsultasi:", konsultasiErr);
              throw konsultasiErr;
            }

            if (booked && booked.length > 0) {
              console.log(`Sesi ${sesi} sudah dibooking, skip update.`);
              return "SKIPPED";
            }
          }

          // 2. Cari jadwal_online untuk hari & sesi tersebut (tanpa filter status)
          const { data: jadwalExisting, error: jadwalExistErr } =
            await supabaseServer
              .from("jadwal_online")
              .select("id_jadwal")
              .eq("id_psikolog", idPsikolog)
              .eq("sesi", sesi)
              .gte("tanggal", startDate)
              .lt("tanggal", nextDayStr);

          if (jadwalExistErr) {
            console.error("Error saat find jadwal:", jadwalExistErr);
            throw jadwalExistErr;
          }

          const statusValue = aktif ? 0 : 2; // sama seperti versi MySQL

          if (jadwalExisting && jadwalExisting.length > 0) {
            // 3a. Update jika sudah ada jadwal
            const idJadwal = jadwalExisting[0].id_jadwal;

            const { error: updateErr } = await supabaseServer
              .from("jadwal_online")
              .update({ status: statusValue })
              .eq("id_jadwal", idJadwal);

            if (updateErr) {
              console.error("Error saat update jadwal:", updateErr);
              throw updateErr;
            }
            return true;
          } else {
            // 3b. Insert jika belum ada jadwal
            const { error: insertErr } = await supabaseServer
              .from("jadwal_online")
              .insert({
                id_psikolog: idPsikolog,
                tanggal: tanggal, // "YYYY-MM-DD" → Postgres akan cast ke timestamp
                sesi,
                status: statusValue,
              });

            if (insertErr) {
              console.error("Error saat insert jadwal:", insertErr);
              throw insertErr;
            }
            return true;
          }
        })
      );

      return res.status(200).json({ message: "Jadwal berhasil diperbarui." });
    } catch (error) {
      console.error("❌ Gagal saat Promise.all (PUT):", error);
      return res.status(500).json({ message: "Gagal memperbarui jadwal." });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
