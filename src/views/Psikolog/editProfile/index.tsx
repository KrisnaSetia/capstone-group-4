import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Form, Button } from "react-bootstrap";
import Spinner from "@/components/Spinner/Psikolog";
import SuccessEdit from "@/components/Modal/SuccesEditProfil"; // pastikan path sesuai
import styles from "./editprofile-psi.module.css";
import DashboardLayout from "@/layouts/dashboard-psi";

export default function EditProfilePsikolog() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    jenis_kelamin: "",
    usia: "",
    nomor_sertifikasi: "",
    deskripsi: "",
  });
  const [initialData, setInitialData] = useState(formData);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false); // ← NEW

  const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/psikolog/editprofil");
        const data = await res.json();
        if (res.ok && data.data) {
          const {
            email,
            username,
            jenis_kelamin,
            usia,
            nomor_sertifikasi,
            deskripsi,
          } = data.data;

          const newData = {
            email,
            username,
            jenis_kelamin,
            usia,
            nomor_sertifikasi,
            deskripsi,
          };

          setFormData(newData);
          setInitialData(newData);
        } else {
          console.error("Gagal ambil data profil:", data.message);
        }
      } catch (error) {
        console.error("Error fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/psikolog/editprofil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setInitialData(formData); // Reset perubahan
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/psikolog/editprofile");
        }, 2000); // ← Tampilkan modal sukses
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
        <title>Pengaturan - Edit Profil | ITS-OK</title>
        <meta name="description" content="Edit profil psikolog ITS-OK." />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <SuccessEdit show={showSuccess} /> {/* Modal */}
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.sectionTitleWrapper}>
              <h2 className={styles.pageTitle}>Edit Profil</h2>
            </section>
            <div className={styles.formContainer}>
              <Form className={styles.profileForm} onSubmit={handleSubmit}>
                <Form.Group className={styles.formGroup} controlId="formEmail">
                  <Form.Label className={styles.formLabel}>EMAIL</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group
                  className={styles.formGroup}
                  controlId="formUsername"
                >
                  <Form.Label className={styles.formLabel}>USERNAME</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group className={styles.formGroup} controlId="formGender">
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

                <Form.Group className={styles.formGroup} controlId="formUmur">
                  <Form.Label className={styles.formLabel}>UMUR</Form.Label>
                  <Form.Control
                    type="number"
                    min={18}
                    max={99}
                    value={formData.usia}
                    onChange={(e) =>
                      setFormData({ ...formData, usia: e.target.value })
                    }
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group className={styles.formGroup} controlId="formSertif">
                  <Form.Label className={styles.formLabel}>
                    NOMOR SERTIFIKASI
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nomor_sertifikasi}
                    disabled
                    className={styles.formControl}
                  />
                </Form.Group>

                <Form.Group
                  className={styles.formGroup}
                  controlId="formDeskripsi"
                >
                  <Form.Label className={styles.formLabel}>
                    DESKRIPSI PROFIL
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    className={styles.formControl}
                  />
                </Form.Group>
                <p className={styles.notes}>
                  * Apabila anda telah melakukan edit profil, diharapkan untuk
                  Sign Out dan Sign In kembali untuk memperbarui data
                </p>
                <div className="d-flex justify-content-end mt-4">
                  <Button
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
