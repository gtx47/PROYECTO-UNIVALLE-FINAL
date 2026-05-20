"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { apiFetch } from "@/app/lib/api";

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

const REASON_LABELS: Record<Recommendation["reason"], string> = {
  viewed: "Visto recientemente",
  purchased: "Basado en tu compra",
  similar_category: "Categoría similar",
  trending: "Tendencia",
};

export default function RecommendationsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
        setProducts([]);
        setLoading(false);
        return;
      }

      const productResults = await Promise.all(
        recs.map((r) => apiFetch<Product>(`/api/products/${r.productId}`))
      );

      const loaded = productResults
        .map((r) => r.data)
        .filter((p): p is Product => p !== null);

      setProducts(loaded);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            Personalizado para ti
          </span>
          <h1 className="text-5xl font-semibold tracking-display text-black mt-3 mb-4">
            Recomendaciones
          </h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            Productos seleccionados según tu actividad en la tienda.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        {!isLoggedIn ? (
          <div className="text-center py-24">
            <p className="text-2xl font-semibold tracking-display text-black mb-2">
              Inicia sesión para ver tus recomendaciones
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Necesitamos saber quién eres para mostrarte productos relevantes.
            </p>
            <a
              href="/login"
              className="inline-flex items-center h-11 px-6 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Iniciar sesión
            </a>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-2xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-2xl font-semibold tracking-display text-black mb-2">
              No pudimos cargar las recomendaciones
            </p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-xl font-semibold tracking-display text-black mb-2">
              Aún no tienes recomendaciones
            </p>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Explora el catálogo y realiza compras para que podamos sugerirte productos relevantes.
            </p>
            <a
              href="/products"
              className="inline-flex items-center h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-black transition-colors"
            >
              Ver catálogo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
