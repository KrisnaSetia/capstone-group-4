import Head from "next/head";
import Image from "next/image";
import { SignUpForm } from "@/components/AuthForm/SignUpForm";
import styles from "./SignUpPage.module.css"; // Import CSS module

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up | ITS-OK</title>
        <meta name="description" content="Sign Up ITS-OK" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* --- Gambar di kiri --- */}
          <div className={styles.imageColumn}>
            <Image
              src="/assets/foto_psikolog_signup.png"
              alt="Psikolog SignUp"
              className={styles.signupImage}
              width={1000}
              height={2000}
              priority
            />
          </div>
          {/* --- Form di kanan --- */}
          <div className={styles.formColumn}>
            <SignUpForm />
          </div>
        </div>
      </div>
    </>
  );
}