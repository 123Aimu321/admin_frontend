// app/principal/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PrincipalSidebar from "@/components/layout/principalSidebar";

export default function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, accessToken } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!loading && !user && !accessToken) {
      window.location.href = "/login";
    }
  }, [loading, user, accessToken]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR (fixed) */}
      <PrincipalSidebar
        collapsed={collapsed}
        onToggle={setCollapsed}
      />

      {/* MAIN CONTENT */}
      <main
        className={`
          flex-1 h-full overflow-hidden transition-all duration-300
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        {/* Page content wrapper */}
        <div className="h-full w-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
