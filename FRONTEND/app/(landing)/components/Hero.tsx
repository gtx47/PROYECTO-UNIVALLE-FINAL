'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">

      {/* Video de fondo */}
      <video
        className="absolute inset-0 w-full h-full object-cover brightness-50"
        autoPlay muted loop playsInline
      >
        <source src="/brand/campuscolor.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/60 via-transparent to-[#1A1A1A]/70" />

      {/* Línea roja decorativa */}
      <motion.div
        className="absolute left-12 top-1/2 -translate-y-1/2 w-0.5 bg-gradient-to-b from-transparent via-[#C92A2A] to-transparent"
        initial={{ height: 0 }}
        animate={{ height: 160 }}
        transition={{ duration: 1.2, delay: 1, ease: 'easeOut' }}
      />

      {/* Contenido */}
      <div className="relative z-10 text-center flex flex-col items-center gap-4 px-8">

        <motion.p
          className="font-body flex items-center gap-3 text-[10px] tracking-[0.28em] uppercase text-white/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="w-5 h-px bg-white/25" />
          Tienda oficial · 2026
          <span className="w-5 h-px bg-white/25" />
        </motion.p>

        <motion.h1
          className="font-display font-bold text-[#FAFAF8]/90 leading-[1.1] tracking-tight max-w-2xl"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
        >
          Todo lo que necesitas para<br />
          <em className="not-italic text-[#C92A2A]">tu vida universitaria</em>
        </motion.h1>

        <motion.p
          className="font-body text-[#FAFAF8]/85 leading-relaxed max-w-sm"
          style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
        >
          Ropa, libros, papelería y más.<br />Todo oficial, todo Univalle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1 }}
          className="mt-2"
        >
          <Link
            href="/catalog"
            className="font-body inline-block text-[11px] tracking-[0.14em] uppercase text-[#FAFAF8] border border-white/60 px-6 py-3 rounded-sm hover:bg-white/10 hover:border-white transition-all duration-300"
          >
            Explorar catálogo →
          </Link>
        </motion.div>
      </div>

      {/* Indicador scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <span className="font-body text-[9px] tracking-[0.22em] uppercase text-white/25">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[#C92A2A]/60 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Difuminado hacia ProductosDestacados */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent, #1A1A1A)',
        }}
      />

    </section>
  );
}