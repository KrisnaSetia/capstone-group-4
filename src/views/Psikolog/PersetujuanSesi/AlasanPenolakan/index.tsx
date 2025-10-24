import { Button } from "react-bootstrap";
import { useState } from "react";
import styles from "./alasanpenolakan-psi.module.css";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-psi";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import SuccessOrder from "@/components/Modal/SuccessTolak";

export default function AlasanPenolakan() {
  const router = useRouter();
  const { id } = router.query;
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const handleBack = () => {
    if (id) {
      router.push(`/psikolog/persetujuansesi/detailpesanan/${id}`);
    } else {
      router.push(`/psikolog/persetujuansesi/detailpesanan/${id}`);
    }
  };

  const handleKonfirmasi = async () => {
    if (!id || !alasanPenolakan.trim()) return;

    try {
      const response = await fetch("/api/psikolog/alasanpenolakan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_konsultasi: id,
          alasan_penolakan: alasanPenolakan.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menolak konsultasi");
      }

      // Tampilkan modal sukses
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/psikolog/persetujuansesi");
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim penolakan.");
    }
  };

  return (
    <>
      <Head>
        <title>Detail Persetujuan Sesi | ITS-OK</title>
        <meta
          name="description"
          content="Halaman detail persetujuan sesi psikolog"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            {/* Header dengan tombol kembali dan judul sejajar */}
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Daftar Konsultasi Online</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} />
                  Kembali
                </Button>
              </div>
            </section>

            {/* Detail Konsultasi */}
            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>Alasan Penolakan</h3>

                <div className={styles.formGroup}>
                  <textarea
                    className={styles.textArea}
                    placeholder="Tuliskan alasan penolakan anda disini..."
                    value={alasanPenolakan}
                    onChange={(e) => setAlasanPenolakan(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className={styles.buttonContainer}>
                  <Button
                    className={styles.konfirmasiButton}
                    onClick={handleKonfirmasi}
                    disabled={!alasanPenolakan.trim()}
                  >
                    Konfirmasi Penolakan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <SuccessOrder show={showSuccess} />
    </>
  );
}
