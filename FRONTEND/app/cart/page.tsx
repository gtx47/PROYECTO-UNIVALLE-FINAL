'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/(landing)/components/Navbar';
import Footer from '@/app/(landing)/components/Footer';
import { useCart, formatPrice } from '@/app/lib/cart';

function formatCOP(amount: number) {
  return `$${amount.toLocaleString('es-CO')}`;
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-[12px] text-[#6B6B6B]">{label}</span>
      <span className={`font-display font-semibold text-[12px] ${accent ? 'text-[#C92A2A]' : 'text-[#1A1A1A]'}`}>
        {value}
      </span>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, isEmpty, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoState, setPromoState] = useState<'idle' | 'applied' | 'error'>('idle');

  const shipping = !isEmpty ? 8000 : 0;
  const tax = Math.round(subtotal * 0.19);
  const discount = promoState === 'applied' ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping + tax - discount;

  const handlePromo = () => {
    if (promoCode.trim().toUpperCase() === 'UNIVALLE10') {
      setPromoState('applied');
    } else {
      setPromoState('error');
    }
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 pt-28 pb-32">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 mb-10"
          aria-label="breadcrumb"
        >
          <Link
            href="/products"
            className="font-body text-[11px] tracking-[0.1em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-200"
          >
            Productos
          </Link>
          <span className="font-body text-[11px] text-[#E8E6E2] select-none">/</span>
          <span className="font-body text-[11px] tracking-[0.1em] uppercase text-[#1A1A1A]">
            Carrito
          </span>
        </motion.nav>

        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* ── Empty state ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center py-36 gap-6"
            >
              <ShoppingCart size={64} strokeWidth={1.1} color="#E8E6E2" />
              <div className="text-center space-y-2">
                <h2 className="font-display font-bold text-[24px] text-[#1A1A1A] tracking-tight">
                  Tu carrito está vacío
                </h2>
                <p className="font-body text-[14px] text-[#6B6B6B]">
                  Explora el catálogo y agrega productos
                </p>
              </div>
              <Link
                href="/products"
                className="font-body text-[12px] tracking-[0.1em] uppercase font-semibold bg-[#C92A2A] text-white px-7 py-3.5 rounded-md hover:bg-[#a82020] transition-colors duration-300 mt-2"
              >
                Ver productos →
              </Link>
            </motion.div>
          ) : (
            /* ── Cart layout ── */
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-10 lg:gap-14 items-start"
            >
              {/* ━━━ LEFT — items list ━━━ */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline justify-between mb-8"
                >
                  <div className="flex items-baseline gap-3">
                    <h1 className="font-display font-bold text-[20px] text-[#1A1A1A] uppercase tracking-[0.05em]">
                      Carrito
                    </h1>
                    <span className="font-display font-semibold text-[13px] text-[#6B6B6B]">
                      {String(items.length).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>

                <AnimatePresence initial={false}>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -32, transition: { duration: 0.25 } }}
                      transition={{
                        opacity: { duration: 0.35, delay: index * 0.07 },
                        y: { duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] },
                        layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                      }}
                      className="flex items-start gap-4 py-3.5 border-b border-[#E8E6E2]"
                    >
                      {/* Product image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-[4px] bg-[#F0EFED] flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingCart size={18} strokeWidth={1.2} color="#C8C4BE" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-display font-semibold text-[13px] text-[#1A1A1A] leading-snug">
                            {item.name}
                          </p>
                          <span className="font-display font-semibold text-[13px] text-[#1A1A1A] flex-shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        <p className="font-body text-[13px] text-[#6B6B6B] mt-1">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>

                        {/* Controls row */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeItem(item.productId)}
                              aria-label="Eliminar"
                              className="text-[#6B6B6B] hover:text-[#C92A2A] transition-colors duration-200"
                            >
                              <Trash2 size={15} strokeWidth={1.5} />
                            </button>
                            <button
                              aria-label="Guardar para después"
                              className="text-[#6B6B6B] hover:text-[#C92A2A] transition-colors duration-200"
                            >
                              <Heart size={15} strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Quantity stepper */}
                          <div className="flex items-center border border-[#E8E6E2]">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              aria-label="Reducir cantidad"
                              className="w-7 h-7 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EFED] transition-all duration-150"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-8 h-7 flex items-center justify-center font-body text-[12px] font-medium text-[#1A1A1A] border-x border-[#E8E6E2] tabular-nums">
                              {String(item.quantity).padStart(2, '0')}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              aria-label="Aumentar cantidad"
                              className="w-7 h-7 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EFED] transition-all duration-150"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* ━━━ RIGHT — order summary ━━━ */}
              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="lg:sticky lg:top-28"
              >
                <div className="border border-[#E8E6E2] rounded-md p-6 bg-[#FAFAF8]">
                  <h2 className="font-display font-bold text-[20px] uppercase tracking-[0.05em] text-[#1A1A1A] mb-6 pb-5 border-b border-[#E8E6E2]">
                    Resumen
                  </h2>

                  <div className="space-y-3.5">
                    <SummaryRow label="Total items" value={`${totalItems} ${totalItems === 1 ? 'item' : 'items'}`} />
                    <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                    <SummaryRow label="Est. Envío" value={formatCOP(shipping)} />
                    <SummaryRow label="Impuestos (19%)" value={`+${formatCOP(tax)}`} accent />
                    <AnimatePresence>
                      {promoState === 'applied' && (
                        <motion.div
                          key="discount-row"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <SummaryRow label="Descuento (10%)" value={`-${formatCOP(discount)}`} accent />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-t border-[#E8E6E2] my-5" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-body text-[12px] text-[#6B6B6B]">Total final</span>
                    <span className="font-display font-bold text-[16px] text-[#1A1A1A]">
                      {formatCOP(total)}
                    </span>
                  </div>

                  {/* Promo code */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Código promo"
                      value={promoCode}
                      disabled={promoState === 'applied'}
                      onChange={e => {
                        setPromoCode(e.target.value);
                        if (promoState === 'error') setPromoState('idle');
                      }}
                      onKeyDown={e => e.key === 'Enter' && handlePromo()}
                      className={`flex-1 font-body text-[13px] border px-3 py-3 rounded-md outline-none bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C0BDB8] transition-colors duration-200 focus:border-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed ${promoState === 'error' ? 'border-[#C92A2A]' : 'border-[#E8E6E2]'}`}
                    />
                    <button
                      onClick={handlePromo}
                      disabled={promoState === 'applied' || !promoCode.trim()}
                      className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#1A1A1A] text-white px-4 py-3 rounded-md hover:bg-[#C92A2A] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A1A]"
                    >
                      Aplicar
                    </button>
                  </div>

                  <AnimatePresence>
                    {promoState === 'applied' && (
                      <motion.p
                        key="promo-ok"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-body text-[12px] text-green-600 mb-4"
                      >
                        ✓ Código aplicado — 10% de descuento
                      </motion.p>
                    )}
                    {promoState === 'error' && (
                      <motion.p
                        key="promo-err"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-body text-[12px] text-[#C92A2A] mb-4"
                      >
                        Código no válido. Prueba: UNIVALLE10
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-2 mt-4">
                    <Link
                      href="/checkout"
                      className="w-full font-body text-[13px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white py-[11px] rounded-md hover:bg-[#a82020] transition-colors duration-300 text-center"
                    >
                      Finalizar compra
                    </Link>
                    <Link
                      href="/checkout?guest=true"
                      className="w-full font-body text-[13px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] py-[11px] rounded-md hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 text-center"
                    >
                      Checkout como invitado
                    </Link>
                  </div>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
