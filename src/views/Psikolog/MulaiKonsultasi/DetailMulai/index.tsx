import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import styles from "./detail-mulai-konsultasi.module.css";
import Head from "next/head";
import Spinner from "@/components/Spinner/Psikolog";
import DashboardLayout from "@/layouts/dashboard-psi";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import KonfirmasiAkhiri from "@/components/Modal/KonfirmasiAkhiri";
// 1. Impor modal sukses yang baru
import SuccessAkhiri from "@/components/Modal/SuccessAkhiri";

interface Konsultasi {
  id: string;
  namaMahasiswa: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  zoomStartUrl: string;
}

export default function DetailMulaiKonsultasiView() {
  const router = useRouter();
  const { id } = router.query;

  const [konsultasi, setKonsultasi] = useState<Konsultasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 2. Tambahkan state untuk modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    // ... fetchData logic (tidak ada perubahan)
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/psikolog/mulaikonsultasi/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal mengambil data");
        setKonsultasi(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail konsultasi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => router.back();

  // 3. Ubah fungsi handleConfirmEndSession
  const handleConfirmEndSession = async () => {
    if (!konsultasi) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch("/api/psikolog/akhirisesi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_konsultasi: konsultasi.id }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Gagal mengakhiri sesi");
      }

      // Ganti alert dan router.push dengan menampilkan modal sukses
      setShowSuccessModal(true);

    } catch (err: unknown) {
      console.error("Gagal mengakhiri sesi:", err);
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mengakhiri sesi.";
      alert(errorMessage); // Biarkan alert untuk notifikasi error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 4. Tambahkan useEffect untuk auto-redirect setelah modal sukses muncul
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        router.push("/psikolog/mulaikonsultasi");
      }, 1500); // Tunggu 1.5 detik sebelum redirect

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [showSuccessModal, router]);


  if (loading) {
    return <Spinner />;
  }

  if (error || !konsultasi) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        {error || "Sesi konsultasi tidak ditemukan."}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Detail Mulai Konsultasi | ITS-OK</title>
        <meta
          name="description"
          content="Halaman detail memulai sesi konsultasi psikolog"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        {/* ... sisa kode JSX tidak ada perubahan ... */}
        <div className={styles.pageWrapper}>
            <div className={styles.contentWrapper}>
                {/* ... Header Section ... */}
                <section className={styles.headerSection}>
                  <div className={styles.headerContent}>
                    <h2 className={styles.pageTitle}>
                      Detail Memulai Konsultasi Online
                    </h2>
                    <Button onClick={handleBack} className={styles.backButton}>
                      <ArrowLeft size={20} />
                      Kembali
                    </Button>
                  </div>
                </section>
                {/* ... Detail Container ... */}
                <div className={styles.detailContainer}>
                  <div className={styles.consultationHeader}>
                       <h3 className={styles.consultationTitle}>
                         Konsultasi Online : {konsultasi.namaMahasiswa}
                       </h3>
                       <div className={styles.submissionDate}>
                         <span className={styles.dateLabel}>TANGGAL PENGAJUAN</span>
                         <span className={styles.dateValue}>
                           {konsultasi.tanggalPengajuan}
                         </span>
                       </div>
                     </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>NAMA MAHASISWA</span>
                        <span className={styles.detailValue}>
                          {konsultasi.namaMahasiswa}
                        </span>
                      </div>
                    </div>
    
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          JADWAL KONSULTASI
                        </span>
                        <span className={styles.detailValue}>
                          {konsultasi.jadwalKonsultasi}
                        </span>
                      </div>
                    </div>
    
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>SESI KONSULTASI</span>
                        <span className={styles.detailValue}>
                          {konsultasi.sesiKonsultasi}
                        </span>
                      </div>
                    </div>
    
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                        <p className={styles.keluhanText}>{konsultasi.keluhan}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ... Zoom Container ... */}
                <div className={styles.zoomContainer}>
                  <h4 className={styles.zoomTitle}>Link Zoom Konsultasi Online</h4>
                  <div className={styles.zoomDivider} />
                  <div className={styles.zoomContentRow}>
                    <div className={styles.zoomLinkArea}>
                      <span className={styles.detailLabel}>LINK ZOOM</span>
                      <a
                        href={konsultasi.zoomStartUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.zoomLink}
                      >
                        Zoom Meeting - Link Mulai Konsultasi Online Anda
                      </a>
                    </div>
                    <div className={styles.zoomButtons}>
                      <Button
                        variant="primary"
                        className={styles.startBtn}
                        onClick={() =>
                          window.open(konsultasi.zoomStartUrl, "_blank")
                        }
                      >
                        Mulai
                      </Button>
                      <Button
                        variant="outline-danger"
                        className={styles.endBtn}
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isSubmitting}
                      >
                        Akhiri
                      </Button>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </DashboardLayout>

      <KonfirmasiAkhiri
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmEndSession}
        isSubmitting={isSubmitting}
      />
      
      {/* 5. Render modal sukses di sini */}
      <SuccessAkhiri show={showSuccessModal} />
    </>
  );
}