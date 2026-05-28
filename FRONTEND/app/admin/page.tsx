'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { formatPrice } from '@/app/lib/cart';

type Metrics = {
  totalSales: number;
  orders: { pending: number; confirmed: number; shipped: number; delivered: number; cancelled: number; total: number };
  lowStock: { id: string; name: string; stock: number }[];
  topProducts: { id: string; name: string; unitsSold: number }[];
  revenueByCategory: Record<string, number>;
};

const CATEGORY_LABELS: Record<string, string> = {
  ropa: 'Ropa', accesorios: 'Accesorios', libros: 'Libros', papeleria: 'Papelería',
  tecnologia: 'Tecnología', maestrias: 'Maestrías', diplomados: 'Diplomados',
  cursos: 'Cursos', otros: 'Otros', 'sin-categoria': 'Sin categoría',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-400', confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500', delivered: 'bg-green-500', cancelled: 'bg-[#E8E6E2]',
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[#E8E6E2] rounded-md p-5 bg-white">
      <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-2">{label}</p>
      <p className="font-display font-bold text-[24px] text-[#1A1A1A]">{value}</p>
      {sub && <p className="font-body text-[11px] text-[#6B6B6B] mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminHome() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const [m, u, p] = await Promise.all([
        apiFetch<Metrics>('/api/admin/metrics'),
        apiFetch<unknown[]>('/api/users'),
        apiFetch<unknown[]>('/api/products'),
      ]);
      if (!m.ok || !m.data) { setError(m.error ?? 'No se pudieron cargar las métricas'); return; }
      setMetrics(m.data);
      setUserCount(u.ok ? (u.data ?? []).length : null);
      setProductCount(p.ok ? (p.data ?? []).length : null);
    })();
  }, []);

  const revenueEntries = metrics ? Object.entries(metrics.revenueByCategory).sort((a, b) => b[1] - a[1]) : [];
  const revenueTotal = revenueEntries.reduce((acc, [, v]) => acc + v, 0);

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-1">Administración</p>
        <h1 className="font-display font-bold text-[28px] text-[#1A1A1A]" style={{ letterSpacing: '-0.025em' }}>
          Panel de control
        </h1>
        <p className="font-body text-[14px] text-[#6B6B6B] mt-1">Resumen del negocio en tiempo real.</p>
      </div>

      {error && (
        <p className="font-body text-[13px] text-[#C92A2A] border border-[#C92A2A]/25 bg-[#C92A2A]/5 rounded-md px-4 py-3 mb-8">{error}</p>
      )}

      {metrics && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Usuarios" value={userCount?.toString() ?? '—'} />
            <StatCard label="Productos" value={productCount?.toString() ?? '—'} />
            <StatCard label="Órdenes" value={metrics.orders.total.toString()} />
            <StatCard label="Ventas totales" value={formatPrice(metrics.totalSales)} />
          </div>

          {/* Estado de órdenes */}
          <div className="border border-[#E8E6E2] rounded-md p-6 mb-6 bg-white">
            <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-5">Estado de órdenes</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {([
                { key: 'pending',   label: 'Pendientes'  },
                { key: 'confirmed', label: 'Confirmadas' },
                { key: 'shipped',   label: 'Enviadas'    },
                { key: 'delivered', label: 'Entregadas'  },
                { key: 'cancelled', label: 'Canceladas'  },
              ] as const).map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[key]}`} />
                    <span className="font-body text-[11px] text-[#6B6B6B]">{label}</span>
                  </div>
                  <p className="font-display font-bold text-[22px] text-[#1A1A1A]">{metrics.orders[key]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            {/* Stock bajo */}
            <div className="border border-[#E8E6E2] rounded-md p-6 bg-white">
              <div className="flex items-center justify-between mb-5">
                <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B]">Stock bajo</p>
                <Link href="/admin/products" className="font-body text-[12px] text-[#C92A2A] hover:underline">Gestionar →</Link>
              </div>
              {metrics.lowStock.length === 0 ? (
                <p className="font-body text-[13px] text-[#6B6B6B]">Ningún producto con stock crítico.</p>
              ) : (
                <ul className="divide-y divide-[#E8E6E2]">
                  {metrics.lowStock.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2.5">
                      <span className="font-body text-[13px] text-[#1A1A1A] truncate pr-4">{p.name}</span>
                      <span className={`font-body text-[12px] font-semibold flex items-center gap-1.5 ${p.stock === 0 ? 'text-[#C92A2A]' : 'text-[#6B6B6B]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.stock === 0 ? 'bg-[#C92A2A]' : 'bg-[#6B6B6B]'}`} />
                        {p.stock} en stock
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Top productos */}
            <div className="border border-[#E8E6E2] rounded-md p-6 bg-white">
              <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-5">Top productos vendidos</p>
              {metrics.topProducts.length === 0 ? (
                <p className="font-body text-[13px] text-[#6B6B6B]">Aún no hay ventas registradas.</p>
              ) : (
                <ol className="space-y-3">
                  {metrics.topProducts.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#F0EFED] text-[#6B6B6B] text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="flex-1 font-body text-[13px] text-[#1A1A1A] truncate">{p.name}</span>
                      <span className="font-body text-[12px] text-[#6B6B6B] whitespace-nowrap">{p.unitsSold} u.</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Ingresos por categoría */}
          <div className="border border-[#E8E6E2] rounded-md p-6 mb-8 bg-white">
            <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-5">Ingresos por categoría</p>
            {revenueEntries.length === 0 ? (
              <p className="font-body text-[13px] text-[#6B6B6B]">Aún no hay ingresos registrados.</p>
            ) : (
              <div className="space-y-4">
                {revenueEntries.map(([cat, value]) => {
                  const pct = revenueTotal > 0 ? (value / revenueTotal) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-body text-[13px] text-[#1A1A1A]">{CATEGORY_LABELS[cat] ?? cat}</span>
                        <span className="font-body text-[12px] text-[#6B6B6B]">{formatPrice(value)} · {pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F0EFED] overflow-hidden">
                        <div className="h-full bg-[#C92A2A] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: '/admin/products', title: 'Productos', desc: 'Crea, edita y archiva productos del catálogo.' },
          { href: '/admin/orders',   title: 'Órdenes',   desc: 'Revisa y actualiza el estado de las órdenes.' },
          { href: '/admin/users',    title: 'Usuarios',  desc: 'Promueve administradores y gestiona cuentas.' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group border border-[#E8E6E2] rounded-md p-6 bg-white hover:border-[#C92A2A] transition-colors duration-200">
            <h3 className="font-display font-bold text-[16px] text-[#1A1A1A] group-hover:text-[#C92A2A] transition-colors mb-1">{c.title}</h3>
            <p className="font-body text-[13px] text-[#6B6B6B] leading-relaxed">{c.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
