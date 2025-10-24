import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100","200","300","400", "500","600","700","800","900"],
  display: "swap",
  style: ["normal", "italic"],
  fallback: ["system-ui", "sans-serif"],
  preload: true,
  variable: "--font-dm-sans",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={dmSans.className}>
      <Component {...pageProps} />
    </main>
  );
}
