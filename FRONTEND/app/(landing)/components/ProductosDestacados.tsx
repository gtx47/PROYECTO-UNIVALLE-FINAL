'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const destacados = [
  {
    id: 1,
    categoria: 'Ropa',
    titulo: 'Viste la U',
    desc: 'Camisetas y sudaderas oficiales para llevar tu identidad universitaria.',
    gradient: 'linear-gradient(160deg, #6B6B6B 0%, #1A1A1A 50%, #1A1A1A 100%)',
    accent: '#C92A2A',
  },
  {
    id: 2,
    categoria: 'Académico',
    titulo: 'Tu semestre',
    desc: 'Libros, agendas y todo el material para rendir al máximo este periodo.',
    gradient: 'linear-gradient(160deg, #6B6B6B 0%, #1A1A1A 50%, #1A1A1A 100%)',
    accent: '#C92A2A',
  },
  {
    id: 3,
    categoria: 'Accesorios',
    titulo: 'Lleva todo',
    desc: 'Maletines, termos y accesorios diseñados para tu día a día en el campus.',
    gradient: 'linear-gradient(160deg, #6B6B6B 0%, #1A1A1A 50%, #1A1A1A 100%)',
    accent: '#C92A2A',
  },
];

function PanelCard({ item, index }: { item: typeof destacados[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-300px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ minHeight: '620px' }}
      whileHover={{ y: -8 }}
    >
      {/* Fondo texturizado con gradiente */}
      <div className="absolute inset-0" style={{ background: item.gradient }} />

      {/* Textura de grano */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Brillo superior que sigue el hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 50%)' }}
      />

      {/* Contenido interno — mini panel tipo widget */}
      <div className="relative z-10 h-full flex flex-col p-8">

        {/* Widget flotante */}
        <motion.div
          className="rounded-xl backdrop-blur-md border border-white/10 p-6 mb-auto"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: index * 0.15 + 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40">
              {item.categoria}
            </span>
            <span
              className="font-body text-[10px] px-2 py-1 rounded-full"
              style={{ background: item.accent, color: '#FAFAF8' }}
            >
              Destacado
            </span>
          </div>

          {/* Líneas tipo skeleton de producto */}
          <div className="space-y-3">
            <div className="h-24 rounded-lg bg-white/5 flex items-center justify-center">
              <span className="text-4xl opacity-20">◆</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex-1 h-12 rounded-md bg-white/5" />
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-2 w-20 rounded-full bg-white/10" />
              <div className="h-2 w-12 rounded-full" style={{ background: item.accent, opacity: 0.6 }} />
            </div>
          </div>
        </motion.div>

        {/* Texto inferior */}
        <div className="mt-8">
          <h3
            className="font-display font-bold text-white leading-tight mb-3"
            style={{ fontSize: '1.5rem' }}
          >
            {item.titulo}
          </h3>
          <p className="font-body text-white/50 text-sm leading-relaxed mb-6 max-w-[280px]">
            {item.desc}
          </p>
          <button
            className="font-body text-[11px] tracking-widest uppercase border border-white/25 text-white px-5 py-3 rounded-sm group-hover:bg-white group-hover:text-[#1A1A1A] group-hover:border-white transition-all duration-300"
          >
            Explorar {item.categoria} →
          </button>
        </div>

      </div>
    </motion.div>
  );
}

export default function ProductosDestacados() {
  return (
    <section className="relative bg-[#1A1A1A] pt-64 pb-64 px-16">
      <div className="max-w-7xl mx-auto">

        {/* Grid de 3 paneles */}
        <div className="grid grid-cols-3 gap-6">
          {destacados.map((item, i) => (
            <PanelCard key={item.id} item={item} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}