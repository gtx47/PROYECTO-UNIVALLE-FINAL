'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/app/lib/cart';

type Session = { name?: string; role?: string };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('session');
      if (raw) setSession(JSON.parse(raw));
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('token');
    setSession(null);
    router.push('/');
  };

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const solid = !isHome || scrolled;

  const navBg = !isHome
    ? 'bg-[#FAFAF8] border-[#E8E6E2]'
    : scrolled
      ? 'bg-[#F7F4EF] border-[#2A323D]/10'
      : 'bg-transparent border-white/20';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center px-12 py-4 border-b transition-all duration-500 ${navBg}`}>

      {/* Logo */}
      <Link href="/" className={`flex items-center gap-2 transition-colors duration-500`}>
        <img
          src="/brand/logo-univalle-EDITADO.png"
          alt="Universidad del Valle"
          className="h-8 w-auto flex-shrink-0"
        />
        <span className={`font-display font-bold text-sm tracking-widest uppercase ${solid ? 'text-[#2A323D]' : 'text-[#F7F4EF]'}`}
          style={{ fontSize: '0.95rem', letterSpacing: '0.06em' }}>
          Tienda Univalle
        </span>
      </Link>

      {/* Centro — navegación */}
      <div className="flex justify-center items-center gap-3">
        <Link href="/catalog" className={`font-body text-xs tracking-widest uppercase border rounded px-3 py-1.5 transition-all duration-300 ${
          solid
            ? 'text-[#2A323D]/70 border-[#2A323D]/20 hover:text-[#2A323D] hover:border-[#2A323D]/50'
            : 'text-white/80 border-white/20 hover:text-white hover:border-white/50'
        }`}>
          Catálogo
        </Link>
        <Link href="/recommendations" className={`font-body text-xs tracking-widest uppercase border rounded px-3 py-1.5 transition-all duration-300 ${
          solid
            ? 'text-[#2A323D]/70 border-[#2A323D]/20 hover:text-[#2A323D] hover:border-[#2A323D]/50'
            : 'text-white/80 border-white/20 hover:text-white hover:border-white/50'
        }`}>
          Para ti
        </Link>
      </div>

      {/* Derecha — sesión + carrito */}
      <div className="flex items-center justify-end gap-6">
        {mounted && (
          session ? (
            <>
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`font-body text-xs tracking-widest uppercase px-3 py-1.5 rounded transition-all duration-300 ${
                    solid
                      ? 'bg-[#C92A2A] text-white hover:bg-[#a82020]'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`font-body text-xs tracking-widest uppercase transition-colors duration-300 flex items-center gap-2 ${solid ? 'text-[#2A323D]/70 hover:text-[#2A323D]' : 'text-white/70 hover:text-white'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${solid ? 'bg-[#2A323D]/10 text-[#2A323D]' : 'bg-white/20 text-white'}`}>
                  {(session.name ?? 'U').charAt(0).toUpperCase()}
                </span>
                {session.name?.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                className={`font-body text-xs tracking-widest uppercase transition-colors duration-300 ${solid ? 'text-[#2A323D]/60 hover:text-[#C92A2A]' : 'text-white/70 hover:text-white'}`}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`font-body text-xs tracking-widest uppercase transition-colors duration-300 ${solid ? 'text-[#2A323D]/60 hover:text-[#2A323D]' : 'text-white/70 hover:text-white'}`}>
                Iniciar sesión
              </Link>
              <Link href="/register" className={`font-body text-xs tracking-widest uppercase transition-colors duration-300 ${solid ? 'text-[#2A323D]/60 hover:text-[#2A323D]' : 'text-white/70 hover:text-white'}`}>
                Registro
              </Link>
            </>
          )
        )}
        <Link href="/cart" className="relative" aria-label="Carrito">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-colors duration-300 ${solid ? 'stroke-[#2A323D]' : 'stroke-white/80'}`}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {mounted && totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[#C92A2A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
