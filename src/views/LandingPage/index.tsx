import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import styles from "./HomePage.module.css";
import Container from "react-bootstrap/Container";
import { Row, Col, Button } from "react-bootstrap";
import Navbar from "@/components/Navbar";
import Image from "next/image";

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

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Website ITS – OK</title>
        <meta
          name="description"
          content="Platform kesehatan mental untuk mahasiswa ITS"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <Navbar />
      {/* Section 1 */}
      <Container fluid className={styles.heroSection} id="beranda">
        <FadeInSection>
          <Row className={styles.rowSection}>
            {/* KIRI */}
            <Col md={6} className={styles.textArea}>
              <h1 className={styles.title}>
                Selamat datang di
                <br />
                ITS – OK
              </h1>
              <p className={styles.subtitle}>
                Aplikasi kesehatan mental untuk mahasiswa Institut Teknologi
                Sepuluh Nopember
              </p>
              <div className={styles.buttonGroup}>
                <Button className={styles.primaryBtn} href="/auth/signin">
                  Mulai Sekarang
                </Button>
                <Button
                  className={styles.secondaryBtn}
                  onClick={() =>
                    window.open("https://instagram.com/nischaverta", "_blank")
                  }
                >
                  Tentang Kami
                </Button>
              </div>
            </Col>
            {/* KANAN */}
            <Col md={6} className={styles.imageArea}>
              <div className={styles.imageBackground}>
                <Image
                  src="/assets/foto_psikolog_landingpage1.png"
                  alt="Ilustrasi Psikolog"
                  className={styles.heroImage}
                  width={450}
                  height={450}
                  priority
                />
              </div>
            </Col>
          </Row>
        </FadeInSection>
      </Container>
      {/* Section 2 */}
      <Container fluid className={styles.infoSection} id="fitur">
        <FadeInSection>
          <Row className={styles.rowSection}>
            {/* KIRI */}
            <Col md={6} className={styles.imageArea}>
              <div className={styles.imageBackground}>
                <Image
                  src="/assets/foto_psikolog_landingpage2.png"
                  alt="Ilustrasi Psikolog"
                  className={styles.heroImage}
                  width={500}
                  height={500}
                  priority
                />
              </div>
            </Col>
            {/* KANAN */}
            <Col md={6} className={styles.textArea}>
              <h1 className={styles.title2}>
                Konsultasi Bersama <br /> Kami
              </h1>
              <p className={styles.subtitle2}>
                Dengan bantuan ahli, Anda dapat mengelola stres, <br />
                kecemasan, dan menemukan jalan menuju kesehatan <br />
                mental yang lebih baik.
              </p>
              <div className={styles.infoOptions}>
                <div className={styles.infoOption}>
                  <div className={styles.optionTitle}>Online</div>
                  <div className={styles.optionDesc}>
                    Konsultasi fleksibel
                    <br />
                    melalui Zoom dari mana saja,
                    <br /> kapan saja.
                  </div>
                </div>
                <div className={styles.infoOption}>
                  <div className={styles.optionTitle}>Offline</div>
                  <div className={styles.optionDesc}>
                    Sesi tatap muka untuk interaksi lebih personal
                    <br /> dan mendalam.
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </FadeInSection>
      </Container>
      {/* Section 3 */}
      <FadeInSection>
        <Container fluid className={styles.heroSection} id="mitra">
          <Row className={styles.rowSection}>
            {/* KIRI */}
            <Col md={6} className={styles.textArea}>
              <h1 className={styles.title3}>
                Kenal Lebih Dekat
                <br />
                Dengan Mitra Kami
              </h1>
              <p className={styles.subtitle}>
                Kenali mitra profesional terbaik kami yang siap
                <br />
                mendampingi Anda dengan layanan konsultasi terpercaya.
              </p>
              <div className={styles.buttonGroup}>
                <Button className={styles.primaryBtn2} href="/auth/signin">
                  Mitra Kami
                </Button>
                <Button className={styles.secondaryBtn2} href="/auth/signup">
                  Sign Up Sekarang
                </Button>
              </div>
            </Col>
            {/* KANAN */}
            <Col md={6} className={styles.imageArea}>
              <div className={styles.imageBackground3}>
                <Image
                  src="/assets/foto_psikolog_landingpage3.png"
                  alt="Ilustrasi Psikolog"
                  className={styles.heroImage}
                  width={450}
                  height={450}
                  priority
                />
              </div>
            </Col>
          </Row>
        </Container>
      </FadeInSection>
      {/* Section 4 */}
      <Container fluid className={styles.infoSection2} id="funfact">
        <FadeInSection>
          <Row className={styles.rowSection}>
            {/* KIRI */}
            <Col md={6} className={styles.imageArea}>
              <div className={styles.imageBackground}>
                <Image
                  src="/assets/foto_psikolog_landingpage4.png"
                  alt="Ilustrasi Psikolog"
                  className={styles.heroImage}
                  width={450}
                  height={450}
                  priority
                />
              </div>
            </Col>
            {/* KANAN */}
            <Col md={6} className={styles.textArea}>
              <h1 className={styles.title4}>
                Sehat Mental <br /> Sehat Jasmani
              </h1>
              <p className={styles.subtitle4}>
                Penting untuk merawat kesehatan mental setiap hari, <br />
                sama seperti kita merawat kesehatan fisik.
              </p>
              <h2 className={styles.title4kedua}>Jaga Kesehetan Mental Anda</h2>
              <p className={styles.subtitle4}>
                Dengan menjaga kesehatan mental, kita dapat meningkatkan <br />
                produktivitas, hubungan sosial, dan kualitas hidup secara <br />
                keseluruhan.
              </p>
            </Col>
          </Row>
        </FadeInSection>
      </Container>
      {/* Section CTA Akhir */}
      <div className={styles.ctaSection}>
        <FadeInSection>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Buat akun Anda hari ini dan <br /> mulailah secara gratis!
            </h2>
            <div className={styles.ctaButtonGroup}>
              <Button className={styles.ctaPrimaryBtn} href="/auth/signup">
                Sign Up Sekarang
              </Button>
              <Button
                className={styles.ctaSecondaryBtn}
                onClick={() =>
                  window.open("mailto:gptilkom@gmail.com", "_blank")
                }
              >
                Kontak
              </Button>
            </div>
          </div>
        </FadeInSection>
      </div>
      <footer className={styles.footer}>
        Copyright © 2025 ITS – OK | All Rights Reserved
      </footer>
    </>
  );
}
