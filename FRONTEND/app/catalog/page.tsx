'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, SlidersHorizontal, X, ShoppingCart } from 'lucide-react';
import Navbar from '@/app/(landing)/components/Navbar';
import { apiFetch } from '@/app/lib/api';
import { useCart, formatPrice } from '@/app/lib/cart';

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'todos' | 'ropa' | 'accesorios' | 'libros' | 'papeleria' | 'tecnologia' | 'otros';
type PriceRange = 'all' | 'lt30k' | '30-60k' | '60-100k' | 'gt100k';
type SortKey = 'relevance' | 'price-asc' | 'price-desc';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: { url: string; storageKey?: string } | null;
  category: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'todos',      label: 'Todos'      },
  { value: 'ropa',       label: 'Ropa'       },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'libros',     label: 'Libros'     },
  { value: 'papeleria',  label: 'Papelería'  },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'otros',      label: 'Otros'      },
];

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'all',     label: 'Todos los precios'  },
  { value: 'lt30k',   label: 'Menos de $30.000'   },
  { value: '30-60k',  label: '$30.000 – $60.000'  },
  { value: '60-100k', label: '$60.000 – $100.000' },
  { value: 'gt100k',  label: 'Más de $100.000'    },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance',  label: 'Más relevante' },
  { value: 'price-asc',  label: 'Menor precio'  },
  { value: 'price-desc', label: 'Mayor precio'  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesPrice(price: number, range: PriceRange) {
  if (range === 'all')     return true;
  if (range === 'lt30k')   return price < 30000;
  if (range === '30-60k')  return price >= 30000 && price <= 60000;
  if (range === '60-100k') return price > 60000 && price <= 100000;
  if (range === 'gt100k')  return price > 100000;
  return true;
}

function applySort(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  if (sort === 'price-asc')  return copy.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return copy.sort((a, b) => b.price - a.price);
  return copy;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${value === opt.value ? 'border-[#C92A2A]' : 'border-[#C0BDB8] group-hover:border-[#6B6B6B]'}`}>
            {value === opt.value && <span className="w-2 h-2 rounded-full bg-[#C92A2A] block" />}
          </span>
          <span className={`font-body text-[14px] transition-colors duration-150 ${value === opt.value ? 'text-[#1A1A1A]' : 'text-[#6B6B6B] group-hover:text-[#1A1A1A]'}`}>
            {opt.label}
          </span>
          <input type="radio" className="sr-only" checked={value === opt.value} onChange={() => onChange(opt.value)} />
        </label>
      ))}
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const imageUrl = product.image?.url ?? '';

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: imageUrl }, 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        opacity: { duration: 0.3, delay: index * 0.05 },
        y: { duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] },
        layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      className="flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#F0EFED] rounded-[4px] overflow-hidden group">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={32} strokeWidth={1.1} color="#C0BDB8" />
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-body text-[11px] uppercase tracking-[0.12em] bg-[#1A1A1A] text-white px-3 py-1">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1.5">
        <span className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B]">
          {product.category}
        </span>
        <p className="font-display font-semibold text-[14px] text-[#1A1A1A] leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="font-display font-bold text-[16px] text-[#1A1A1A]">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className="mt-3 w-full font-body text-[11px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] py-2.5 rounded-[4px] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A]"
      >
        {product.stock > 0 ? 'Agregar al carrito' : 'No disponible'}
      </button>
    </motion.div>
  );
}

function FilterSidebar({
  category, setCategory, priceRange, setPriceRange,
}: {
  category: Category;
  setCategory: (v: Category) => void;
  priceRange: PriceRange;
  setPriceRange: (v: PriceRange) => void;
}) {
  return (
    <aside className="w-[220px] flex-shrink-0 sticky top-[88px] self-start">
      <p className="font-display font-bold text-[13px] uppercase tracking-[0.1em] text-[#1A1A1A] mb-5">
        Filtrar por
      </p>
      <div className="mb-6">
        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Categoría</p>
        <RadioGroup options={CATEGORIES} value={category} onChange={setCategory} />
      </div>
      <div className="border-t border-[#E8E6E2] mb-6" />
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Precio</p>
        <RadioGroup options={PRICE_RANGES} value={priceRange} onChange={setPriceRange} />
      </div>
    </aside>
  );
}

function MobileFilters({
  open, onClose, category, setCategory, priceRange, setPriceRange,
}: {
  open: boolean;
  onClose: () => void;
  category: Category;
  setCategory: (v: Category) => void;
  priceRange: PriceRange;
  setPriceRange: (v: PriceRange) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
          <motion.div key="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-[#FAFAF8] z-50 p-6 overflow-y-auto lg:hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <p className="font-display font-bold text-[15px] uppercase tracking-[0.08em] text-[#1A1A1A]">Filtros</p>
              <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="mb-6">
              <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Categoría</p>
              <RadioGroup options={CATEGORIES} value={category} onChange={v => { setCategory(v); onClose(); }} />
            </div>
            <div className="border-t border-[#E8E6E2] mb-6" />
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-3">Precio</p>
              <RadioGroup options={PRICE_RANGES} value={priceRange} onChange={v => { setPriceRange(v); onClose(); }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square bg-[#E8E6E2] rounded-[4px]" />
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-16 bg-[#E8E6E2] rounded" />
        <div className="h-3.5 w-full bg-[#E8E6E2] rounded" />
        <div className="h-4 w-24 bg-[#E8E6E2] rounded" />
      </div>
      <div className="mt-3 h-9 bg-[#E8E6E2] rounded-[4px]" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [query, setQuery]           = useState('');
  const [category, setCategory]     = useState<Category>('todos');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sort, setSort]             = useState<SortKey>('relevance');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const r = await apiFetch<Product[]>('/api/products');
      if (!r.ok) {
        setError(r.error || 'Error al cargar productos');
      } else {
        setProducts(r.data ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = products.filter(p => {
      const matchesQuery    = !q || `${p.name} ${p.description}`.toLowerCase().includes(q);
      const matchesCategory = category === 'todos' || p.category === category;
      const matchesP        = matchesPrice(p.price, priceRange);
      return matchesQuery && matchesCategory && matchesP;
    });
    return applySort(base, sort);
  }, [products, query, category, priceRange, sort]);

  const clearFilters = () => {
    setQuery('');
    setCategory('todos');
    setPriceRange('all');
    setSort('relevance');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* Promo banner */}
      <div className="bg-[#1A1A1A] h-10 flex items-center justify-center gap-3 mt-[57px]">
        <p className="font-body text-[13px] text-[#FAFAF8]/80">
          Productos oficiales de la{' '}
          <span className="text-[#C92A2A] font-semibold">Universidad del Valle</span>
        </p>
      </div>

      <main className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 pb-32">
        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="py-6 border-b border-[#E8E6E2]"
        >
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full font-body text-[14px] text-[#1A1A1A] placeholder:text-[#B0ADA8] bg-white border border-[#E8E6E2] rounded-md pl-10 pr-4 py-3 outline-none focus:border-[#1A1A1A] transition-colors duration-200"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Body: sidebar + grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-12 mt-8 items-start"
        >
          {/* Sidebar desktop */}
          <div className="hidden lg:block">
            <FilterSidebar category={category} setCategory={setCategory} priceRange={priceRange} setPriceRange={setPriceRange} />
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-0">
            {/* Grid header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-[#6B6B6B] border border-[#E8E6E2] px-3 py-1.5 rounded-md hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all duration-200"
                >
                  <SlidersHorizontal size={13} />
                  Filtros
                </button>
                <span className="font-body text-[13px] text-[#6B6B6B]">
                  {loading ? 'Cargando…' : (
                    <>Mostrando{' '}<span className="text-[#1A1A1A] font-medium">{filtered.length}</span>{' '}{filtered.length === 1 ? 'producto' : 'productos'}</>
                  )}
                </span>
              </div>

              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="font-body text-[13px] text-[#1A1A1A] bg-[#FAFAF8] border border-[#E8E6E2] rounded-[4px] px-3 py-1.5 outline-none cursor-pointer hover:border-[#1A1A1A] transition-colors duration-200"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Content */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
                <ShoppingCart size={48} strokeWidth={1.1} color="#E8E6E2" />
                <p className="font-display font-bold text-[18px] text-[#1A1A1A]">Error al cargar el catálogo</p>
                <p className="font-body text-[14px] text-[#6B6B6B]">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] px-5 py-2.5 rounded-md hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 mt-2"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-28 gap-4 text-center"
                  >
                    <ShoppingBag size={48} strokeWidth={1.1} color="#E8E6E2" />
                    <p className="font-display font-bold text-[18px] text-[#1A1A1A]">No se encontraron productos</p>
                    <p className="font-body text-[14px] text-[#6B6B6B]">Prueba con otros filtros o términos de búsqueda</p>
                    <button
                      onClick={clearFilters}
                      className="font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] px-5 py-2.5 rounded-md hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 mt-2"
                    >
                      Limpiar filtros
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filtered.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </main>

      <MobileFilters
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        category={category}
        setCategory={setCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />
    </div>
  );
}
