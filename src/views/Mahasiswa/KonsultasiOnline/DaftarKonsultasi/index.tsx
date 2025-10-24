import { useRouter } from "next/router";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./daftar-konsulonl.module.css";
import { Button, Form } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import SuccessOrder from "@/components/Modal/SuccessOrder";
import Spinner from "@/components/Spinner/Mahasiswa";

export default function FormKonsultasiOnline() {
  const router = useRouter();
  const { id } = router.query;

  const [selectedSesi, setSelectedSesi] = useState<string | null>(null);
  const [sesiTersedia, setSesiTersedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    namaPsikolog: "",
    tanggal: "",
    keluhan: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Ambil nama psikolog saat pertama kali buka
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchNamaPsikolog = async () => {
      try {
        const res = await fetch(`/api/mahasiswa/daftarkonsultasionline/${id}`);
        const json = await res.json();
        if (res.ok) {
          setFormData((prev) => ({
            ...prev,
            namaPsikolog: json.data.namaPsikolog,
          }));
        }
      } catch (err) {
        console.error("Gagal fetch nama psikolog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNamaPsikolog();
  }, [id]);

  // Ambil sesi ketika tanggal diubah
  useEffect(() => {
    if (!formData.tanggal || !id || typeof id !== "string") return;

    const fetchSesi = async () => {
      try {
        const res = await fetch(
          `/api/mahasiswa/daftarkonsultasionline/${id}?tanggal=${formData.tanggal}`
        );
        const json = await res.json();
        if (res.ok) {
          setSesiTersedia(json.data.sesi_tersedia);
        }
      } catch (err) {
        console.error("Gagal ambil sesi:", err);
      }
    };

    fetchSesi();
  }, [formData.tanggal, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "tanggal") {
      setSelectedSesi(null); // reset sesi saat ganti tanggal
    }
  };

  const handleBack = () => {
    if (id) {
      router.push(`/mahasiswa/konsultasionline/detailpsikolog/${id}`);
    } else {
      router.push("/mahasiswa/konsultasionline");
    }
  };

  const handleSubmit = async () => {
    if (!formData.tanggal || !selectedSesi || !formData.keluhan || !id) return;

    try {
      const res = await fetch(`/api/mahasiswa/daftarkonsultasionline/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          sesi: selectedSesi,
          keluhan: formData.keluhan,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/mahasiswa/konsultasionline");
        }, 2000);
      } else {
        alert(result.message || "Gagal menyimpan konsultasi.");
      }
    } catch (error) {
      console.error("Gagal POST:", error);
      alert("Terjadi kesalahan saat mengirim data.");
    }
  };

  const isFormValid =
    formData.namaPsikolog &&
    formData.tanggal &&
    selectedSesi &&
    formData.keluhan;

  if (loading) return <Spinner />;

  return (
    <>
      <Head>
        <title>Konsultasi Online | ITS-OK</title>
        <meta name="description" content="Formulir daftar konsultasi online" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>

      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Daftar Konsultasi Online</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} /> Kembali
                </Button>
              </div>
            </section>

            <div className={styles.detailContainer}>
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>NAMA PSIKOLOG</span>
                    <div className={styles.detailValue}>
                      {formData.namaPsikolog || "Tidak diketahui"}
                    </div>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      JADWAL KONSULTASI
                    </span>
                    <Form.Control
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SESI KONSULTASI</span>
                    <div className={styles.sesiButtonsWrapper}>
                      {sesiTersedia.length > 0 ? (
                        sesiTersedia.map((sesi) => (
                          <button
                            key={sesi}
                            type="button"
                            className={`${styles.sesiButton} ${
                              selectedSesi === sesi ? styles.selectedSesi : ""
                            }`}
                            onClick={() => setSelectedSesi(sesi)}
                          >
                            {sesi}
                          </button>
                        ))
                      ) : (
                        <div style={{ opacity: 0.6, fontSize: "0.9rem" }}>
                          {formData.tanggal
                            ? "Tidak ada sesi tersedia."
                            : "Pilih tanggal terlebih dahulu."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                    <Form.Control
                      as="textarea"
                      name="keluhan"
                      rows={4}
                      placeholder="Tuliskan keluhan anda disini......"
                      value={formData.keluhan}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.confirmButton}
                  disabled={!isFormValid}
                >
                  Konfirmasi Pesanan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      <SuccessOrder show={showSuccess} />
    </>
  );
}
