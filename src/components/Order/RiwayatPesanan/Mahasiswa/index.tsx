import Link from "next/link";
import styles from "./riwayatpesanan-mhs.module.css";
import { Video, CheckCircle } from "lucide-react";

interface RiwayatItem {
  id: string;
  namaPemesan: string;
  tanggal: string;
  sesi: string;
}

interface Props {
  data: RiwayatItem[];
}

export default function RiwayatPesananMahasiswa({ data }: Props) {
  return (
    <div className={styles.wrapper}>
      {data.map((item) => (
        <Link
          key={item.id}
          href={`/mahasiswa/riwayatpesanan/detailriwayat/${item.id}`}
          className={styles.cardLink}
        >
          <div className={styles.card}>
            <div className={styles.iconContainer}>
              <Video size={24} className={styles.icon} />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>
                Konsultasi Online : {item.namaPemesan}
              </h3>
              <p className={styles.dateTime}>
                {item.tanggal} | {item.sesi}
              </p>
              <div className={`${styles.status} ${styles.green}`}>
                <CheckCircle size={16} className={styles.statusIcon} />
                <span>Selesai</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}