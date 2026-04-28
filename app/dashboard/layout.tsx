"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Library",   href: "/dashboard/learn", icon: BookOpen, exact: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* TopBar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 48,
          background: "color-mix(in oklch, var(--bg) 88%, transparent)",
          backdropFilter: "blur(8px)",
          borderBottom: "0.5px solid var(--bd)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 280px",
            alignItems: "center",
            gap: 16,
            padding: "0 24px",
            height: "100%",
          }}
        >
          {/* Left — logo */}
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: 5,
                background: "var(--ink)", color: "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font-serif)", fontStyle: "italic",
                flexShrink: 0,
              }}
            >
              M
            </div>
            <span style={{ fontWeight: 600, letterSpacing: "-0.02em", fontSize: 14, color: "var(--ink)" }}>
              MEnglish
            </span>
            <span
              style={{
                fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--mut)",
                padding: "1px 5px", border: "0.5px solid var(--bd)", borderRadius: 3,
                letterSpacing: "0.04em",
              }}
            >
              BETA
            </span>
          </Link>

          {/* Center — nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 10px", borderRadius: 5,
                    fontSize: 12, fontWeight: 500,
                    background: isActive ? "var(--mut2)" : "transparent",
                    color: isActive ? "var(--ink)" : "var(--mut)",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <Icon size={13} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right — search + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, maxWidth: 200 }}>
              <Search
                size={12}
                style={{
                  position: "absolute", left: 8, top: "50%",
                  transform: "translateY(-50%)", color: "var(--mut)",
                }}
              />
              <input
                placeholder="Search words, sets…"
                style={{
                  width: "100%",
                  background: "var(--mut2)",
                  border: "0.5px solid var(--bd)",
                  borderRadius: 5,
                  padding: "5px 40px 5px 26px",
                  fontSize: 11,
                  fontFamily: "var(--font-sans)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <div
                style={{
                  position: "absolute", right: 6, top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex", gap: 2,
                }}
              >
                {["⌘", "K"].map((k) => (
                  <kbd
                    key={k}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "1px 4px", borderRadius: 2,
                      border: "0.5px solid var(--bd)", background: "var(--bg)",
                      fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--mut)",
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>

            {/* Settings */}
            <button
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: 5,
                border: "0.5px solid var(--bd)", background: "transparent",
                color: "var(--mut)", cursor: "pointer",
              }}
              title="Settings"
            >
              <Settings size={13} />
            </button>

            {/* Logout (avatar-style button) */}
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: "50%",
                background: "color-mix(in oklch, var(--acc) 20%, var(--bg))",
                color: "var(--acc)",
                border: "0.5px solid var(--bd)",
                fontSize: 10, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <LogOut size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
