import { Home, ClipboardList, UsersRound } from "lucide-react";
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
import styles from "./admin-sidebar.module.css";

// Menu Psikolog
const mainFeatures = [
  {
    title: "Beranda",
    url: "/admin/beranda",
    icon: Home,
  },
  {
    title: "Konsultasi Offline",
    url: "/admin/konsultasioffline",
    icon: UsersRound,
  },
  {
    title: "Manajemen Psikolog",
    url: "/admin/manajemenpsikolog",
    icon: ClipboardList,
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
                <span>ITS – OK</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Features</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={styles.sidebarFooter}>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
