'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/(landing)/components/Navbar';
import Footer from '@/app/(landing)/components/Footer';
import { formatPrice } from '@/app/lib/cart';
import { apiFetch } from '@/app/lib/api';

type OrderItem = { name: string; quantity: number; price: number };

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shipping?: { fullName: string; address: string; city: string; phone: string };
};

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

const STATUS_META: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  pending:   { label: 'Pendiente',  dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  confirmed: { label: 'Confirmada', dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
  shipped:   { label: 'Enviada',    dot: 'bg-purple-500',  text: 'text-purple-700',  bg: 'bg-purple-50'  },
  delivered: { label: 'Entregada',  dot: 'bg-green-500',   text: 'text-green-700',   bg: 'bg-green-50'   },
  cancelled: { label: 'Cancelada',  dot: 'bg-[#E8E6E2]',   text: 'text-[#6B6B6B]',  bg: 'bg-[#F0EFED]'  },
};

const STEP_LABELS: Record<string, string> = {
  pending: 'Recibida', confirmed: 'Confirmada', shipped: 'En camino', delivered: 'Entregada',
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-body text-[12px] font-semibold ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function StatusStepper({ status }: { status: string }) {
  if (status === 'cancelled') return null;
  const currentIdx = STEPS.indexOf(status as typeof STEPS[number]);
  return (
    <div className="flex items-center gap-0 mt-4">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                done ? 'bg-[#C92A2A] text-white' : 'bg-[#F0EFED] text-[#6B6B6B]'
              }`}>
                {done && i < currentIdx ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`font-body text-[10px] uppercase tracking-[0.08em] whitespace-nowrap ${
                done ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'
              }`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-px mx-1 mb-4 transition-colors ${i < currentIdx ? 'bg-[#C92A2A]' : 'bg-[#E8E6E2]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    apiFetch<Order[]>('/api/orders')
      .then((res) => setOrders(res.data ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20 w-full">

        {/* Header */}
        <div className="mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[#6B6B6B] mb-1">Mi cuenta</p>
          <h1 className="font-display font-bold text-[#1A1A1A]" style={{ fontSize: 'clamp(26px, 4vw, 36px)', letterSpacing: '-0.025em' }}>
            Mis órdenes
          </h1>
          <p className="font-body text-[14px] text-[#6B6B6B] mt-1">
            Historial y seguimiento de tus compras.
          </p>
        </div>

        {loading && (
          <p className="font-body text-[13px] text-[#6B6B6B]">Cargando…</p>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-24 border border-[#E8E6E2] rounded-md bg-white">
            <div className="w-14 h-14 rounded-full bg-[#F0EFED] flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8l3 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8l3-5Z" />
                <path strokeLinecap="round" d="M5 8h14M9 13h6" />
              </svg>
            </div>
            <p className="font-body text-[14px] text-[#6B6B6B] mb-6">Aún no tienes órdenes.</p>
            <Link
              href="/catalog"
              className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white px-6 py-2.5 rounded-md hover:bg-[#a82020] transition-colors"
            >
              Explorar catálogo
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => {
              const isOpen = expanded.has(o.id);
              const meta = STATUS_META[o.status] ?? STATUS_META.pending;
              return (
                <div key={o.id} className="border border-[#E8E6E2] rounded-md bg-white overflow-hidden">

                  {/* Card header — always visible */}
                  <button
                    onClick={() => toggle(o.id)}
                    className="w-full text-left px-6 pt-5 pb-4 flex items-start justify-between gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Top row: ID + status */}
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-mono text-[12px] text-[#6B6B6B]">
                          #{o.id.slice(0, 12).toUpperCase()}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>

                      {/* Date */}
                      <p className="font-body text-[12px] text-[#6B6B6B] mb-3">
                        <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {formatDate(o.createdAt)}
                      </p>

                      {/* Product summary */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {o.items.map((item, idx) => (
                          <span key={idx} className="font-body text-[13px] text-[#1A1A1A]">
                            {item.name}
                            <span className="text-[#6B6B6B]"> × {item.quantity}</span>
                            {idx < o.items.length - 1 && <span className="ml-3 text-[#E8E6E2]">·</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Total + chevron */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-display font-bold text-[18px] text-[#1A1A1A]" style={{ letterSpacing: '-0.02em' }}>
                        {formatPrice(o.total)}
                      </p>
                      <svg
                        className={`w-4 h-4 text-[#6B6B6B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-[#E8E6E2] px-6 py-5 space-y-6">

                      {/* Status stepper */}
                      <div>
                        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-1">Estado de la orden</p>
                        <StatusStepper status={o.status} />
                        {o.status === 'cancelled' && (
                          <p className="font-body text-[13px] text-[#6B6B6B] mt-2">Esta orden fue cancelada.</p>
                        )}
                      </div>

                      {/* Products breakdown */}
                      <div>
                        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Productos</p>
                        <div className="divide-y divide-[#E8E6E2] border border-[#E8E6E2] rounded-md overflow-hidden">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#F0EFED] flex items-center justify-center shrink-0">
                                  <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18l-1.5 12a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z" />
                                    <path strokeLinecap="round" d="M8 7V5a4 4 0 0 1 8 0v2" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-body text-[13px] text-[#1A1A1A] font-medium">{item.name}</p>
                                  <p className="font-body text-[12px] text-[#6B6B6B]">
                                    {formatPrice(item.price ?? 0)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-body text-[13px] text-[#1A1A1A] font-semibold">
                                {formatPrice((item.price ?? 0) * item.quantity)}
                              </p>
                            </div>
                          ))}
                          <div className="flex justify-between px-4 py-3 bg-[#FAFAF8]">
                            <span className="font-body text-[13px] text-[#6B6B6B]">Total</span>
                            <span className="font-display font-bold text-[15px] text-[#1A1A1A]">{formatPrice(o.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping info if available */}
                      {o.shipping && (
                        <div>
                          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Datos de envío</p>
                          <div className="border border-[#E8E6E2] rounded-md px-4 py-3 space-y-1">
                            <p className="font-body text-[13px] text-[#1A1A1A] font-medium">{o.shipping.fullName}</p>
                            <p className="font-body text-[13px] text-[#6B6B6B]">{o.shipping.address}</p>
                            <p className="font-body text-[13px] text-[#6B6B6B]">{o.shipping.city}</p>
                            <p className="font-body text-[13px] text-[#6B6B6B]">{o.shipping.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Dates footer */}
                      <div className="flex flex-wrap gap-6 pt-1">
                        <div>
                          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-0.5">Fecha de compra</p>
                          <p className="font-body text-[13px] text-[#1A1A1A]">{formatDate(o.createdAt)}</p>
                        </div>
                        {o.updatedAt && o.updatedAt !== o.createdAt && (
                          <div>
                            <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-0.5">Última actualización</p>
                            <p className="font-body text-[13px] text-[#1A1A1A]">{formatDate(o.updatedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/catalog" className="font-body text-[13px] text-[#6B6B6B] hover:text-[#C92A2A] transition-colors">
            ← Seguir comprando
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
