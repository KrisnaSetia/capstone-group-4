import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
// import NavDropdown from "react-bootstrap/NavDropdown";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
// import Link from "next/link";

function TopNavbar() {
  const router = useRouter();
  const handleSignIn = () => {
    console.log("Sign In button clicked");
    router.push("/auth/signin"); // Redirect to sign-in page
  }
  const handleSignUp = () => {
    console.log("Sign Up button clicked");
    router.push("/auth/signup"); // Redirect to sign-in page
  }
  return (
    <Navbar expand="lg" className={styles.navbar}>
      <Container fluid>
        <Navbar.Brand href="/" className={styles.brand}>
          <Image
            src="/logo-itsok.png" // pastikan kamu punya /public/logo.png
            alt="ITS-OK Logo"
            width={60}
            height={60}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className={styles.collapse}>
          <strong>
            <Nav.Link href="/" className={styles.brandText}>
              ITS - OK
            </Nav.Link>
          </strong>
          <div className={styles.navRight}>
            <Nav className={styles.navItems} navbarScroll>
              <Nav.Link href="#beranda" className={styles.navLink}>
                Beranda
              </Nav.Link>
              <Nav.Link href="#fitur" className={styles.navLink}>
                Fitur
              </Nav.Link>
              <Nav.Link href="#mitra" className={styles.navLink}>
                Mitra Kami
              </Nav.Link>
              <Nav.Link href="#funfact" className={styles.navLink}>
                Fakta Menarik
              </Nav.Link>
              <Nav.Link href="https://instagram.com/nischaverta" className={styles.navLink} target="_blank" rel="noopener noreferrer">
                Tentang Kami
              </Nav.Link>
            </Nav>
          </div>
        </Navbar.Collapse>
            <div className={styles.buttonGroup}>
              <Button
                className={styles.primaryButton}
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button className={styles.secondaryButton} onClick={handleSignUp}>Sign Up</Button>
            </div>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
