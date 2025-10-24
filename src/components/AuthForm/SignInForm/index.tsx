// components/AuthForm/SignInForm.tsx
import { cn } from "@/lib/utils";
import { Button } from "react-bootstrap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./signinform.module.css";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    roles: number;
  };
  redirectUrl: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  // State untuk form data
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error saat user mulai mengetik
    if (error) setError("");
  };

  // Handle submit form login
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Login berhasil
        console.log("Login berhasil:", data);

        // Redirect ke halaman yang sesuai berdasarkan role
        await router.push(data.redirectUrl);
      } else {
        // Login gagal, tampilkan error
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    console.log("Sign Up button clicked");
    router.push("/auth/signup");
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Selamat Datang!!</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Masukkan email Anda untuk masuk ke akun
        </p>
      </div>

      <div className="grid gap-6">
        {/* Error message */}
        {error && (
          <div className={styles.errorBox}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Masukkan email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Masukkan password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
        </div>

        {/* Tombol Sign In */}
        <Button
          type="submit"
          className={styles.buttonSignIn}
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign In"}
        </Button>

        {/* Separator */}
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Belum punya akun? daftar disini
          </span>
        </div>

        {/* Tombol Sign Up */}
        <Button
          type="button"
          className={styles.buttonSignUp}
          onClick={handleSignUp}
        >
          Sign Up
        </Button>
      </div>
    </form>
  );
}
