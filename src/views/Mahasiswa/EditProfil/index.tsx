/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Form, Button } from "react-bootstrap";
import Spinner from "@/components/Spinner/Mahasiswa";
import SuccessEdit from "@/components/Modal/SuccesEditProfil";
import styles from "./edit-profil-mhs.module.css";
import DashboardLayout from "@/layouts/dashboard";

export default function EditProfilMahasiswa() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    jenis_kelamin: "",
    usia: "",
    jurusan_mahasiswa: "",
  });

  const [initialData, setInitialData] = useState(formData);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mahasiswa/editprofil");
        const data = await res.json();
        if (res.ok && data.data) {
          setFormData(data.data);
          setInitialData(data.data);
        } else {
          alert("Gagal ambil data: " + data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/mahasiswa/editprofil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setInitialData(formData);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/mahasiswa/edit-profil");
        }, 2000);
      } else {
        alert("Gagal update: " + result.message);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Terjadi kesalahan saat update");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profil Mahasiswa | ITS-OK</title>
        <meta name="description" content="Halaman edit profil mahasiswa" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <SuccessEdit show={showSuccess} />
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>Edit Profil</h2>
          </div>
          <div className={styles.formWrapper}>
            <div className={styles.formContainer}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className={styles.formLabel}>EMAIL</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label className={styles.formLabel}>USERNAME</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicGender">
                  <Form.Label className={styles.formLabel}>
                    JENIS KELAMIN
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      formData.jenis_kelamin === "L"
                        ? "Laki-laki"
                        : formData.jenis_kelamin === "P"
                        ? "Perempuan"
                        : ""
                    }
                    disabled
                    readOnly
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicAge">
                  <Form.Label className={styles.formLabel}>UMUR</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.usia}
                    onChange={(e) =>
                      handleChange("usia", Number(e.target.value))
                    }
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicJurusan">
                  <Form.Label className={styles.formLabel}>JURUSAN</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.jurusan_mahasiswa}
                    onChange={(e) =>
                      handleChange("jurusan_mahasiswa", e.target.value)
                    }
                    className={styles.formControl}
                  />
                </Form.Group>

                <p className={styles.notes}>
                  * Apabila anda telah melakukan edit profil, diharapkan untuk
                  Sign Out dan Sign In kembali untuk memperbarui data
                </p>

                <div className={styles.buttonContainer}>
                  <Button
                    variant="primary"
                    type="submit"
                    className={styles.saveButton}
                    disabled={!hasChanged}
                  >
                    Simpan
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
