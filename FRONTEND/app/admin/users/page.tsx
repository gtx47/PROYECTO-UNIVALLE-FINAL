'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type User = { id: string; name: string; email: string; role: 'customer' | 'admin' };
type Session = { id?: string; email?: string };

const INPUT = 'w-full border border-[#E8E6E2] rounded-md px-3 font-body text-[13px] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A] transition-colors';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [promoteTarget, setPromoteTarget] = useState<User | null>(null);
  const [promoteSecret, setPromoteSecret] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    const r = await apiFetch<User[]>('/api/users');
    if (!r.ok) { setError(r.error || 'No se pudieron cargar los usuarios'); setUsers([]); }
    else { setUsers(r.data ?? []); }
    setLoading(false);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('session');
      if (raw) setCurrentEmail((JSON.parse(raw) as Session).email ?? null);
    } catch {}
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.length - adminCount;

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteTarget) return;
    setPromoting(true);
    setError('');
    setFeedback('');
    const r = await apiFetch<{ success: boolean; message: string }>('/api/admin/promote', {
      method: 'POST',
      body: JSON.stringify({ email: promoteTarget.email, secret: promoteSecret }),
    });
    setPromoting(false);
    if (!r.ok) { setError(r.error || 'No se pudo promover al usuario'); return; }
    setFeedback(`${promoteTarget.name} ahora es administrador.`);
    setPromoteTarget(null);
    setPromoteSecret('');
    load();
  };

  const handleDelete = async (user: User) => {
    if (user.email === currentEmail) return;
    if (!confirm(`¿Eliminar a ${user.name} (${user.email})? Esta acción no se puede deshacer.`)) return;
    setError('');
    setFeedback('');
    const r = await apiFetch(`/api/users/${user.id}`, { method: 'DELETE' });
    if (!r.ok) { setError(r.error || 'No se pudo eliminar el usuario'); return; }
    setFeedback(`${user.name} fue eliminado.`);
    load();
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-1">Administración</p>
        <h1 className="font-display font-bold text-[28px] text-[#1A1A1A]" style={{ letterSpacing: '-0.025em' }}>
          Gestión de usuarios
        </h1>
        <p className="font-body text-[14px] text-[#6B6B6B] mt-1">
          Promueve clientes a administradores o elimina cuentas inactivas.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total" value={users.length} />
        <MetricCard label="Administradores" value={adminCount} accent />
        <MetricCard label="Clientes" value={customerCount} />
      </div>

      {/* Search + reload */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <input
          placeholder="Buscar por nombre o correo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${INPUT} h-11 max-w-sm`}
        />
        <button
          onClick={load}
          className="font-body text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A] inline-flex items-center gap-1.5 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" strokeWidth={1.8} stroke="currentColor">
            <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 10A8 8 0 0 0 6 6M4 14a8 8 0 0 0 14 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Recargar
        </button>
      </div>

      {error && (
        <p className="font-body text-[13px] text-[#C92A2A] border border-[#C92A2A]/25 bg-[#C92A2A]/5 rounded-md px-4 py-3 mb-5">
          {error}
        </p>
      )}
      {feedback && (
        <p className="font-body text-[13px] text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-md px-4 py-3 mb-5">
          {feedback}
        </p>
      )}

      {/* Table */}
      <div className="border border-[#E8E6E2] rounded-md overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E2]">
              <th className="py-3 px-5 text-left font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Usuario</th>
              <th className="py-3 px-5 text-left font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Correo</th>
              <th className="py-3 px-5 text-left font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Rol</th>
              <th className="py-3 px-5" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="py-10 px-5 text-center font-body text-[13px] text-[#6B6B6B]">Cargando…</td>
              </tr>
            )}
            {!loading && filtered.map((u) => {
              const isSelf = u.email === currentEmail;
              return (
                <tr key={u.id} className="border-b border-[#E8E6E2] last:border-0 hover:bg-[#F0EFED] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-body text-[13px] text-[#1A1A1A]">
                        {u.name}
                        {isSelf && <span className="ml-2 font-body text-[11px] text-[#6B6B6B]">(tú)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-body text-[13px] text-[#6B6B6B]">{u.email}</td>
                  <td className="py-4 px-5">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C92A2A]/10 text-[#C92A2A] font-body text-[11px] font-semibold uppercase tracking-[0.08em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C92A2A]" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F0EFED] text-[#6B6B6B] font-body text-[11px] font-semibold uppercase tracking-[0.08em]">
                        Cliente
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right space-x-4 whitespace-nowrap">
                    {u.role === 'customer' && (
                      <button
                        onClick={() => setPromoteTarget(u)}
                        className="font-body text-[13px] text-[#1A1A1A] hover:text-[#C92A2A] transition-colors"
                      >
                        Promover
                      </button>
                    )}
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="font-body text-[13px] text-[#6B6B6B] hover:text-[#C92A2A] transition-colors"
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
                <td colSpan={4} className="py-10 px-5 text-center font-body text-[13px] text-[#6B6B6B]">
                  {query ? 'Ningún usuario coincide con la búsqueda.' : 'Aún no hay usuarios registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Promote modal */}
      {promoteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handlePromote} className="bg-white rounded-md p-8 max-w-md w-full shadow-xl border border-[#E8E6E2]">
            <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-2">Acción de administrador</p>
            <h2 className="font-display font-bold text-[20px] text-[#1A1A1A] mb-3" style={{ letterSpacing: '-0.02em' }}>
              Promover a administrador
            </h2>
            <p className="font-body text-[14px] text-[#6B6B6B] mb-6 leading-relaxed">
              Vas a otorgar permisos de administrador a{' '}
              <strong className="text-[#1A1A1A]">{promoteTarget.name}</strong>{' '}
              ({promoteTarget.email}). Confirma con la clave secreta de promoción.
            </p>
            <label className="block font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
              Clave secreta
            </label>
            <input
              type="password"
              required
              autoFocus
              value={promoteSecret}
              onChange={(e) => setPromoteSecret(e.target.value)}
              className={`${INPUT} h-11 mb-6`}
              placeholder="Introduce la clave"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setPromoteTarget(null); setPromoteSecret(''); }}
                className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#E8E6E2] text-[#1A1A1A] px-5 py-2.5 rounded-md hover:border-[#1A1A1A] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={promoting || !promoteSecret}
                className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white px-5 py-2.5 rounded-md hover:bg-[#a82020] transition-colors disabled:opacity-50"
              >
                {promoting ? 'Promoviendo…' : 'Promover'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="border border-[#E8E6E2] rounded-md p-5 bg-white">
      <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-2">{label}</p>
      <p className={`font-display font-bold text-[24px] ${accent ? 'text-[#C92A2A]' : 'text-[#1A1A1A]'}`}>{value}</p>
    </div>
  );
}
