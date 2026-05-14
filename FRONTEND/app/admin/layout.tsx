"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type Session = {
  id?: string;
  name?: string;
  email?: string;
  role?: "customer" | "admin";
};

const NAV_ITEMS: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <path d="M3 12 12 4l9 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Productos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <path d="M3 7h18l-1.5 12a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z" strokeLinejoin="round" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Órdenes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <path d="M8 3h8l3 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8l3-5Z" strokeLinejoin="round" />
        <path d="M5 8h14M9 13h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
        <path d="M16 11.5a3 3 0 1 0 0-6M21 20a5.5 5.5 0 0 0-4-5.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("session");
    if (!token || !raw) {
      router.replace("/login");
      return;
    }
    try {
      const s = JSON.parse(raw) as Session;
      if (s.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      setSession(s);
      setChecked(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Verificando acceso…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--uv-red)]/10 text-[var(--uv-red)] text-[11px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--uv-red)]" />
              Admin
            </span>
            <p className="mt-3 text-[15px] font-semibold tracking-display text-black">
              {session?.name ?? "Administrador"}
            </p>
            <p className="text-[12px] text-gray-500 truncate">{session?.email}</p>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 h-10 rounded-md text-[14px] transition-colors ${
                    active
                      ? "bg-[var(--uv-red)] text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/products"
              className="text-[13px] text-gray-500 hover:text-black inline-flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" strokeWidth={1.8} stroke="currentColor">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver a la tienda
            </Link>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
