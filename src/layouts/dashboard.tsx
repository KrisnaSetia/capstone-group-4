import { SidebarProvider} from "@/components/ui/sidebar";
import {SiteHeader} from "@/components/SiteHeader";
import { AppSidebar } from "@/components/Sidebar/Mahasiswa";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 h-screen overflow-hidden"> 
          <SiteHeader /> 
          <div className="flex-1 overflow-y-auto"> 
            <main> 
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
