"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/cart";

type Metrics = {
  totalSales: number;
  orders: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    total: number;
  };
  lowStock: { id: string; name: string; stock: number }[];
  topProducts: { id: string; name: string; unitsSold: number }[];
  revenueByCategory: Record<string, number>;
};

const CATEGORY_LABELS: Record<string, string> = {
  ropa: "Ropa",
  accesorios: "Accesorios",
  libros: "Libros",
  papeleria: "Papelería",
  tecnologia: "Tecnología",
  maestrias: "Maestrías",
  diplomados: "Diplomados",
  cursos: "Cursos",
  otros: "Otros",
  "sin-categoria": "Sin categoría",
};

export default function AdminHome() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const [m, u, p] = await Promise.all([
        apiFetch<Metrics>("/api/admin/metrics"),
        apiFetch<unknown[]>("/api/users"),
        apiFetch<unknown[]>("/api/products"),
      ]);
      if (!m.ok || !m.data) {
        setError(m.error ?? "No se pudieron cargar las métricas");
        return;
      }
      setMetrics(m.data);
      setUserCount(u.ok ? (u.data ?? []).length : null);
      setProductCount(p.ok ? (p.data ?? []).length : null);
    })();
  }, []);

  const revenueEntries = metrics
    ? Object.entries(metrics.revenueByCategory).sort((a, b) => b[1] - a[1])
    : [];
  const revenueTotal = revenueEntries.reduce((acc, [, v]) => acc + v, 0);

  return (
    <>
      <div className="mb-10">
        <span className="text-[11px] uppercase tracking-wider text-gray-500">
          Administración
        </span>
        <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
          Panel de control
        </h1>
        <p className="text-gray-500 mt-2">
          Resumen del negocio en tiempo real.
        </p>
      </div>

      {error && (
        <p className="text-[var(--uv-red)] border border-[var(--uv-red)]/20 bg-[var(--uv-red)]/5 rounded-md p-3 text-sm mb-8">
          {error}
        </p>
      )}

      {metrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Metric label="Usuarios" value={userCount?.toString() ?? "—"} />
            <Metric label="Productos" value={productCount?.toString() ?? "—"} />
            <Metric label="Órdenes" value={metrics.orders.total.toString()} />
            <Metric
              label="Ventas totales"
              value={formatPrice(metrics.totalSales)}
            />
          </div>

          <div className="border border-gray-100 rounded-2xl p-8 mb-10">
            <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-6">
              Estado de órdenes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <StatusMetric
                label="Pendientes"
                value={metrics.orders.pending}
                accent
              />
              <StatusMetric
                label="Confirmadas"
                value={metrics.orders.confirmed}
              />
              <StatusMetric label="Enviadas" value={metrics.orders.shipped} />
              <StatusMetric
                label="Entregadas"
                value={metrics.orders.delivered}
              />
              <StatusMetric
                label="Canceladas"
                value={metrics.orders.cancelled}
                muted
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-10">
            <div className="border border-gray-100 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[13px] uppercase tracking-wider text-gray-500">
                  Stock bajo
                </h2>
                <Link
                  href="/admin/products"
                  className="text-[12px] text-gray-500 hover:text-black"
                >
                  Gestionar →
                </Link>
              </div>
              {metrics.lowStock.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Ningún producto con stock crítico.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {metrics.lowStock.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm text-black truncate pr-4">
                        {p.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                          p.stock === 0
                            ? "text-[var(--uv-red)]"
                            : "text-gray-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.stock === 0
                              ? "bg-[var(--uv-red)]"
                              : "bg-gray-400"
                          }`}
                        />
                        {p.stock} en stock
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-gray-100 rounded-2xl p-8">
              <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-5">
                Top productos vendidos
              </h2>
              {metrics.topProducts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aún no hay ventas registradas.
                </p>
              ) : (
                <ol className="space-y-3">
                  {metrics.topProducts.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-black truncate">
                        {p.name}
                      </span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {p.unitsSold}{" "}
                        <span className="text-[11px]">u.</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="border border-gray-100 rounded-2xl p-8 mb-10">
            <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-6">
              Ingresos por categoría
            </h2>
            {revenueEntries.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no hay ingresos registrados.
              </p>
            ) : (
              <div className="space-y-4">
                {revenueEntries.map(([cat, value]) => {
                  const pct = revenueTotal > 0 ? (value / revenueTotal) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="text-black">
                          {CATEGORY_LABELS[cat] ?? cat}
                        </span>
                        <span className="text-gray-500">
                          {formatPrice(value)}{" "}
                          <span className="text-[11px] text-gray-400">
                            · {pct.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[var(--uv-red)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/admin/products" className="uv-card p-8 block group">
          <h3 className="text-xl font-semibold tracking-display text-black mb-2 group-hover:text-[var(--uv-red)] transition-colors">
            Productos
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Gestiona el catálogo: crea, edita y elimina programas.
          </p>
        </Link>
        <Link href="/admin/orders" className="uv-card p-8 block group">
          <h3 className="text-xl font-semibold tracking-display text-black mb-2 group-hover:text-[var(--uv-red)] transition-colors">
            Órdenes
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Revisa todas las órdenes y actualiza sus estados.
          </p>
        </Link>
        <Link href="/admin/users" className="uv-card p-8 block group">
          <h3 className="text-xl font-semibold tracking-display text-black mb-2 group-hover:text-[var(--uv-red)] transition-colors">
            Usuarios
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Promueve administradores y administra cuentas.
          </p>
        </Link>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-6">
      <p className="text-[12px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-display text-black mt-2">
        {value}
      </p>
    </div>
  );
}

function StatusMetric({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] text-gray-500 mb-2 flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            muted ? "bg-gray-300" : accent ? "bg-[var(--uv-red)]" : "bg-black"
          }`}
        />
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-display text-black">
        {value}
      </p>
    </div>
  );
}
