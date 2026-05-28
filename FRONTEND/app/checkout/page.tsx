'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/(landing)/components/Navbar';
import Footer from '@/app/(landing)/components/Footer';
import { useCart, formatPrice } from '@/app/lib/cart';
import { apiFetch } from '@/app/lib/api';

const field =
  'font-body w-full border border-[#E8E6E2] bg-white rounded-md px-4 py-3 text-[14px] text-[#1A1A1A] outline-none focus:border-[#C92A2A] transition-colors duration-200 placeholder:text-[#B0ADA8]';
const label =
  'font-body block text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1.5';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="h-px flex-1 bg-[#E8E6E2]" />
      <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">{children}</p>
      <span className="h-px flex-1 bg-[#E8E6E2]" />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, isEmpty, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    address: '',
    city: 'Cali',
    phone: '',
    cardNumber: '',
    cardHolder: '',
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setForm({ ...form, cardNumber: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const orderRes = await apiFetch<{ id: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shipping: {
            fullName: form.fullName,
            address: form.address,
            city: form.city,
            phone: form.phone,
          },
        }),
      });
      if (!orderRes.ok || !orderRes.data) throw new Error(orderRes.error ?? 'Error creando orden');

      const orderId = orderRes.data.id;
      const payRes = await apiFetch<{ transactionId?: string; message?: string }>('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ orderId, cardNumber: form.cardNumber.replace(/\s/g, ''), cardHolder: form.cardHolder }),
      });

      if (payRes.ok && payRes.data) {
        clear();
        router.push(`/payment/success?order=${orderId}&tx=${payRes.data.transactionId}`);
      } else {
        router.push(`/payment/failure?order=${orderId}&msg=${encodeURIComponent(payRes.error ?? 'Pago rechazado')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 py-32">
          <ShoppingBag size={56} strokeWidth={1.1} color="#E8E6E2" />
          <p className="font-display font-bold text-[20px] text-[#1A1A1A]">Tu carrito está vacío</p>
          <Link href="/products" className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white px-7 py-3 rounded-md hover:bg-[#a82020] transition-colors duration-300">
            Ver productos
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.19);
  const shipping = 8000;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1200px] px-6 md:px-10 pt-28 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[28px] text-[#1A1A1A] tracking-tight mb-10"
          style={{ letterSpacing: '-0.025em' }}
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ── Left: form ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Envío */}
            <div>
              <SectionTitle>Envío</SectionTitle>
              <div className="space-y-4">
                <div>
                  <label className={label}>Nombre completo</label>
                  <input required name="fullName" placeholder="Tu nombre" value={form.fullName} onChange={handleChange} className={field} />
                </div>
                <div>
                  <label className={label}>Dirección</label>
                  <input required name="address" placeholder="Calle, número, detalles" value={form.address} onChange={handleChange} className={field} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Ciudad</label>
                    <input required name="city" value={form.city} onChange={handleChange} className={field} />
                  </div>
                  <div>
                    <label className={label}>Teléfono</label>
                    <input required name="phone" placeholder="+57 300 000 0000" value={form.phone} onChange={handleChange} className={field} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pago */}
            <div>
              <SectionTitle>Pago</SectionTitle>
              <p className="font-body text-[12px] text-[#6B6B6B] mb-5">
                Pago simulado — tarjeta con último dígito par se aprueba.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={label}>Titular de la tarjeta</label>
                  <input required name="cardHolder" placeholder="Nombre del titular" value={form.cardHolder} onChange={handleChange} className={field} />
                </div>
                <div>
                  <label className={label}>Número de tarjeta</label>
                  <input required name="cardNumber" placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={handleCardNumber} inputMode="numeric" maxLength={19} className={`${field} tracking-widest`} />
                </div>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-body text-[13px] text-[#C92A2A] border border-[#C92A2A]/25 bg-[#C92A2A]/5 rounded-md px-4 py-3"
              >
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* ── Right: summary ── */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28 border border-[#E8E6E2] rounded-md p-6 bg-[#FAFAF8]"
          >
            <h2 className="font-display font-bold text-[16px] uppercase tracking-[0.05em] text-[#1A1A1A] mb-6 pb-5 border-b border-[#E8E6E2]">
              Resumen
            </h2>

            <div className="space-y-3 mb-5">
              {items.map((i) => (
                <div key={i.productId} className="flex items-start justify-between gap-3">
                  <span className="font-body text-[13px] text-[#1A1A1A] leading-snug">
                    {i.name}{' '}
                    <span className="text-[#6B6B6B]">× {i.quantity}</span>
                  </span>
                  <span className="font-display font-semibold text-[13px] text-[#1A1A1A] whitespace-nowrap">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E6E2] pt-4 space-y-2.5 mb-5">
              <div className="flex justify-between">
                <span className="font-body text-[12px] text-[#6B6B6B]">Subtotal</span>
                <span className="font-body text-[12px] text-[#1A1A1A]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-[12px] text-[#6B6B6B]">Envío</span>
                <span className="font-body text-[12px] text-[#1A1A1A]">{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-[12px] text-[#6B6B6B]">IVA (19%)</span>
                <span className="font-body text-[12px] text-[#C92A2A]">+{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-[#E8E6E2] pt-4 mb-6">
              <span className="font-body text-[12px] text-[#6B6B6B]">Total</span>
              <span className="font-display font-bold text-[18px] text-[#1A1A1A]">{formatPrice(total)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-body text-[13px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white py-[13px] rounded-md hover:bg-[#a82020] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Procesando…
                </span>
              ) : 'Pagar ahora'}
            </button>
          </motion.aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}
