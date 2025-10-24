/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Button, Row, Col, Form } from "react-bootstrap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./signupform.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

export function SignUpForm({ ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const [gender, setGender] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    usia: "",
    jurusan: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          usia: Number(formData.usia),
          jenis_kelamin: gender,
          jurusan: formData.jurusan,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Terjadi kesalahan saat registrasi.");
      } else {
        router.push("/auth/signin");
      }
    } catch (err) {
      setError("Gagal mengirim permintaan. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className={styles.h1}>Daftar Akun ITS OK</h1>
        <p className="text-muted-foreground text-sl text-balance">
          Masukkan email & identitas kamu dulu ya!
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required onChange={handleChange} />
        </div>

        {/* Username */}
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" required onChange={handleChange} />
        </div>

        {/* Jenis Kelamin */}
        <div className="grid gap-2">
          <Label>Jenis Kelamin</Label>
          <div className="flex flex-row gap-6 mt-1">
            <Form.Check
              inline
              label="Laki-laki"
              name="gender"
              type="radio"
              id="gender-male"
              checked={gender === "Laki-laki"}
              onChange={() => setGender("Laki-laki")}
              required
            />
            <Form.Check
              inline
              label="Perempuan"
              name="gender"
              type="radio"
              id="gender-female"
              checked={gender === "Perempuan"}
              onChange={() => setGender("Perempuan")}
              required
            />
          </div>
        </div>

        {/* Umur */}
        <div className="grid gap-3">
          <Label htmlFor="usia">Umur</Label>
          <Input
            id="usia"
            type="number"
            min={1}
            max={100}
            required
            onChange={handleChange}
          />
        </div>

        {/* Jurusan */}
        <div className="grid gap-3">
          <Label htmlFor="jurusan">Jurusan</Label>
          <Input id="jurusan" type="text" required onChange={handleChange} />
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            onChange={handleChange}
          />
        </div>

        {/* Konfirmasi Password */}
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            onChange={handleChange}
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Button */}
        <Button
          type="submit"
          className={styles.buttonSignUp}
          disabled={loading}
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </Button>

        <div className="text-center text-sm">
          Sudah punya akun?{" "}
          <Link href="/auth/signin" passHref legacyBehavior>
            <Button variant="link" className={styles.loginLink}>
              Masuk, yuk!
            </Button>
          </Link>
        </div>
      </div>
    </form>
  );
}
