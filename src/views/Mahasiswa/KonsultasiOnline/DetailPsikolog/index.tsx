import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./detail-psikolog.module.css";
import Spinner from "@/components/Spinner/Mahasiswa";
import Image from "next/image";
import { Button } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface Psikolog {
  id_psikolog: number;
  username: string;
  rating: number;
  nomor_sertifikasi: string;
  deskripsi: string;
  url_foto: string;
}

export default function DetailPsikologView() {
  const router = useRouter();
  const { id } = router.query;

  const [psikolog, setPsikolog] = useState<Psikolog | null>(null);
  const [loading, setLoading] = useState(true);

  // Data statis untuk jadwal & sesi
  const hariJadwalMap: { [key: string]: string } = {
    "1": "Senin",
    "2": "Senin",
    "3": "Selasa",
    "4": "Selasa",
    "5": "Rabu",
    "6": "Rabu",
    "7": "Kamis",
    "8": "Kamis",
    "9": "Jumat",
    "10": "Jumat",
  };

  const sesi = ["10.00 – 10.40", "11.00 – 11.40", "12.00 – 12.40"];

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/mahasiswa/detailpsikolog/${id}`);
        const json = await res.json();
        setPsikolog(json.data);
      } catch (err) {
        console.error("Gagal mengambil data psikolog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    router.push("/mahasiswa/konsultasionline/pilihpsikolog");
  };

  const handleDaftar = () => {
    router.push(`/mahasiswa/konsultasionline/daftarkonsultasi/${id}`);
  };

  if (loading) {
    return <Spinner/>;
  }

  if (!psikolog) {
    return (
      <div style={{ padding: "2rem" }}>Data psikolog tidak ditemukan.</div>
    );
  }

  return (
    <>
      <Head>
        <title>Detail Psikolog | ITS-OK</title>
        <meta name="description" content="Halaman detail profil psikolog" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>

      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>Detail Profil Psikolog</h2>
            <Button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft size={20} />
              Kembali
            </Button>
          </div>

          <div className={styles.container}>
            <div className={styles.profileCard}>
              <div className={styles.profileTop}>
                <Image
                  src={psikolog.url_foto}
                  alt={psikolog.username}
                  width={120}
                  height={120}
                  className={styles.avatar}
                />
                <div className={styles.profileInfo}>
                  <h3 className={styles.nama}>{psikolog.username}</h3>
                  <p className={styles.subInfo}>
                    Nomor Sertifikasi : {psikolog.nomor_sertifikasi}
                  </p>
                  <p className={styles.subInfo}>
                    Rating : {psikolog.rating.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className={styles.profileDetail}>
                <h5 className={styles.label}>Profil Psikolog</h5>
                <p className={styles.deskripsi}>{psikolog.deskripsi}</p>

                <h5 className={styles.label}>Jadwal Psikolog</h5>
                <p className={styles.subInfo}>
                  {hariJadwalMap[psikolog.id_psikolog.toString()] ||
                    "Tidak tersedia"}
                </p>

                <h5 className={styles.label}>Sesi Tersedia</h5>
                <div className={styles.sesiWrapper}>
                  {sesi.map((item, idx) => (
                    <span
                      key={idx}
                      className={styles.sesiBox}
                      style={{ cursor: "not-allowed", opacity: 0.6 }}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className={styles.buttonWrapper}>
                  <Button
                    className={styles.daftarButton}
                    onClick={handleDaftar}
                  >
                    Daftar Sekarang
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
