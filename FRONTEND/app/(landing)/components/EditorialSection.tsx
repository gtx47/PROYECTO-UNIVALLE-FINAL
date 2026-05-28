'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function EditorialSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-[#1A1A1A] text-[#FAFAF8]"
    >
      {/* Bordes sutiles */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]" />

      {/* Grano */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 py-32 lg:py-52 text-center">
        {/* Headline */}
        <h2
          className="font-display font-bold leading-[0.92]"
          style={{
            letterSpacing: '-0.045em',
            fontSize: 'clamp(2.6rem, 7vw, 6rem)',
          }}
        >
          {['LA U NO SE DEJA', 'EN EL CAMPUS.'].map((line, i, arr) => (
            <span
              key={i}
              className="block overflow-hidden"
            >
              <motion.span
                initial={{ y: '110%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{
                  duration: 0.95,
                  delay: 0.15 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`inline-block ${
                  i === arr.length - 1 ? 'text-[#C92A2A]' : 'text-[#FAFAF8]'
                }`}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mt-16"
        >
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-4 bg-[#C92A2A] px-10 py-5 text-[#FAFAF8] transition-colors duration-300 hover:bg-[#FAFAF8] hover:text-[#1A1A1A]"
          >
            <span
              className="font-body text-[11px] tracking-[0.32em] uppercase"
            >
              Descubre más
            </span>
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
