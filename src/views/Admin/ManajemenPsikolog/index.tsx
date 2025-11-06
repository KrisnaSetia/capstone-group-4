import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/layouts/dashboard-admin";
import styles from "./admin-psikolog.module.css";
import Spinner from "@/components/Spinner/Mahasiswa";
import { Form } from "react-bootstrap";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Psikolog {
  id_psikolog: number;
  username: string;
  nomor_sertifikasi: string;
  kuota_harian: number;
  rating: number;
  deskripsi: string;
  url_foto: string;
}

export default function ManajemenPsikologPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [psikologList, setPsikologList] = useState<Psikolog[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const goToDetail = (id: number) => {
    router.push(`/admin/manajemenpsikolog/${id}`);
  };

  const calculateStars = (rating: number): number => {
    if (rating >= 4.5) return 5;
    if (rating >= 3.5) return 4;
    if (rating >= 2.5) return 3;
    if (rating >= 1.5) return 2;
    if (rating >= 0.5) return 1;
    return 0;
  };

  useEffect(() => {
    const fetchPsikolog = async () => {
      try {
        const res = await fetch("/api/admin/manajemen-psikolog");
        const data = await res.json();
        
        if (data.success) {
          setPsikologList(data.data || []);
        } else {
          console.error("Gagal memuat data psikolog");
        }
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
        <title>Manajemen Psikolog | ITS-OK</title>
        <meta name="description" content="Manajemen data psikolog" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>Manajemen Psikolog</h2>
          </div>

          <div className={styles.cardContainer}>
            <h4 className={styles.subTitle}>Daftar Psikolog Terdaftar</h4>
            <div className={styles.searchWrapper}>
              <Form.Control
                type="text"
                placeholder="Cari nama psikolog yang anda inginkan.."
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {loading ? (
              <Spinner />
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
      </DashboardLayout>
    </>
  );
}