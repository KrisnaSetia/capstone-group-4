import { useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-psi";
import styles from "./jadwal.module.css";
import { CalendarDays } from "lucide-react";
import SuccessJadwal from "@/components/Modal/SuccessJadwal";

const sesiDefault = [
  { label: "Sesi 1 (10.00 – 10.40)", value: 1, aktif: false },
  { label: "Sesi 2 (11.00 – 11.40)", value: 2, aktif: false },
  { label: "Sesi 3 (12.00 – 12.40)", value: 3, aktif: false },
];

interface Sesi {
  label: string;
  value: number;
  aktif: boolean;
}
interface JadwalItem {
  sesi: number;
  status: number; // 1 aktif, 0 nonaktif
}

export default function JadwalPsikologView() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [initialSesi, setInitialSesi] = useState<Sesi[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDateChange = async (value: string) => {
    setSelectedDate(value);

    try {
      const res = await fetch(`/api/jadwal/ubahjadwalonline?tanggal=${value}`);
      const data = await res.json();

      if (res.ok && data && data.data && data.data.length > 0) {
        const sesiMapped = sesiDefault
          .map((s) => {
            const found = (data.data as JadwalItem[]).find((d) => d.sesi === s.value);
            const status = found?.status;

            return {
              ...s,
              aktif: status === 0,
              skip: status === 1
            };
          })
          .filter((s) => !s.skip);

        setSesiList(sesiMapped);
        setInitialSesi(
          sesiMapped.map((s) => ({
            label: s.label,
            value: s.value,
            aktif: s.aktif,
          }))
        );
      } else {
        setSesiList([]);
        setInitialSesi([]);
      }
    } catch (error) {
      console.error("Error saat ambil jadwal:", error);
      setSesiList([]);
      setInitialSesi([]);
    }
  };

  const handleToggle = (index: number) => {
    const updated = [...sesiList];
    updated[index].aktif = !updated[index].aktif;
    setSesiList(updated);
  };

  const handleSave = async () => {
    if (!selectedDate || !hasChanged()) return;
    try {
      const res = await fetch(`/api/jadwal/ubahjadwalonline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: selectedDate,
          sesi: sesiList.map((s) => ({ sesi: s.value, aktif: s.aktif })),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setInitialSesi(
          sesiList.map((s) => ({
            label: s.label,
            value: s.value,
            aktif: s.aktif,
          }))
        );
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert(result.message || "Gagal menyimpan jadwal.");
      }
    } catch (error) {
      console.error("Gagal simpan jadwal:", error);
      alert("Terjadi kesalahan saat menyimpan.");
    }
  };

  const hasChanged = () => {
    return sesiList.some((sesi, index) => sesi.aktif !== initialSesi[index]?.aktif);
  };

  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Head>
        <title>Jadwal | ITS-OK</title>
        <meta name="description" content="Pengaturan jadwal konsultasi oleh psikolog di ITS-OK." />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.sectionTitleWrapper}>
              <h2 className={styles.pageTitle}>Jadwal Konsultasi Anda</h2>
            </section>
            <div className={styles.formContainer}>
              <label htmlFor="tanggal" className={styles.jadwalLabel}>
                <CalendarDays size={18} className={styles.icon} />
                Jadwal Konsultasi
              </label>
              <input
                id="tanggal"
                type="date"
                className={styles.inputDate}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <h3 className={styles.subHeader}>Sesi Konsultasi</h3>
              {!selectedDate && (
                <p className={styles.infoText}>Pilih tanggal konsultasi anda.</p>
              )}
              {selectedDate && sesiList.length === 0 && (
                <p className={styles.infoText}>Tidak ada sesi tersedia untuk hari ini.</p>
              )}
              {selectedDate && sesiList.length > 0 && (
                <>
                  <p className={styles.tanggalTerpilih}>
                    Jadwal Konsultasi: {formatTanggal(selectedDate)}
                  </p>
                  <div className={styles.rowWrapper}>
                    <div className={styles.sesiContainer}>
                      {sesiList.map((sesi, index) => (
                        <label key={sesi.value} className={styles.sesiToggle}>
                          <input
                            type="checkbox"
                            checked={sesi.aktif}
                            onChange={() => handleToggle(index)}
                          />
                          <span className={styles.slider}></span>
                          <span className={styles.labelText}>{sesi.label}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanged()}
                      className={styles.saveButton}
                    >
                      Simpan
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
      <SuccessJadwal show={showSuccess} />
    </>
  );
}
