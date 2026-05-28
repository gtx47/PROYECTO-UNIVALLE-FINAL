'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/app/lib/cart';

type ProductImage = { url: string; storageKey?: string } | null;

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: ProductImage;
  category: string;
};

const EMPTY = { name: '', description: '', price: 0, stock: 0, image: null as ProductImage, category: 'otros' };

const INPUT = 'w-full border border-[#E8E6E2] rounded-md px-3 font-body text-[13px] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A] transition-colors';
const LABEL = 'block font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? 'Error al subir la imagen'); return; }
      setForm({ ...form, image: { url: json.data.url, storageKey: json.data.storageKey } });
    } catch (err: any) {
      setError(err?.message ?? 'Error al subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const load = async () => {
    const res = await fetch('/api/products');
    const json = await res.json();
    setProducts(json.data ?? []);
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return;
    setToken(t);
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error ?? 'Error'); return; }
    setForm(EMPTY);
    setEditingId(null);
    load();
  };

  const handleEdit = (p: Product) => { setEditingId(p.id); setForm(p); };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-1">Administración</p>
        <h1 className="font-display font-bold text-[28px] text-[#1A1A1A]" style={{ letterSpacing: '-0.025em' }}>
          Gestión de productos
        </h1>
        <p className="font-body text-[14px] text-[#6B6B6B] mt-1">Crea, edita y archiva los productos del catálogo.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="border border-[#E8E6E2] rounded-md p-8 mb-10 bg-white">
        <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-6">
          {editingId ? 'Editar producto' : 'Nuevo producto'}
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={LABEL}>Nombre</label>
            <input
              required
              placeholder="Nombre del producto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`${INPUT} h-11`}
            />
          </div>
          <div>
            <label className={LABEL}>Categoría</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`${INPUT} h-11`}
            >
              <option value="maestrias">Maestrías</option>
              <option value="diplomados">Diplomados</option>
              <option value="cursos">Cursos</option>
              <option value="ropa">Ropa</option>
              <option value="accesorios">Accesorios</option>
              <option value="libros">Libros</option>
              <option value="papeleria">Papelería</option>
              <option value="tecnologia">Tecnología</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={LABEL}>Descripción</label>
            <textarea
              required
              placeholder="Breve descripción del producto"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${INPUT} min-h-[96px] py-3`}
            />
          </div>
          <div>
            <label className={LABEL}>Precio (COP)</label>
            <input
              required
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={`${INPUT} h-11`}
            />
          </div>
          <div>
            <label className={LABEL}>Stock / cupos</label>
            <input
              required
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className={`${INPUT} h-11`}
            />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL}>Imagen del producto</label>
            <div className="flex items-start gap-4">
              {form.image?.url && (
                <div className="w-24 h-24 rounded-md overflow-hidden border border-[#E8E6E2] bg-[#F0EFED] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image.url} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full font-body text-[13px] text-[#6B6B6B] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-body file:text-[12px] file:font-semibold file:bg-[#C92A2A] file:text-white hover:file:bg-[#a82020] file:cursor-pointer disabled:opacity-50"
                />
                <input
                  placeholder="…o pega una URL https://"
                  value={form.image?.url ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value ? { url: e.target.value } : null })
                  }
                  className={`${INPUT} h-10`}
                />
                {uploading && <p className="font-body text-[12px] text-[#6B6B6B]">Subiendo imagen…</p>}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="font-body text-[13px] text-[#C92A2A] border border-[#C92A2A]/25 bg-[#C92A2A]/5 rounded-md px-4 py-3 mt-6">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            disabled={uploading}
            className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white px-5 py-2.5 rounded-md hover:bg-[#a82020] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(EMPTY); }}
              className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#E8E6E2] text-[#1A1A1A] px-5 py-2.5 rounded-md hover:border-[#1A1A1A] transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="border border-[#E8E6E2] rounded-md overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E2]">
              <th className="py-3 px-5 text-left font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Nombre</th>
              <th className="py-3 px-5 text-left font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Categoría</th>
              <th className="py-3 px-5 text-right font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Precio</th>
              <th className="py-3 px-5 text-right font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] font-medium">Stock</th>
              <th className="py-3 px-5" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#E8E6E2] last:border-0 hover:bg-[#F0EFED] transition-colors">
                <td className="py-4 px-5 font-body text-[13px] text-[#1A1A1A]">{p.name}</td>
                <td className="py-4 px-5 font-body text-[13px] text-[#6B6B6B]">{p.category}</td>
                <td className="py-4 px-5 text-right font-body text-[13px] text-[#1A1A1A]">{formatPrice(p.price)}</td>
                <td className="py-4 px-5 text-right font-body text-[13px] text-[#6B6B6B]">{p.stock}</td>
                <td className="py-4 px-5 text-right space-x-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(p)}
                    className="font-body text-[13px] text-[#1A1A1A] hover:text-[#C92A2A] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="font-body text-[13px] text-[#6B6B6B] hover:text-[#C92A2A] transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 px-5 text-center font-body text-[13px] text-[#6B6B6B]">
                  Aún no has creado productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
