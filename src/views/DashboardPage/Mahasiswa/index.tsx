import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "./dashboard-mhs.module.css";
import DashboardLayout from "@/layouts/dashboard";
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
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`${styles.fadeInSection} ${isVisible ? styles.isVisible : ""}`}
    >
      {children}
    </div>
  );
}

export default function MahasiswaDashboardPage({ user }: Props) {
  return (
    <>
      <Head>
        <title>Dashboard Mahasiswa | ITS-OK</title>
        <meta
          name="description"
          content="Halaman utama dashboard untuk mahasiswa ITS-OK."
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
                <p className={styles.role}>Mahasiswa</p>
              </Container>
            </section>
          </FadeInSection>

          <section className={styles.serviceSectionWrapper}>
            <Container fluid="xl" className={styles.sectionContainer}>
              <div className={styles.serviceSection}>
                <h2 className={styles.serviceTitle}>
                  Pilih Layanan Sesuai Kebutuhan Anda
                </h2>
                <p className={styles.serviceSubtitle}>
                  Pilih layanan yang Anda butuhkan dan rasakan manfaat nyata
                  dari konsultasi online, offline, atau terapi mandiri.
                </p>

                <Row className={styles.cardRow}>
                  <Col md={6} lg={4} className="mb-4 d-flex">
                    <div className={`${styles.cardBox} d-flex flex-column`}>
                      <div className={styles.imagePlaceholder}>
                        <Image
                          src="/assets/gambar-daftar-konsultasi-online.png"
                          alt="Konsultasi Online"
                          // layout="fill"
                          objectFit="cover"
                          width={240}
                          height={10}
                        />
                      </div>
                      <h3 className={styles.cardTitle}>
                        Daftar Konsultasi Online
                      </h3>
                      <p className={styles.cardText}>
                        Pilih psikolog dan jadwal yang sesuai untuk sesi
                        konsultasi kesehatan mental secara online.
                      </p>
                      <Button
                        variant="primary"
                        className={`${styles.primaryButton} mt-auto`}
                        href="/mahasiswa/konsultasionline"
                      >
                        Daftar
                      </Button>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-4 d-flex">
                    <div className={`${styles.cardBox} d-flex flex-column`}>
                      <div className={styles.imagePlaceholder}>
                        <Image
                          src="/assets/gambar-daftar-konsultasi-offline.png"
                          alt="Konsultasi Offline"
                          // layout="fill"
                          objectFit="cover"
                          width={240}
                          height={10}
                        />
                      </div>
                      <h3 className={styles.cardTitle}>
                        Daftar Konsultasi Offline
                      </h3>
                      <p className={styles.cardText}>
                        Konsultasikan kesehatan mental Anda secara langsung
                        melalui konsultasi offline bersama psikolog dari SHCC
                        ITS.
                      </p>
                      <Button
                        variant="primary"
                        className={`${styles.primaryButton} mt-auto`}
                        href="/mahasiswa/konsultasioffline"
                      >
                        Daftar
                      </Button>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-4 d-flex">
                    <div className={`${styles.cardBox} d-flex flex-column`}>
                      <div className={styles.imagePlaceholder}>
                        <Image
                          src="/assets/gambar-terapi-mandiri.png"
                          alt="Terapi Mandiri"
                          // layout="fill"
                          objectFit="cover"
                          width={240}
                          height={10}
                        />
                      </div>
                      <h3 className={styles.cardTitle}>Lagu Tenang</h3>
                      <p className={styles.cardText}>
                        Mendengarkan lagu tenang pilihan anda untuk mendukung
                        kesehatan mental Anda.
                      </p>
                      <Button
                        variant="primary"
                        className={`${styles.primaryButton} mt-auto`}
                        href="/mahasiswa/lagutenang"
                      >
                        Mulai
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
