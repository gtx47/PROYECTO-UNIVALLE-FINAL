"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/app/lib/cart";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shipping: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
  };
};

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-black",
  cancelled: "bg-gray-300",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");

  const load = (t: string) => {
    fetch("/api/orders?scope=all", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((json) => setOrders(json.data ?? []));
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    setToken(t);
    load(t);
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    if (!token) return;
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    load(token);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await fetch(`/api/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteConfirm(null);
    load(token);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="mb-10">
        <span className="text-[11px] uppercase tracking-wider text-gray-500">
          Administración
        </span>
        <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
          Gestión de órdenes
        </h1>
        <p className="text-gray-500 mt-2">
          Revisa, actualiza y elimina órdenes.
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap mb-8">
        {(["all", ...Object.keys(STATUS_LABELS)] as string[]).map((s) => {
          const label = s === "all" ? "Todas" : STATUS_LABELS[s];
          const count =
            s === "all"
              ? orders.length
              : (counts[s] ?? 0);
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 h-8 text-[12px] rounded-md border transition-colors ${
                filter === s
                  ? "border-black text-black bg-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 text-gray-400">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {filtered.map((o) => (
          <div key={o.id} className="py-6">
            {/* Fila superior */}
            <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
              <button
                onClick={() => toggleExpand(o.id)}
                className="text-left group"
              >
                <p className="text-[13px] text-gray-500">
                  <code className="text-black font-mono">
                    {o.id.slice(0, 10)}
                  </code>{" "}
                  · {o.shipping.fullName}{" "}
                  <span className="text-gray-400">({o.shipping.city})</span>
                  <span className="ml-1.5 text-gray-300 group-hover:text-gray-500 transition-colors text-[11px]">
                    {expanded.has(o.id) ? "▲" : "▼"}
                  </span>
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {new Date(o.createdAt).toLocaleString("es-CO")}
                </p>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Badge de estado */}
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px] border border-gray-200 text-black bg-white">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      STATUS_DOT[o.status] ?? "bg-gray-400"
                    }`}
                  />
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>

                {/* Botones de transición de estado */}
                {NEXT_STATUS[o.status]?.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdate(o.id, s)}
                    className="px-3 h-8 text-[12px] text-black border border-gray-200 rounded-md hover:border-black transition-colors"
                  >
                    → {STATUS_LABELS[s] ?? s}
                  </button>
                ))}

                {/* Eliminar con confirmación */}
                {deleteConfirm === o.id ? (
                  <>
                    <span className="text-[12px] text-gray-500">
                      ¿Eliminar?
                    </span>
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="px-3 h-8 text-[12px] text-[var(--uv-red)] border border-[var(--uv-red)]/30 rounded-md hover:border-[var(--uv-red)] transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 h-8 text-[12px] text-gray-500 border border-gray-200 rounded-md hover:border-black transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(o.id)}
                    className="px-3 h-8 text-[12px] text-gray-400 border border-gray-200 rounded-md hover:text-[var(--uv-red)] hover:border-[var(--uv-red)]/30 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Resumen de items */}
            <div className="text-sm text-gray-700 mb-2 flex flex-wrap gap-x-4 gap-y-1">
              {o.items.map((i, idx) => (
                <span key={idx}>
                  {i.name}{" "}
                  <span className="text-gray-400">× {i.quantity}</span>
                </span>
              ))}
            </div>

            {/* Detalle expandido */}
            {expanded.has(o.id) && (
              <div className="mt-4 pt-4 border-t border-gray-50 grid sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">
                    Datos de envío
                  </p>
                  <p className="text-gray-800">{o.shipping.fullName}</p>
                  <p className="text-gray-500">{o.shipping.address}</p>
                  <p className="text-gray-500">{o.shipping.city}</p>
                  <p className="text-gray-500">{o.shipping.phone}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">
                    Productos
                  </p>
                  <div className="space-y-1">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-700">
                          {i.name} × {i.quantity}
                        </span>
                        <span className="text-black">
                          {formatPrice(i.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {o.updatedAt && (
                    <p className="text-[11px] text-gray-400 mt-3">
                      Actualizada:{" "}
                      {new Date(o.updatedAt).toLocaleString("es-CO")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <p className="text-right text-lg font-semibold tracking-display text-black mt-3">
              {formatPrice(o.total)}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            {filter === "all"
              ? "No hay órdenes aún."
              : `No hay órdenes con estado "${STATUS_LABELS[filter] ?? filter}".`}
          </p>
        )}
      </div>
    </>
  );
}
