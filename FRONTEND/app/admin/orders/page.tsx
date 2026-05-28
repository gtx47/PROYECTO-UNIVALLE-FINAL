'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/app/lib/cart';

type OrderItem = { productId: string; name: string; price: number; quantity: number };

type Order = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shipping: { fullName: string; address: string; city: string; phone: string };
};

const NEXT_STATUS: Record<string, string[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped',   'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada',
  shipped: 'Enviada',   delivered: 'Entregada', cancelled: 'Cancelada',
};

const STATUS_META: Record<string, { dot: string; text: string; bg: string; border: string; desc: string }> = {
  pending:   { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  desc: 'La orden fue recibida y espera revisión.' },
  confirmed: { dot: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   desc: 'La orden fue confirmada y está en preparación.' },
  shipped:   { dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', desc: 'El pedido fue despachado y está en camino.' },
  delivered: { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200',  desc: 'El pedido fue entregado al cliente.' },
  cancelled: { dot: 'bg-[#E8E6E2]',  text: 'text-[#6B6B6B]', bg: 'bg-[#F0EFED]',  border: 'border-[#E8E6E2]',  desc: 'La orden fue cancelada.' },
};

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
const STEP_LABELS: Record<string, string> = {
  pending: 'Recibida', confirmed: 'Confirmada', shipped: 'Enviada', delivered: 'Entregada',
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-body text-[12px] font-semibold ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function OrderStepper({ status }: { status: string }) {
  if (status === 'cancelled') return null;
  const currentIdx = STEPS.indexOf(status as typeof STEPS[number]);
  return (
    <div className="flex items-center mt-3">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                done ? 'bg-[#C92A2A] text-white' : 'bg-[#F0EFED] text-[#6B6B6B]'
              }`}>
                {done && i < currentIdx
                  ? <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                  : i + 1
                }
              </div>
              <span className={`font-body text-[9px] uppercase tracking-[0.06em] whitespace-nowrap ${done ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-px mx-1 mb-3.5 ${i < currentIdx ? 'bg-[#C92A2A]' : 'bg-[#E8E6E2]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Modal de cambio de estado ── */
function StatusModal({
  order,
  onClose,
  onConfirm,
}: {
  order: Order;
  onClose: () => void;
  onConfirm: (status: string) => Promise<void>;
}) {
  const next = NEXT_STATUS[order.status] ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [cancelStep, setCancelStep] = useState(false);
  const [saving, setSaving] = useState(false);

  const apply = async (status: string) => {
    if (status === 'cancelled' && !cancelStep) { setCancelStep(true); return; }
    setSaving(true);
    await onConfirm(status);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-md shadow-xl border border-[#E8E6E2]">

        {/* Modal header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E8E6E2]">
          <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-1">Actualizar orden</p>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[18px] text-[#1A1A1A]" style={{ letterSpacing: '-0.02em' }}>
              Cambiar estado
            </h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0EFED] transition-colors">
              <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="font-mono text-[11px] text-[#6B6B6B] mt-1">#{order.id.slice(0, 16).toUpperCase()}</p>
        </div>

        <div className="px-6 py-5">

          {/* Estado actual */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-body text-[12px] text-[#6B6B6B]">Estado actual:</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Stepper visual */}
          {order.status !== 'cancelled' && (
            <div className="mb-5">
              <OrderStepper status={order.status} />
            </div>
          )}

          {/* Sin acciones disponibles */}
          {next.length === 0 && (
            <p className="font-body text-[13px] text-[#6B6B6B] text-center py-4">
              Esta orden ya está en estado final.
            </p>
          )}

          {/* Opciones de transición */}
          {next.length > 0 && !cancelStep && (
            <div className="space-y-2">
              <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Mover a:</p>
              {next.map((s) => {
                const m = STATUS_META[s];
                const isCancelOpt = s === 'cancelled';
                return (
                  <button
                    key={s}
                    onClick={() => apply(s)}
                    disabled={saving}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-md border text-left transition-all duration-150 disabled:opacity-50 ${
                      isCancelOpt
                        ? 'border-[#C92A2A]/20 hover:border-[#C92A2A] hover:bg-[#C92A2A]/5'
                        : `${m.border} ${m.bg} hover:opacity-90`
                    }`}
                  >
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${m.dot}`} />
                    <div>
                      <p className={`font-body text-[13px] font-semibold ${isCancelOpt ? 'text-[#C92A2A]' : m.text}`}>
                        {STATUS_LABELS[s]}
                      </p>
                      <p className="font-body text-[12px] text-[#6B6B6B] mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Confirmación de cancelación */}
          {cancelStep && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-md bg-[#C92A2A]/5 border border-[#C92A2A]/20">
                <svg className="w-5 h-5 text-[#C92A2A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div>
                  <p className="font-body text-[13px] font-semibold text-[#C92A2A]">¿Cancelar esta orden?</p>
                  <p className="font-body text-[12px] text-[#6B6B6B] mt-1 leading-relaxed">
                    Esta acción no se puede deshacer. El cliente verá la orden como cancelada.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelStep(false)}
                  className="flex-1 font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#E8E6E2] text-[#1A1A1A] py-2.5 rounded-md hover:border-[#1A1A1A] transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={() => apply('cancelled')}
                  disabled={saving}
                  className="flex-1 font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white py-2.5 rounded-md hover:bg-[#a82020] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Cancelando…' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!cancelStep && (
          <div className="px-6 pb-5 flex justify-end">
            <button
              onClick={onClose}
              className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#E8E6E2] text-[#6B6B6B] px-5 py-2 rounded-md hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [statusTarget, setStatusTarget] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = (t: string) => {
    fetch('/api/orders?scope=all', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((json) => setOrders(json.data ?? []));
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return;
    setToken(t);
    load(t);
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    if (!token) return;
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    load(token);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setDeleteConfirm(null);
    load(token);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-1">Administración</p>
        <h1 className="font-display font-bold text-[28px] text-[#1A1A1A]" style={{ letterSpacing: '-0.025em' }}>
          Gestión de órdenes
        </h1>
        <p className="font-body text-[14px] text-[#6B6B6B] mt-1">Revisa, actualiza y elimina órdenes.</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-8">
        {(['all', ...Object.keys(STATUS_LABELS)] as string[]).map((s) => {
          const label = s === 'all' ? 'Todas' : STATUS_LABELS[s];
          const count = s === 'all' ? orders.length : (counts[s] ?? 0);
          const m = s !== 'all' ? STATUS_META[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 h-8 font-body text-[12px] rounded-md border transition-colors flex items-center gap-1.5 ${
                filter === s
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white'
                  : 'border-[#E8E6E2] text-[#6B6B6B] hover:border-[#1A1A1A]/40'
              }`}
            >
              {m && <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />}
              {label}
              {count > 0 && <span className="text-[#6B6B6B]">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Lista de órdenes */}
      <div className="space-y-3">
        {filtered.map((o) => {
          const isOpen = expanded.has(o.id);
          const isFinal = NEXT_STATUS[o.status]?.length === 0;
          return (
            <div key={o.id} className="border border-[#E8E6E2] rounded-md bg-white overflow-hidden">

              {/* Cabecera de la tarjeta */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">

                  {/* Info izquierda */}
                  <button onClick={() => toggleExpand(o.id)} className="text-left group flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <code className="font-mono text-[12px] text-[#1A1A1A]">#{o.id.slice(0, 12).toUpperCase()}</code>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="font-body text-[12px] text-[#6B6B6B]">
                      {o.shipping.fullName} · {o.shipping.city}
                    </p>
                    <p className="font-body text-[11px] text-[#6B6B6B]/60 mt-0.5">
                      {new Date(o.createdAt).toLocaleString('es-CO')}
                    </p>
                  </button>

                  {/* Acciones derecha */}
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-display font-bold text-[16px] text-[#1A1A1A] mr-1">
                      {formatPrice(o.total)}
                    </p>

                    {/* Botón cambiar estado */}
                    {!isFinal && (
                      <button
                        onClick={() => setStatusTarget(o)}
                        className="inline-flex items-center gap-1.5 px-3 h-8 font-body text-[12px] text-[#1A1A1A] border border-[#E8E6E2] rounded-md hover:border-[#1A1A1A] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Estado
                      </button>
                    )}

                    {/* Eliminar */}
                    {deleteConfirm === o.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-[11px] text-[#6B6B6B]">¿Eliminar?</span>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="px-2.5 h-7 font-body text-[11px] text-[#C92A2A] border border-[#C92A2A]/30 rounded-md hover:border-[#C92A2A] transition-colors"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 h-7 font-body text-[11px] text-[#6B6B6B] border border-[#E8E6E2] rounded-md hover:border-[#1A1A1A] transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(o.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E8E6E2] hover:border-[#C92A2A]/40 hover:text-[#C92A2A] text-[#6B6B6B] transition-colors"
                        title="Eliminar orden"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}

                    {/* Expandir */}
                    <button
                      onClick={() => toggleExpand(o.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E8E6E2] hover:bg-[#F0EFED] transition-colors text-[#6B6B6B]"
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Stepper siempre visible */}
                <OrderStepper status={o.status} />
              </div>

              {/* Resumen de productos (siempre visible) */}
              <div className="px-5 pb-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#E8E6E2] pt-3">
                {o.items.map((item, idx) => (
                  <span key={idx} className="font-body text-[13px] text-[#6B6B6B]">
                    {item.name} <span className="text-[#6B6B6B]/50">× {item.quantity}</span>
                  </span>
                ))}
              </div>

              {/* Detalle expandido */}
              {isOpen && (
                <div className="border-t border-[#E8E6E2] px-5 py-4 grid sm:grid-cols-2 gap-6 bg-[#FAFAF8]">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-2">Datos de envío</p>
                    <p className="font-body text-[13px] text-[#1A1A1A] font-medium">{o.shipping.fullName}</p>
                    <p className="font-body text-[13px] text-[#6B6B6B]">{o.shipping.address}</p>
                    <p className="font-body text-[13px] text-[#6B6B6B]">{o.shipping.city}</p>
                    <p className="font-body text-[13px] text-[#6B6B6B]">{o.shipping.phone}</p>
                  </div>
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-2">Productos</p>
                    <div className="space-y-1.5">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="font-body text-[13px] text-[#6B6B6B]">{item.name} × {item.quantity}</span>
                          <span className="font-body text-[13px] text-[#1A1A1A]">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-[#E8E6E2]">
                        <span className="font-body text-[13px] text-[#6B6B6B]">Total</span>
                        <span className="font-display font-bold text-[14px] text-[#1A1A1A]">{formatPrice(o.total)}</span>
                      </div>
                    </div>
                    {o.updatedAt && (
                      <p className="font-body text-[11px] text-[#6B6B6B]/60 mt-3">
                        Actualizada: {new Date(o.updatedAt).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-[#E8E6E2] rounded-md bg-white">
            <p className="font-body text-[13px] text-[#6B6B6B]">
              {filter === 'all'
                ? 'No hay órdenes aún.'
                : `No hay órdenes con estado "${STATUS_LABELS[filter] ?? filter}".`}
            </p>
          </div>
        )}
      </div>

      {/* Modal de cambio de estado */}
      {statusTarget && (
        <StatusModal
          order={statusTarget}
          onClose={() => setStatusTarget(null)}
          onConfirm={(status) => handleUpdate(statusTarget.id, status)}
        />
      )}
    </>
  );
}
