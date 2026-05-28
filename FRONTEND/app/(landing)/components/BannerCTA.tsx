'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function BannerCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-[#F0EFED]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[#E8E6E2]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#E8E6E2]" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 py-24 lg:py-36">
        <div className="grid grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Imagen izquierda — 60% */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 lg:col-span-7 group relative overflow-hidden"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E8E4DE] lg:aspect-[5/6]">
              <img
                src="/brand/univalle-registro-EDITADO.png"
                alt="Universidad del Valle"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              {/* Subtle vignette */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.18) 100%)',
                }}
              />

              {/* Pequeño label esquina */}
              <div className="absolute left-5 top-5 flex items-center gap-3">
                <span className="h-px w-6 bg-[#FAFAF8]" />
                <span
                  className="font-body text-[10px] tracking-[0.32em] uppercase text-[#FAFAF8]"
                >
                  Catálogo 2026
                </span>
              </div>
            </div>
          </motion.div>

          {/* Contenido derecha */}
          <div className="col-span-12 lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-8 bg-[#C92A2A]" />
              <span
                className="font-body text-[11px] tracking-[0.32em] uppercase text-[#C92A2A]"
              >
                Tienda oficial
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-bold mt-8 text-[#1A1A1A] leading-[1.02]"
              style={{
                letterSpacing: '-0.035em',
                fontSize: 'clamp(2rem, 3.2vw, 3.2rem)',
              }}
            >
              Ser Univalle es llevar la U contigo a todas partes.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="font-body mt-8 text-[#6B6B6B]"
              style={{
                fontSize: '15px',
                letterSpacing: '0.01em',
              }}
            >
              Más de 350 productos oficiales.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="mt-10"
            >
              <Link
                href="/catalog"
                className="group inline-flex items-center gap-4 bg-[#C92A2A] px-9 py-4 text-[#FAFAF8] transition-colors duration-300 hover:bg-[#1A1A1A]"
              >
                <span
                  className="font-body text-[11px] tracking-[0.32em] uppercase"
                >
                  Ver catálogo completo
                </span>
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
