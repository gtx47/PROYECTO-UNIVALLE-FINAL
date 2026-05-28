'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/(landing)/components/Navbar';
import Footer from '@/app/(landing)/components/Footer';
import { apiFetch } from '@/app/lib/api';

type Session = { id?: string; name?: string; email?: string; role?: 'customer' | 'admin' };
type Order = { id: string; status: string };

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('session');
    if (!token || !raw) { router.replace('/login'); return; }
    try { setSession(JSON.parse(raw)); } catch { router.replace('/login'); return; }
    (async () => {
      const r = await apiFetch<Order[]>('/api/orders');
      if (r.ok) setOrderCount((r.data ?? []).length);
      setLoading(false);
    })();
  }, [router]);

  const isAdmin = session?.role === 'admin';
  const initial = (session?.name ?? 'U').charAt(0).toUpperCase();
  const firstName = session?.name?.split(' ')[0] ?? 'estudiante';

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20 w-full">

        {/* Header */}
        <div className="mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[#6B6B6B] mb-1">Mi cuenta</p>
          <h1 className="font-display font-bold text-[#1A1A1A]" style={{ fontSize: 'clamp(26px, 4vw, 36px)', letterSpacing: '-0.025em' }}>
            Hola, {firstName}
          </h1>
          <p className="font-body text-[14px] text-[#6B6B6B] mt-1">
            Gestiona tu perfil y revisa el estado de tus pedidos.
          </p>
        </div>

        {/* Banner admin */}
        {isAdmin && (
          <Link
            href="/admin"
            className="group block mb-8 relative overflow-hidden rounded-md bg-[#C92A2A] text-white p-7 hover:bg-[#a82020] transition-colors duration-300"
          >
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 font-body text-[10px] font-bold uppercase tracking-[0.1em] mb-3">
                  Acceso exclusivo
                </span>
                <h2 className="font-display font-bold text-[20px]" style={{ letterSpacing: '-0.02em' }}>
                  Panel de administrador
                </h2>
                <p className="font-body text-[13px] text-white/75 mt-1.5 max-w-sm leading-relaxed">
                  Gestiona productos, órdenes y usuarios. Revisa las métricas del negocio en tiempo real.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 px-4 h-9 rounded-md bg-white text-[#C92A2A] font-body text-[12px] tracking-[0.08em] uppercase font-semibold group-hover:translate-x-1 transition-transform duration-200 shrink-0">
                Entrar al panel
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>
        )}

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* Perfil */}
          <section className="border border-[#E8E6E2] rounded-md p-6 bg-white">
            <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-5">Mi perfil</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-display font-bold text-[18px] shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-[16px] text-[#1A1A1A] truncate" style={{ letterSpacing: '-0.01em' }}>
                  {session?.name ?? '—'}
                </p>
                <p className="font-body text-[13px] text-[#6B6B6B] truncate mt-0.5">
                  {session?.email ?? '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-[#E8E6E2]">
              <span className="font-body text-[12px] text-[#6B6B6B]">Rol</span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C92A2A]/10 text-[#C92A2A] font-body text-[11px] font-semibold uppercase tracking-[0.08em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C92A2A]" />
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F0EFED] text-[#6B6B6B] font-body text-[11px] font-semibold uppercase tracking-[0.08em]">
                  Cliente
                </span>
              )}
            </div>
          </section>

          {/* Pedidos */}
          <section className="border border-[#E8E6E2] rounded-md p-6 bg-white flex flex-col">
            <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-5">Mis pedidos</p>
            <div className="flex-1">
              <p className="font-display font-bold text-[#1A1A1A]" style={{ fontSize: 'clamp(32px, 5vw, 42px)', letterSpacing: '-0.03em' }}>
                {loading ? '—' : (orderCount ?? 0)}
              </p>
              <p className="font-body text-[13px] text-[#6B6B6B] mt-1">
                {orderCount === 1 ? 'pedido realizado' : 'pedidos realizados'}
              </p>
            </div>
            <Link
              href="/orders"
              className="mt-6 inline-flex items-center gap-1.5 font-body text-[13px] font-semibold text-[#1A1A1A] hover:text-[#C92A2A] transition-colors group"
            >
              Ver historial
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </section>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { href: '/catalog', label: 'Catálogo',   desc: 'Explora todos los productos.' },
            { href: '/orders',  label: 'Órdenes',    desc: 'Revisa tus compras anteriores.' },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group border border-[#E8E6E2] rounded-md p-5 bg-white hover:border-[#C92A2A] transition-colors duration-200"
            >
              <p className="font-display font-bold text-[14px] text-[#1A1A1A] group-hover:text-[#C92A2A] transition-colors mb-0.5">
                {c.label}
              </p>
              <p className="font-body text-[12px] text-[#6B6B6B]">{c.desc}</p>
            </Link>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
}
