"use client"

import { useState } from "react"
import { IconLogout } from "@tabler/icons-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import LogoutConfirmation from "@/components/Modal/Logout"
import styles from "@/components/Sidebar/Mahasiswa/app-sidebar.module.css"

export function NavUser() {
  const [showLogout, setShowLogout] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)

  const handleCloseLogout = () => setShowLogout(false)

  const handleClickLogout = async () => {
    try {
      setLoadingLogout(true)

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Gagal logout")
      }

      // Redirect ke halaman login
      window.location.href = "/auth/signin"
    } catch (error) {
      console.error("Logout error:", error)
      alert("Gagal logout. Silakan coba lagi.")
    } finally {
      setLoadingLogout(false)
      setShowLogout(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => setShowLogout(true)}
            className={`${styles.sidebarMenu} ${styles.logoutButton}`}
          >
            <IconLogout className="mr-2 size-4" />
            Keluar
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <LogoutConfirmation
        show={showLogout}
        loading={loadingLogout}
        onCancel={handleCloseLogout}
        onConfirm={handleClickLogout}
      />
    </>
  )
}
