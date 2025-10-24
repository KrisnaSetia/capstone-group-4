import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./pilih-psikolog.module.css";
import Spinner from "@/components/Spinner/Mahasiswa";
import { Button, Form } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import FilterModal from "@/components/Modal/FilterModal";

interface Psikolog {
  id_psikolog: number;
  username: string;
  nomor_sertifikasi: string;
  kuota_harian: number;
  rating: number;
  deskripsi: string;
  url_foto: string;
}

export default function PilihPsikologPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [psikologList, setPsikologList] = useState<Psikolog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleBack = () => {
    router.push("/mahasiswa/konsultasionline");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const goToDetail = (id: number) => {
    router.push(`/mahasiswa/konsultasionline/detailpsikolog/${id}`);
  };

  const calculateStars = (rating: number): number => {
    if (rating >= 4.5) return 5;
    if (rating >= 3.5) return 4;
    if (rating >= 2.5) return 3;
    if (rating >= 1.5) return 2;
    if (rating >= 0.5) return 1;
    return 0;
  };
  
  const handleFilterApply = async (date: string | null, sessions: number[] | null) => {

    if (!date || !sessions || sessions.length === 0) {
      try {
        const res = await fetch("/api/mahasiswa/listpsikolog");
        const data = await res.json();
        setPsikologList(data.data || []);
      } catch (err) {
        console.error("Gagal memuat semua psikolog:", err);
      }
      return;
    }

    try {
      const allFiltered: Psikolog[] = [];

      for (const sesi of sessions) {
        const res = await fetch(`/api/mahasiswa/filter-psikolog?tanggal=${date}&sesi=${sesi}`);
        const json = await res.json();

        if (!json || !Array.isArray(json.data)) {
          console.warn("Response tidak valid:", json);
          continue;
        }

        allFiltered.push(...json.data);
      }

      const uniqueFiltered = Array.from(
        new Map(allFiltered.map((p) => [p.id_psikolog, p])).values()
      );

      setPsikologList(uniqueFiltered);
    } catch (err) {
      console.error("Gagal memfilter psikolog:", err);
    }
  };

  useEffect(() => {
    const fetchPsikolog = async () => {
      try {
        const res = await fetch("/api/mahasiswa/listpsikolog");
        const data = await res.json();
        setPsikologList(data.data || []);
      } catch (error) {
        console.error("Gagal memuat data psikolog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsikolog();
  }, []);

  const filteredPsikolog = psikologList.filter((psikolog) =>
    psikolog.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Pilih Psikolog | ITS-OK</title>
        <meta name="description" content="Pilih psikolog konsultasi online" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>Daftar Konsultasi Online</h2>
            <Button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft size={20} />
              Kembali
            </Button>
          </div>

          <div className={styles.cardContainer}>
            <h4 className={styles.subTitle}>Pilih Psikolog yang Tersedia</h4>
            <div className={styles.searchWrapper}>
              <Form.Control
                type="text"
                placeholder="Cari nama psikolog yang anda inginkan.."
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Button
                variant="outline-secondary"
                className={styles.filterButton}
                onClick={() => setShowFilterModal(true)}
              >
                Filter
              </Button>
            </div>

            {loading ? (
              <Spinner/>
            ) : (
              <div className={styles.psychologistGrid}>
                {filteredPsikolog.map((psikolog) => (
                  <div
                    key={psikolog.id_psikolog}
                    className={styles.psychologistCard}
                    onClick={() => goToDetail(psikolog.id_psikolog)}
                    role="button"
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={
                          psikolog.url_foto ||
                          "/assets/foto-psikolog/placeholder.png"
                        }
                        alt={psikolog.nomor_sertifikasi}
                        width={100}
                        height={100}
                        className={styles.avatar}
                      />
                    </div>
                    <h5 className={styles.psychologistName}>
                      {psikolog.username}
                    </h5>
                    <div className={styles.stars}>
                      {Array.from({ length: calculateStars(psikolog.rating) }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredPsikolog.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      gridColumn: "1 / -1",
                      marginTop: "1rem",
                    }}
                  >
                    Tidak ada psikolog ditemukan.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <FilterModal
          show={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onFilter={handleFilterApply}
        />
      </DashboardLayout>
    </>
  );
}
