import Head from "next/head";
import Image from "next/image";
import { LoginForm } from "@/components/AuthForm/SignInForm";
import styles from "./SignInPage.module.css";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign in | ITS-OK</title>
        <meta name="description" content="Login page for ITS-OK app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>

      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.formWrapper}>
            <LoginForm />
          </div>
        </div>
        <div className={styles.right}>
          <Image
            src="/assets/foto_psikolog_login.png"
            alt="Ilustrasi Psikolog"
            width={600}
            height={600}
            className={styles.image}
            priority
          />
        </div>
      </div>
    </>
  );
}
