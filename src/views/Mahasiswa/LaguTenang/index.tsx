import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./lagutenang.module.css";
import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Image from "next/image";
import Spinner from "@/components/Spinner/Mahasiswa";
import NoLagu from "@/components/NoLagu";

interface LaguItem {
  id: string;
  judul: string;
  file: string;
  cover: string;
}

export default function LaguTenangMahasiswaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [daftarLagu, setDaftarLagu] = useState<LaguItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLagu = async () => {
      try {
        const response = await fetch("/api/lagutenang");
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setDaftarLagu(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data lagu:", error);
      } finally {
        setIsLoading(false); // selesai loading
      }
    };

    fetchLagu();
  }, []);

  const filteredLagu = daftarLagu.filter((lagu) =>
    lagu.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Lagu Tenang | ITS-OK</title>
        <meta
          name="description"
          content="Halaman lagu-lagu tenang untuk relaksasi"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>

      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>Daftar Lagu Tenang</h2>
          </div>
          <div className={styles.searchBarContainer}>
            <Form.Control
              type="text"
              placeholder="Cari lagu tenang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.wrapper}>
            {isLoading ? (
              <Spinner />
            ) : filteredLagu.length > 0 ? (
              filteredLagu.map((lagu) => (
                <div key={lagu.id} className={styles.card}>
                  <div className={styles.coverWrapper}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={lagu.cover || "/assets/audio/placeholder.png"}
                        alt={lagu.judul}
                        fill
                        className={styles.coverImage}
                      />
                    </div>
                  </div>
                  <div className={styles.content}>
                    <h3 className={styles.title}>{lagu.judul}</h3>
                    <audio controls className={styles.audioPlayer}>
                      <source src={lagu.file} type="audio/mpeg" />
                      Browsermu tidak mendukung pemutar audio.
                    </audio>
                  </div>
                </div>
              ))
            ) : (
              <NoLagu />
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
