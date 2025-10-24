import { Home, Video, UsersRound, History, Settings, AudioLines} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import styles from "./app-sidebar.module.css";

// Semua fitur utama (termasuk Beranda)
const mainFeatures = [
  {
    title: "Beranda",
    url: "/mahasiswa/beranda",
    icon: Home,
  },
  {
    title: "Konsultasi Online",
    url: "/mahasiswa/konsultasionline",
    icon: Video,
  },
  {
    title: "Konsultasi Offline",
    url: "/mahasiswa/konsultasioffline",
    icon: UsersRound,
  },
  {
    title: "Riwayat Pesanan",
    url: "/mahasiswa/riwayatpesanan",
    icon: History,
  },
  {
    title: "Lagu Tenang",
    url: "/mahasiswa/lagutenang",
    icon: AudioLines,
  },
];

const pengaturan = [
  {
    title: "Edit Profil",
    url: "/mahasiswa/edit-profil",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { pathname } = router;

  return (
    <Sidebar>
      <SidebarHeader className={styles.sidebarHeader}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={styles.sidebarMenuItem}>
              <a href="#" className={styles.sidebarMenuButton}>
                <Image
                  src="/head-itsok.png"
                  alt="Logo"
                  width={35}
                  height={35}
                  className={styles.logo}
                />
                <span>ITS - OK</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Main Features */}
            <SidebarGroupLabel>Main Features</SidebarGroupLabel>
            <SidebarMenu>
              {mainFeatures.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`${styles.sidebarMenu} ${
                        pathname.startsWith(item.url) ? styles.active : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Pengaturan */}
            <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
            <SidebarMenu>
              {pengaturan.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`${styles.sidebarMenu} ${
                        pathname.startsWith(item.url) ? styles.active : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={styles.sidebarFooter}>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  );
}