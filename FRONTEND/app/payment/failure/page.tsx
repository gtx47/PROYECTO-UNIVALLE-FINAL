'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/app/(landing)/components/Navbar';
import Footer from '@/app/(landing)/components/Footer';

function Content() {
  const params = useSearchParams();
  const msg = params.get('msg') ?? 'Tu pago no pudo ser procesado.';
  const order = params.get('order');

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-16 h-16 rounded-full bg-[#C92A2A]/10 flex items-center justify-center mb-8"
      >
        <svg className="w-8 h-8 text-[#C92A2A]" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display font-bold text-[#1A1A1A] mb-3"
        style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
      >
        Pago fallido
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-body text-[15px] text-[#6B6B6B] max-w-sm leading-relaxed mb-10"
      >
        {msg}
      </motion.p>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border border-[#E8E6E2] rounded-md px-6 py-4 mb-10"
        >
          <p className="font-body text-[13px] text-[#6B6B6B]">
            Orden <code className="font-mono text-[#1A1A1A] text-[12px]">{order}</code>{' '}
            <span className="text-[#C92A2A]">(cancelada)</span>
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <Link
          href="/checkout"
          className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white px-7 py-3 rounded-md hover:bg-[#a82020] transition-colors duration-300"
        >
          Reintentar
        </Link>
        <Link
          href="/cart"
          className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] px-7 py-3 rounded-md hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
        >
          Ver carrito
        </Link>
      </motion.div>
    </main>
  );
}

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1" />}>
        <Content />
      </Suspense>
      <Footer />
    </div>
  );
}
