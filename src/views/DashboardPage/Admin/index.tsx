// views/DashboardPage/Admin/index.tsx
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "./dashboard-admin.module.css";
import DashboardLayout from "@/layouts/dashboard-admin";
import Image from "next/image";
import { AuthUser } from "@/lib/auth";

interface Props {
  user: AuthUser;
}

function FadeInSection({ children }: { children: React.ReactNode }) {
  const domRef = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setVisible(entry.isIntersecting));
    });

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`${styles.fadeInSection} ${
        isVisible ? styles.isVisible : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function DashboardAdmin({ user }: Props) {
  return (
    <>
      <Head>
        <title>Dashboard Admin | ITS-OK</title>
        <meta
          name="description"
          content="Halaman utama dashboard untuk admin ITS-OK."
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>

      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <FadeInSection>
            <section className={styles.greetingSection}>
              <Container fluid="xl" className={styles.sectionContainer}>
                <h1 className={styles.greeting}>
                  Selamat datang, {user.username}
                </h1>
                <p className={styles.role}>Administrator</p>
              </Container>
            </section>
          </FadeInSection>

          <section className={styles.serviceSectionWrapper}>
            <Container fluid="xl" className={styles.sectionContainer}>
              <div className={styles.serviceSection}>
                <h2 className={styles.serviceTitle}>
                  Kelola Kebutuhan Konsultasi Di Sini
                </h2>
                <p className={styles.serviceSubtitle}>
                  Kelola kebutuhan konsultasi untuk mahasiswa dan psikolog
                  dengan menu kelola konsultasi offline dan manajemen psikolog.
                </p>

                <Row className={styles.cardRow}>
                  {/* Kartu 1 */}
                  <Col md={6} className="mb-4 d-flex">
                    <div className={`${styles.cardBox} d-flex flex-column`}>
                      <div className={styles.imagePlaceholder}>
                        <Image
                          src="/assets/gambar-daftar-konsultasi-offline.png"
                          alt="Kelola Konsultasi Offline"
                          objectFit="cover"
                          width={240}
                          height={10}
                        />
                      </div>
                      <h3 className={styles.cardTitle}>
                        Kelola Konsultasi Offline
                      </h3>
                      <p className={styles.cardText}>
                        Pilih psikolog dan jadwal yang sesuai untuk sesi
                        konsultasi kesehatan mental secara offline.
                      </p>
                      <Button
                        variant="primary"
                        className={`${styles.primaryButton} mt-auto`}
                        href="/admin/konsultasi-offline"
                      >
                        Lihat
                      </Button>
                    </div>
                  </Col>

                  {/* Kartu 2 */}
                  <Col md={6} className="mb-4 d-flex">
                    <div className={`${styles.cardBox} d-flex flex-column`}>
                      <div className={styles.imagePlaceholder}>
                        <Image
                          src="/assets/gambar-daftar-konsultasi-online.png"
                          alt="Manajemen Psikolog"
                          objectFit="cover"
                          width={240}
                          height={10}
                        />
                      </div>
                      <h3 className={styles.cardTitle}>Manajemen Psikolog</h3>
                      <p className={styles.cardText}>
                        Kelola data psikolog: verifikasi, pembaruan profil, dan
                        pengaturan status.
                      </p>
                      <Button
                        variant="primary"
                        className={`${styles.primaryButton} mt-auto`}
                        href="/admin/manajemen-psikolog"
                      >
                        Lihat
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Container>
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
