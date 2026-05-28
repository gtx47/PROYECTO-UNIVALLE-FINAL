'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

type Column = {
  title: string;
  links: { label: string; href: string; icon?: typeof Instagram }[];
};

const COLUMNS: Column[] = [
  {
    title: 'Tienda',
    links: [
      { label: 'Catálogo', href: '/catalog' },
      { label: 'Colecciones', href: '#colecciones' },
      { label: 'Ofertas', href: '#' },
      { label: 'Novedades', href: '#' },
    ],
  },
  {
    title: 'Universidad',
    links: [
      { label: 'Sobre Univalle', href: '#' },
      { label: 'Contacto', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', href: '#', icon: Instagram },
      { label: 'Twitter', href: '#', icon: Twitter },
      { label: 'LinkedIn', href: '#', icon: Linkedin },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '#' },
      { label: 'Términos', href: '#' },
    ],
  },
];

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <footer
      ref={ref}
      className="relative isolate overflow-hidden bg-[#1A1A1A] text-[#FAFAF8]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 pt-24 pb-10 lg:pt-32">
        {/* Top */}
        <div className="grid grid-cols-12 gap-12 lg:gap-16">
          {/* Identidad izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 lg:col-span-5"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#C92A2A]" />
              <span
                className="font-body text-[11px] tracking-[0.32em] uppercase text-[#C92A2A]"
              >
                Tienda oficial
              </span>
            </div>

            <h3
              className="font-display font-bold mt-7 text-[#FAFAF8] leading-[0.95]"
              style={{
                letterSpacing: '-0.035em',
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
              }}
            >
              Universidad
              <br />
              del Valle.
            </h3>

            <p
              className="font-body mt-6 max-w-xs text-[#FAFAF8]/55 text-[14px] leading-[1.7]"
            >
              Productos oficiales desde 1945.
            </p>

            <Link
              href="/catalog"
              className="font-body group mt-10 inline-flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-[#FAFAF8] hover:text-[#C92A2A] transition-colors duration-300"
            >
              Explorar tienda
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-[#C92A2A] group-hover:bg-[#C92A2A] group-hover:text-[#FAFAF8]">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* 4 columnas */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            {COLUMNS.map((col, idx) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.15 + idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <p
                  className="font-body text-[10px] tracking-[0.32em] uppercase text-[#FAFAF8]/40"
                >
                  {col.title}
                </p>

                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="font-body group inline-flex items-center gap-2 text-[14px] text-[#FAFAF8]/75 hover:text-[#C92A2A] transition-colors duration-300"
                        >
                          {Icon && (
                            <Icon
                              size={14}
                              className="opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          )}
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-20 flex flex-col gap-4 border-t border-white/[0.08] pt-6 md:flex-row md:items-center md:justify-between"
        >
          <p
            className="font-body text-[11px] tracking-[0.24em] uppercase text-[#FAFAF8]/40"
          >
            © 2026 Universidad del Valle
          </p>

          <span
            className="font-body text-[10px] tracking-[0.32em] uppercase text-[#FAFAF8]/30"
          >
            Cali · Colombia
          </span>
        </motion.div>
      </div>

      {/* Wordmark gigante UNIVALLE */}
      <div
        aria-hidden
        className="relative z-0 overflow-hidden pb-1"
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold whitespace-nowrap text-center select-none leading-[0.82]"
          style={{
            letterSpacing: '-0.045em',
            fontSize: 'clamp(8rem, 20vw, 18rem)',
            color: 'rgba(201,42,42,0.08)',
          }}
        >
          UNIVALLE
        </motion.h2>
      </div>
    </footer>
  );
}
