'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Navbar from '@/app/(landing)/components/Navbar';
import Footer from '@/app/(landing)/components/Footer';
import { useCart, formatPrice } from '@/app/lib/cart';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: { url: string; storageKey?: string } | null;
  category: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  ropa: 'Ropa', accesorios: 'Accesorios', libros: 'Libros', papeleria: 'Papelería',
  tecnologia: 'Tecnología', maestrias: 'Maestrías', diplomados: 'Diplomados',
  cursos: 'Cursos', otros: 'Otros',
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProduct(json.data);
        else setError(json.error ?? 'Producto no encontrado');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image?.url ?? '' }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuy = () => {
    if (!product) return;
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image?.url ?? '' }, quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-20 w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10 font-body text-[12px] text-[#6B6B6B]">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Inicio</Link>
          <span className="text-[#E8E6E2]">/</span>
          <Link href="/catalog" className="hover:text-[#1A1A1A] transition-colors">Catálogo</Link>
          <span className="text-[#E8E6E2]">/</span>
          <span className="text-[#1A1A1A] truncate max-w-[200px]">{product?.name ?? '…'}</span>
        </nav>

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-[#E8E6E2] rounded-md" />
            <div className="space-y-4 pt-4">
              <div className="h-3 w-20 bg-[#E8E6E2] rounded" />
              <div className="h-8 w-3/4 bg-[#E8E6E2] rounded" />
              <div className="h-3 w-full bg-[#E8E6E2] rounded" />
              <div className="h-3 w-5/6 bg-[#E8E6E2] rounded" />
              <div className="h-10 w-32 bg-[#E8E6E2] rounded mt-6" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-24">
            <p className="font-body text-[14px] text-[#C92A2A] mb-4">{error}</p>
            <Link href="/catalog" className="font-body text-[13px] text-[#6B6B6B] hover:text-[#C92A2A] transition-colors">
              ← Volver al catálogo
            </Link>
          </div>
        )}

        {/* Product */}
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-2 gap-12 lg:gap-20"
          >
            {/* Imagen */}
            <div className="relative aspect-square bg-[#F0EFED] rounded-md overflow-hidden">
              {product.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} strokeWidth={1} color="#C0BDB8" />
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="font-body text-[12px] uppercase tracking-[0.12em] bg-[#1A1A1A] text-white px-4 py-2">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">

              {/* Categoría */}
              <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[#6B6B6B] mb-3">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </span>

              {/* Nombre */}
              <h1
                className="font-display font-bold text-[#1A1A1A] leading-[1.1] mb-4"
                style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', letterSpacing: '-0.025em' }}
              >
                {product.name}
              </h1>

              {/* Descripción */}
              <p className="font-body text-[14px] text-[#6B6B6B] leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Precio */}
              <div className="border-t border-[#E8E6E2] pt-6 mb-6">
                <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-1">Precio</p>
                <p
                  className="font-display font-bold text-[#1A1A1A]"
                  style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-0.03em' }}
                >
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-8">
                <span className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-400' : 'bg-[#C92A2A]'}`} />
                <span className="font-body text-[13px] text-[#6B6B6B]">
                  {product.stock > 5
                    ? `${product.stock} disponibles`
                    : product.stock > 0
                    ? `Solo ${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'} disponibles`
                    : 'Agotado'}
                </span>
              </div>

              {product.stock > 0 && (
                <>
                  {/* Cantidad */}
                  <div className="flex items-center gap-4 mb-6">
                    <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B]">Cantidad</p>
                    <div className="flex items-center border border-[#E8E6E2] rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center font-body text-[#6B6B6B] hover:bg-[#F0EFED] hover:text-[#1A1A1A] transition-colors text-lg"
                      >
                        −
                      </button>
                      <span className="w-10 h-10 flex items-center justify-center font-body text-[14px] text-[#1A1A1A] font-semibold border-x border-[#E8E6E2]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="w-10 h-10 flex items-center justify-center font-body text-[#6B6B6B] hover:bg-[#F0EFED] hover:text-[#1A1A1A] transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleBuy}
                      className="flex-1 font-body text-[12px] tracking-[0.08em] uppercase font-semibold bg-[#C92A2A] text-white py-3.5 rounded-md hover:bg-[#a82020] transition-colors duration-300"
                    >
                      Comprar ahora
                    </button>
                    <button
                      onClick={handleAdd}
                      className={`flex-1 font-body text-[12px] tracking-[0.08em] uppercase font-semibold border py-3.5 rounded-md transition-all duration-300 ${
                        added
                          ? 'border-green-500 text-green-600 bg-green-50'
                          : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                      }`}
                    >
                      {added ? '✓ Agregado' : 'Agregar al carrito'}
                    </button>
                  </div>
                </>
              )}

              {/* Beneficios */}
              <div className="mt-8 pt-6 border-t border-[#E8E6E2] space-y-2.5">
                {[
                  { text: 'Producto oficial Universidad del Valle' },
                  { text: 'Envío disponible a todo el país' },
                  { text: 'Pago seguro' },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2.5">
                    <span className="font-body text-[12px] text-[#6B6B6B]">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
