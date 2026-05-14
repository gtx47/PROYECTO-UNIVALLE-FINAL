"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { apiFetch } from "@/app/lib/api";

type Session = {
  id?: string;
  name?: string;
  email?: string;
  role?: "customer" | "admin";
};

type Order = { id: string; status: string };

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("session");
    if (!token || !raw) {
      router.replace("/login");
      return;
    }
    try {
      setSession(JSON.parse(raw));
    } catch {
      router.replace("/login");
      return;
    }

    (async () => {
      const r = await apiFetch<Order[]>("/api/orders");
      if (r.ok) setOrderCount((r.data ?? []).length);
      setLoading(false);
    })();
  }, [router]);

  const isAdmin = session?.role === "admin";
  const initial = (session?.name ?? "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full flex-1">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            Mi cuenta
          </span>
          <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
            Hola, {session?.name?.split(" ")[0] ?? "estudiante"}
          </h1>
          <p className="text-gray-500 mt-2">
            Gestiona tu perfil y revisa el estado de tus pedidos.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="block mb-10 group relative overflow-hidden rounded-2xl bg-[var(--uv-red)] text-white p-8 hover:bg-[var(--uv-red-dark)] transition-colors"
          >
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-semibold uppercase tracking-wider mb-3">
                  Acceso exclusivo
                </span>
                <h2 className="text-2xl font-semibold tracking-display">
                  Panel de administrador
                </h2>
                <p className="text-white/80 text-sm mt-2 max-w-md leading-relaxed">
                  Gestiona productos, órdenes y usuarios. Revisa las métricas
                  del negocio en tiempo real.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-white text-[var(--uv-red)] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Entrar al panel
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={2} stroke="currentColor">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="border border-gray-100 rounded-2xl p-8">
            <h3 className="text-[13px] uppercase tracking-wider text-gray-500 mb-5">
              Mi perfil
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-black">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-display text-black truncate">
                  {session?.name ?? "—"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {session?.email ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">Rol</span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--uv-red)]/10 text-[var(--uv-red)] text-[11px] font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--uv-red)]" />
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold uppercase tracking-wider">
                  Cliente
                </span>
              )}
            </div>
          </section>

          <section className="border border-gray-100 rounded-2xl p-8 flex flex-col">
            <h3 className="text-[13px] uppercase tracking-wider text-gray-500 mb-5">
              Mis pedidos
            </h3>
            <div className="flex-1">
              <p className="text-4xl font-semibold tracking-display text-black">
                {loading ? "—" : orderCount ?? 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {orderCount === 1 ? "pedido realizado" : "pedidos realizados"}
              </p>
            </div>
            <Link
              href="/orders"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-black hover:text-[var(--uv-red)] transition-colors"
            >
              Ver historial
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" strokeWidth={2} stroke="currentColor">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
