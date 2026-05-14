"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

type Session = { id?: string; email?: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [promoteTarget, setPromoteTarget] = useState<User | null>(null);
  const [promoteSecret, setPromoteSecret] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    const r = await apiFetch<User[]>("/api/users");
    if (!r.ok) {
      setError(r.error || "No se pudieron cargar los usuarios");
      setUsers([]);
    } else {
      setUsers(r.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (raw) {
        const s = JSON.parse(raw) as Session;
        setCurrentEmail(s.email ?? null);
      }
    } catch {}
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.length - adminCount;

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteTarget) return;
    setPromoting(true);
    setError("");
    setFeedback("");
    const r = await apiFetch<{ success: boolean; message: string }>(
      "/api/admin/promote",
      {
        method: "POST",
        body: JSON.stringify({
          email: promoteTarget.email,
          secret: promoteSecret,
        }),
      },
    );
    setPromoting(false);
    if (!r.ok) {
      setError(r.error || "No se pudo promover al usuario");
      return;
    }
    setFeedback(`${promoteTarget.name} ahora es administrador.`);
    setPromoteTarget(null);
    setPromoteSecret("");
    load();
  };

  const handleDelete = async (user: User) => {
    if (user.email === currentEmail) return;
    if (
      !confirm(
        `¿Eliminar a ${user.name} (${user.email})? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setError("");
    setFeedback("");
    const r = await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!r.ok) {
      setError(r.error || "No se pudo eliminar el usuario");
      return;
    }
    setFeedback(`${user.name} fue eliminado.`);
    load();
  };

  return (
    <>
      <div className="mb-10">
        <span className="text-[11px] uppercase tracking-wider text-gray-500">
          Administración
        </span>
        <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
          Gestión de usuarios
        </h1>
        <p className="text-gray-500 mt-2">
          Promueve clientes a administradores o elimina cuentas inactivas.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Metric label="Total" value={users.length} />
        <Metric label="Administradores" value={adminCount} accent />
        <Metric label="Clientes" value={customerCount} />
      </div>

      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <input
          placeholder="Buscar por nombre o correo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="uv-input h-11 max-w-sm"
        />
        <button
          onClick={load}
          className="text-sm text-gray-600 hover:text-black inline-flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" strokeWidth={1.8} stroke="currentColor">
            <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 10A8 8 0 0 0 6 6M4 14a8 8 0 0 0 14 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Recargar
        </button>
      </div>

      {error && (
        <p className="text-[var(--uv-red)] border border-[var(--uv-red)]/20 bg-[var(--uv-red)]/5 rounded-md p-3 text-sm mb-5">
          {error}
        </p>
      )}
      {feedback && (
        <p className="text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-md p-3 text-sm mb-5">
          {feedback}
        </p>
      )}

      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                Usuario
              </th>
              <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                Correo
              </th>
              <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                Rol
              </th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="py-10 px-5 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((u) => {
                const isSelf = u.email === currentEmail;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-black">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-black">
                          {u.name}
                          {isSelf && (
                            <span className="ml-2 text-[11px] text-gray-400">
                              (tú)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-gray-700">{u.email}</td>
                    <td className="py-4 px-5">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--uv-red)]/10 text-[var(--uv-red)] text-[11px] font-semibold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--uv-red)]" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold uppercase tracking-wider">
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right space-x-4 whitespace-nowrap">
                      {u.role === "customer" && (
                        <button
                          onClick={() => setPromoteTarget(u)}
                          className="text-sm text-black hover:text-[var(--uv-red)]"
                        >
                          Promover
                        </button>
                      )}
                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-sm text-gray-500 hover:text-[var(--uv-red)]"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 px-5 text-center text-gray-500">
                  {query
                    ? "Ningún usuario coincide con la búsqueda."
                    : "Aún no hay usuarios registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {promoteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handlePromote}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
          >
            <h2 className="text-xl font-semibold tracking-display text-black mb-2">
              Promover a administrador
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Vas a otorgar permisos de administrador a{" "}
              <strong className="text-black">{promoteTarget.name}</strong> (
              {promoteTarget.email}). Confirma con la clave secreta de
              promoción.
            </p>
            <label className="uv-label">Clave secreta</label>
            <input
              type="password"
              required
              autoFocus
              value={promoteSecret}
              onChange={(e) => setPromoteSecret(e.target.value)}
              className="uv-input h-11 mb-6"
              placeholder="Introduce la clave"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPromoteTarget(null);
                  setPromoteSecret("");
                }}
                className="uv-btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={promoting || !promoteSecret}
                className="uv-btn-primary disabled:opacity-50"
              >
                {promoting ? "Promoviendo…" : "Promover"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-5">
      <p className="text-[12px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`text-2xl font-semibold tracking-display mt-2 ${
          accent ? "text-[var(--uv-red)]" : "text-black"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
