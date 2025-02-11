import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { AppSidebar } from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="m-2 w-full">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 shadow">
          {/* SearchBar */}
          <div className="ml-auto"></div>
          <UserButton
            appearance={{
              elements: {
                footer: "hidden",
              },
            }}
          />
        </div>
        <div className="h-4"></div>
        <div className="h-[calc(100vh-10rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
