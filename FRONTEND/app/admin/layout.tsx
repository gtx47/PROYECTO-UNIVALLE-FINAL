'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Session = { id?: string; name?: string; email?: string; role?: 'customer' | 'admin' };

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <path d="M3 12 12 4l9 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/products',
    label: 'Productos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <path d="M3 7h18l-1.5 12a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z" strokeLinejoin="round" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Órdenes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" strokeWidth={1.7} stroke="currentColor">
        <path d="M8 3h8l3 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8l3-5Z" strokeLinejoin="round" />
        <path d="M5 8h14M9 13h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Usuarios',
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
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('session');
    if (!token || !raw) { router.replace('/login'); return; }
    try {
      const s = JSON.parse(raw) as Session;
      if (s.role !== 'admin') { router.replace('/dashboard'); return; }
      setSession(s);
      setChecked(true);
    } catch { router.replace('/login'); }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <p className="font-body text-[13px] text-[#6B6B6B]">Verificando acceso…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 border-r border-[#E8E6E2] bg-[#FAFAF8] sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#E8E6E2]">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-[#1A1A1A] text-[15px] tracking-wide uppercase">
              Tienda Univalle
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded bg-[#C92A2A]/10 text-[#C92A2A] text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C92A2A]" />
            Panel Admin
          </span>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-[#E8E6E2]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
              {(session?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-body text-[13px] text-[#1A1A1A] font-medium truncate">{session?.name}</p>
              <p className="font-body text-[11px] text-[#6B6B6B] truncate">{session?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 h-9 rounded-md font-body text-[13px] transition-colors duration-150 ${
                  active
                    ? 'bg-[#C92A2A] text-white'
                    : 'text-[#6B6B6B] hover:bg-[#F0EFED] hover:text-[#1A1A1A]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="px-6 py-4 border-t border-[#E8E6E2]">
          <Link href="/" className="font-body text-[12px] text-[#6B6B6B] hover:text-[#C92A2A] transition-colors inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" strokeWidth={1.8} stroke="currentColor">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-40 h-14 border-b border-[#E8E6E2] bg-[#FAFAF8] flex items-center px-6 gap-4">
          {/* Mobile nav label */}
          <div className="flex lg:hidden items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              if (!active) return null;
              return (
                <span key={item.href} className="font-display font-bold text-[14px] text-[#1A1A1A]">
                  {item.label}
                </span>
              );
            })}
          </div>
          <div className="flex-1" />
          <Link href="/" className="font-body text-[12px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            ← Tienda
          </Link>
        </header>

        <main className="flex-1 px-6 md:px-10 py-10 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
