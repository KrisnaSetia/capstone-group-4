// data/dummyPersetujuan.ts

export interface Pesanan {
  id: string;
  namaMahasiswa: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  status: number; // 0 = Ditolak, 1 = Menunggu Persetujuan, 2 = Telah Disetujui
}

export const dummyPersetujuanData: Pesanan[] = [
  {
    id: "1",
    namaMahasiswa: "Athalla Rayya Genaro",
    tanggalPengajuan: "12 Mei 2025 17:25:30",
    jadwalKonsultasi: "12 Mei 2025",
    sesiKonsultasi: "Sesi 1 (10.00 – 11.30)",
    keluhan:
      "Kesulitan menyeimbangkan antara kuliah dan organisasi, mengalami stres berlebih.",
    status: 1,
  },
  {
    id: "2",
    namaMahasiswa: "John Doe",
    tanggalPengajuan: "10 Mei 2025 14:20:15",
    jadwalKonsultasi: "13 Mei 2025",
    sesiKonsultasi: "Sesi 2 (14.00 – 15.30)",
    keluhan:
      "Mengalami kesulitan dalam mengatur waktu belajar dan merasa tertekan dengan tugas kuliah.",
    status: 2,
  },
  {
    id: "3",
    namaMahasiswa: "Jane Smith",
    tanggalPengajuan: "08 Mei 2025 10:15:45",
    jadwalKonsultasi: "14 Mei 2025",
    sesiKonsultasi: "Sesi 1 (10.00 – 11.30)",
    keluhan:
      "Membutuhkan konsultasi terkait masalah adaptasi lingkungan kampus.",
    status: 0,
  },
  {
    id: "4",
    namaMahasiswa: "Alice Johnson",
    tanggalPengajuan: "05 Mei 2025 11:30:00",
    jadwalKonsultasi: "15 Mei 2025",
    sesiKonsultasi: "Sesi 2 (14.00 – 15.30)",
    keluhan: "Merasa cemas dan butuh bantuan untuk mengatasi tekanan akademik.",
    status: 1,
  },
  {
    id: "5",
    namaMahasiswa: "Bob Brown",
    tanggalPengajuan: "03 Mei 2025 15:45:00",
    jadwalKonsultasi: "16 Mei 2025",
    sesiKonsultasi: "Sesi 3 (15.30 – 17.00)",
    keluhan:
      "Mengalami kesulitan dalam mengatur waktu belajar dan merasa tertekan dengan tugas kuliah.",
    status: 2,
  },
];
