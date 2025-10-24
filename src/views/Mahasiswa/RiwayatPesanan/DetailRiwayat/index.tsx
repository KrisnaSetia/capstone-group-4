import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import styles from "./detailriwayat-mhs.module.css";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner/Mahasiswa";
import RatingPsikolog from "@/components/Modal/RatingPsikolog";
import SuccessRating from "@/components/Modal/SuccessRating";

interface RiwayatDetail {
  id: string;
  id_user: number;
  id_psikolog: number;
  namaPsikolog: string;
  tanggalKonsultasi: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
}

export default function DetailRiwayatView() {
  const router = useRouter();
  const { id } = router.query;
  const [riwayat, setRiwayat] = useState<RiwayatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/mahasiswa/riwayat/${id}`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Gagal memuat detail riwayat");
        setRiwayat(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan yang tidak diketahui");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleSubmitRating = async (rating: number) => {
    if (!riwayat) return;

    // Tambahkan log ini:
    console.log("Mengirim rating:", {
      id_psikolog: riwayat.id_psikolog,
      id_user: riwayat.id_user,
      id_riwayat: riwayat.id,
      rating: rating,
    });

    try {
      const res = await fetch("/api/mahasiswa/rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_psikolog: riwayat.id_psikolog,
          id_user: riwayat.id_user,
          id_riwayat: riwayat.id,
          rating: rating,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal mengirim rating");
        return;
      }

      setShowRatingModal(false);
      setShowSuccessModal(true);

      // Setelah 2 detik, modal sukses ditutup dan tombol rating disembunyikan
      setTimeout(() => {
        setShowSuccessModal(false);
        setRatingSubmitted(true);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim rating.");
    }
  };

  if (loading) return <Spinner />;
  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  if (!riwayat)
    return <div style={{ padding: "2rem" }}>Data riwayat tidak ditemukan.</div>;

  return (
    <>
      <Head>
        <title>Detail Riwayat | ITS-OK</title>
        <meta
          name="description"
          content="Halaman detail riwayat konsultasi mahasiswa"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Detail Riwayat Pesanan</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} /> Kembali
                </Button>
              </div>
            </section>

            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Konsultasi Online : {riwayat.namaPsikolog}
                </h3>
                <div className={styles.submissionDate}>
                  <span className={styles.dateLabel}>TANGGAL KONSULTASI</span>
                  <span className={styles.dateValue}>
                    {riwayat.tanggalKonsultasi}
                  </span>
                </div>
                <div className={`${styles.statusBadge} ${styles.green}`}>
                  <CheckCircle size={16} /> <span>Selesai</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>NAMA PSIKOLOG</span>
                    <span className={styles.detailValue}>
                      {riwayat.namaPsikolog}
                    </span>
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      JADWAL KONSULTASI
                    </span>
                    <span className={styles.detailValue}>
                      {riwayat.jadwalKonsultasi}
                    </span>
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SESI KONSULTASI</span>
                    <span className={styles.detailValue}>
                      {riwayat.sesiKonsultasi}
                    </span>
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                    <p className={styles.keluhanText}>{riwayat.keluhan}</p>
                  </div>
                </div>
              </div>

              {!ratingSubmitted && (
                <div className={styles.ratingButtonWrapper}>
                  <Button
                    className={styles.ratingButton}
                    onClick={() => setShowRatingModal(true)}
                  >
                    Beri Rating Psikolog
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>

      <RatingPsikolog
        show={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
      />

      <SuccessRating show={showSuccessModal} />
    </>
  );
}
