/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./daftar-konsuloff.module.css";
import { Button, Form } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import SuccessOrder from "@/components/Modal/SuccessOrder";
import BatasanHariModal from "@/components/Modal/HariBatasan";
import HariTidakTersediaModal from "@/components/Modal/HariTidakTersedia";


export default function FormKonsultasiOffline() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBatasanHari, setShowBatasanHari] = useState(false);
  const [showHariTidakTersedia, setShowHariTidakTersedia] = useState(false);
  const [selectedSesi, setSelectedSesi] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: "",
    keluhan: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isTuesdayOrThursday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    return day === 2 || day === 4; // 2 = Selasa, 4 = Kamis
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, tanggal: selectedDate })); // Hanya set tanggal
  };

  const handleBack = () => {
    router.push("/mahasiswa/konsultasioffline");
  };

  const handleSubmit = async () => {
    try {
      if (!formData.tanggal || !selectedSesi || !formData.keluhan) {
        alert("Mohon lengkapi semua data formulir terlebih dahulu.");
        return;
      }

      if (!isTuesdayOrThursday(formData.tanggal)) {
        setShowBatasanHari(true);
        return;
      }

      const sesiMapping: Record<string, number> = {
        "10.00 – 11.30": 1,
        "12.00 – 13.30": 2,
        "14.00 – 15.30": 3,
      };

      const selectedSesiNumber = sesiMapping[selectedSesi ?? ""];

      const res = await fetch("/api/mahasiswa/konsultasioffline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_jadwal: await fetchJadwalId(formData.tanggal, selectedSesiNumber),
          sesi: selectedSesiNumber,
          keluhan: formData.keluhan,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Gagal mendaftar.");
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/mahasiswa/konsultasioffline");
      }, 2000);
    } catch (err: any) {
      if (err.message === "Tanggal tidak tersedia") {
        setShowHariTidakTersedia(true); // ⬅️ Ganti alert menjadi trigger modal
      } else {
        alert("Terjadi kesalahan saat mendaftar.");
      }
    }
  };

  const fetchJadwalId = async (
    tanggal: string,
    sesi: number
  ): Promise<number> => {
    const res = await fetch("/api/jadwal/jadwaloffline");
    const data = await res.json();

    const jadwal = data.find(
      (j: any) => j.tanggal.startsWith(tanggal) && j.sesi === sesi
    );

    if (!jadwal) {
      throw new Error("Tanggal tidak tersedia");
    }

    return jadwal.id_jadwal;
  };

  const sesiList = ["10.00 – 11.30", "12.00 – 13.30", "14.00 – 15.30"];

  return (
    <>
      <Head>
        <title>Konsultasi Offline | ITS-OK</title>
        <meta name="description" content="Formulir daftar konsultasi offline" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Daftar Konsultasi Offline</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} /> Kembali
                </Button>
              </div>
            </section>
            <div className={styles.detailContainer}>
              <div className={styles.shccBanner}>
                <Image
                  src="/assets/SHCC.png"
                  alt="SHCC Banner"
                  width={220}
                  height={150}
                  className={styles.shccImage}
                />
                <div className={styles.shccText}>
                  <h3 className={styles.shccTitle}>
                    Student Health Care Center
                  </h3>
                  <p className={styles.shccDesc}>
                    Konsultasikan masalah mental health kamu{" "}
                    <span className={styles.greenText}>GRATIS!</span>
                    <br />
                    Dengan psikolog dari Dear Astrid di SHCC
                  </p>
                  <p className={styles.shccSchedule}>
                    Jadwal :{" "}
                    <span className={styles.redText}>
                      Setiap Selasa & Kamis
                    </span>
                  </p>
                  <p className={styles.shccLocation}>
                    Lokasi :{" "}
                    <span className={styles.blueText}>
                      Lantai 2, Kantin Pusat ITS
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      JADWAL KONSULTASI
                    </span>
                    <Form.Control
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleDateChange} // Ubah ini ke handleDateChange
                    />
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SESI KONSULTASI</span>
                    <div className={styles.sesiButtonsWrapper}>
                      {sesiList.map((sesi) => (
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
                      ))}
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
                  disabled={
                    !formData.tanggal || !selectedSesi || !formData.keluhan
                  }
                >
                  Konfirmasi Pesanan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <SuccessOrder show={showSuccess} />
      <BatasanHariModal show={showBatasanHari} onClose={() => setShowBatasanHari(false)} />
      <HariTidakTersediaModal show={showHariTidakTersedia} onClose={() => setShowHariTidakTersedia(false)} />
    </>
  );
}