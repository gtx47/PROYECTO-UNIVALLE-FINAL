'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

type Coleccion = {
  nombre: string;
};

const COLECCIONES: Coleccion[] = [
  { nombre: 'Ropa Oficial' },
  { nombre: 'Material Académico' },
  { nombre: 'Accesorios' },
  { nombre: 'Papelería' },
  { nombre: 'Kit de Inicio' },
];

function Card({ col, index }: { col: Coleccion; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.85,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href="/catalog" className="group block">
        {/* Placeholder de imagen */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F0EFED]">
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] bg-[#F0EFED]" />
        </div>

        {/* Nombre debajo */}
        <h3
          className="font-body mt-6 text-center text-[#1A1A1A] uppercase"
          style={{
            letterSpacing: '0.08em',
            fontSize: 'clamp(0.78rem, 0.9vw, 0.875rem)',
          }}
        >
          {col.nombre}
        </h3>
      </Link>
    </motion.div>
  );
}

export default function Colecciones() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      id="colecciones"
      className="relative bg-[#FAFAF8] py-28 lg:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        {/* Título centrado */}
        <motion.h2
          ref={headerRef}
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold uppercase mb-20 text-center text-[#1A1A1A] lg:mb-28"
          style={{
            letterSpacing: '-0.02em',
            fontSize: 'clamp(1.8rem, 2.6vw, 2.4rem)',
          }}
        >
          Colecciones
        </motion.h2>

        {/* Grid de 5 — mucho aire entre tarjetas */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
          {COLECCIONES.map((col, i) => (
            <Card key={col.nombre} col={col} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
