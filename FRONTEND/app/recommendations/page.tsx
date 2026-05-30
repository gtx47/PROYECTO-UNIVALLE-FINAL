"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Navbar from "@/app/(landing)/components/Navbar";
import Footer from "@/app/(landing)/components/Footer";
import { apiFetch } from "@/app/lib/api";
import { useCart, formatPrice } from "@/app/lib/cart";

type Recommendation = {
  id: string;
  productId: string;
  score: number;
  reason: "viewed" | "purchased" | "similar_category" | "trending";
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: { url: string; storageKey?: string } | null;
  category: string;
};

type RecommendedProduct = {
  product: Product;
  reason: Recommendation["reason"];
};

const REASON_LABELS: Record<Recommendation["reason"], string> = {
  viewed: "Visto recientemente",
  purchased: "Basado en tu compra",
  similar_category: "Categoría similar",
  trending: "Tendencia",
};

function RecommendedCard({ item, index }: { item: RecommendedProduct; index: number }) {
  const { addItem } = useCart();
  const { product, reason } = item;
  const imageUrl = product.image?.url ?? "";

  const handleAdd = () => {
    addItem(
      { productId: product.id, name: product.name, price: product.price, image: imageUrl },
      1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.3, delay: index * 0.06 },
        y: { duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] },
      }}
      className="flex flex-col"
    >
      {/* Imagen */}
      <Link href={`/products/${product.id}`} className="block">
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

          {/* Badge de razón */}
          <div className="absolute top-2.5 left-2.5">
            <span className="font-body text-[10px] uppercase tracking-[0.1em] font-semibold bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-2 py-1 rounded-[3px]">
              {REASON_LABELS[reason]}
            </span>
          </div>

          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="font-body text-[11px] uppercase tracking-[0.12em] bg-[#1A1A1A] text-white px-3 py-1">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 space-y-1.5">
        <span className="font-body text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B]">
          {product.category}
        </span>
        <Link href={`/products/${product.id}`}>
          <p className="font-display font-semibold text-[14px] text-[#1A1A1A] leading-snug line-clamp-2 hover:text-[#C92A2A] transition-colors duration-200">
            {product.name}
          </p>
        </Link>
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
        {product.stock > 0 ? "Agregar al carrito" : "No disponible"}
      </button>
    </motion.div>
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

export default function RecommendationsPage() {
  const [items, setItems] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    const load = async () => {
      const recsRes = await apiFetch<{ data: Recommendation[]; count: number }>(
        "/api/recommendations?limit=12"
      );

      if (!recsRes.ok || !recsRes.data) {
        setError(recsRes.error || "Error al cargar recomendaciones");
        setLoading(false);
        return;
      }

      const recs: Recommendation[] = Array.isArray(recsRes.data)
        ? recsRes.data
        : (recsRes.data as { data: Recommendation[] }).data ?? [];

      if (recs.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productResults = await Promise.all(
        recs.map((r) => apiFetch<Product>(`/api/products/${r.productId}`))
      );

      const loaded: RecommendedProduct[] = productResults
        .map((r, i) => (r.data ? { product: r.data, reason: recs[i].reason } : null))
        .filter((x): x is RecommendedProduct => x !== null);

      setItems(loaded);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* Promo banner */}
      <div className="bg-[#1A1A1A] h-10 flex items-center justify-center mt-[57px]">
        <p className="font-body text-[13px] text-[#FAFAF8]/80">
          Seleccionado solo para ti ·{" "}
          <span className="text-[#C92A2A] font-semibold">Recomendaciones personalizadas</span>
        </p>
      </div>

      {/* Hero del encabezado */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 pt-10 pb-6 border-b border-[#E8E6E2]">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-body text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B]"
        >
          Personalizado para ti
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[#1A1A1A] mt-1"
          style={{ fontSize: "clamp(28px, 3.4vw, 42px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          Recomendaciones
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-body text-[14px] text-[#6B6B6B] mt-2"
        >
          Productos seleccionados según tu actividad en la tienda.
        </motion.p>
      </div>

      <main className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 py-10 flex-1">
        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-28 gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#F0EFED] flex items-center justify-center mb-2">
              <ShoppingBag size={24} strokeWidth={1.5} color="#6B6B6B" />
            </div>
            <p className="font-display font-bold text-[20px] text-[#1A1A1A] tracking-tight">
              Inicia sesión para ver tus recomendaciones
            </p>
            <p className="font-body text-[14px] text-[#6B6B6B] max-w-sm">
              Necesitamos saber quién eres para mostrarte productos relevantes.
            </p>
            <Link
              href="/login"
              className="mt-2 font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] px-6 py-2.5 rounded-[4px] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
            >
              Iniciar sesión
            </Link>
          </motion.div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#F0EFED] flex items-center justify-center mb-2">
              <ShoppingBag size={24} strokeWidth={1.5} color="#6B6B6B" />
            </div>
            <p className="font-display font-bold text-[18px] text-[#1A1A1A] tracking-tight">
              No pudimos cargar las recomendaciones
            </p>
            <p className="font-body text-[14px] text-[#6B6B6B]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] px-5 py-2.5 rounded-[4px] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
            >
              Reintentar
            </button>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 border border-dashed border-[#E8E6E2] rounded-[4px] gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#F0EFED] flex items-center justify-center">
              <ShoppingBag size={24} strokeWidth={1.5} color="#6B6B6B" />
            </div>
            <p className="font-display font-bold text-[18px] text-[#1A1A1A] tracking-tight">
              Aún no tienes recomendaciones
            </p>
            <p className="font-body text-[14px] text-[#6B6B6B] max-w-md">
              Explora el catálogo y realiza compras para que podamos sugerirte productos relevantes.
            </p>
            <Link
              href="/products"
              className="mt-2 font-body text-[12px] tracking-[0.08em] uppercase font-semibold border border-[#1A1A1A] text-[#1A1A1A] px-5 py-2.5 rounded-[4px] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
            >
              Ver catálogo
            </Link>
          </motion.div>
        ) : (
          <>
            <p className="font-body text-[13px] text-[#6B6B6B] mb-6">
              Mostrando{" "}
              <span className="text-[#1A1A1A] font-medium">{items.length}</span>{" "}
              {items.length === 1 ? "producto recomendado" : "productos recomendados"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {items.map((item, index) => (
                <RecommendedCard key={item.product.id} item={item} index={index} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
