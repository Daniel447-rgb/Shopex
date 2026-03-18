// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, RefreshCw } from "lucide-react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { SEED_PRODUCTS, CATEGORIES } from "../data/seedProducts";
import ProductCard from "../components/ProductCard";

const PERKS = [
  { icon: Zap, label: "Fast Delivery", desc: "2–5 business days nationwide" },
  { icon: Shield, label: "Buyer Protection", desc: "100% secure checkout" },
  { icon: RefreshCw, label: "Easy Returns", desc: "30-day hassle-free returns" },
];

const CATEGORY_ICONS = {
  Fashion: "👗",
  Electronics: "📱",
  Food: "☕",
  Home: "🏠",
  Beauty: "✨",
  Sports: "🏃",
};

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Try Firestore first, fall back to seed data
    async function load() {
      try {
        const q = query(collection(db, "products"), where("featured", "==", true), limit(4));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setFeatured(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setFeatured(SEED_PRODUCTS.filter((p) => p.featured));
        }
      } catch {
        setFeatured(SEED_PRODUCTS.filter((p) => p.featured));
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-cream overflow-hidden min-h-[90vh] flex items-center">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, #f55200 0%, transparent 50%),
                              radial-gradient(circle at 75% 20%, #ff7520 0%, transparent 40%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block text-ember-400 font-mono text-xs uppercase tracking-widest mb-6 border border-ember-500/30 px-3 py-1">
              New Season — Shop Now
            </span>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6">
              Every
              <br />
              <em className="not-italic text-ember-400">Thing</em>
              <br />
              You
              <br />
              Need
            </h1>
            <p className="text-ink-300 text-lg max-w-sm mb-10 leading-relaxed">
              Curated goods across fashion, tech, home, and beyond. Quality over quantity, always.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary">
                Shop Collection
              </Link>
              <Link
                to="/products?category=Fashion"
                className="flex items-center gap-2 text-sm text-ink-300 hover:text-cream transition-colors"
              >
                View Lookbook <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="hidden md:grid grid-cols-2 gap-3 h-[520px]">
            <div className="row-span-2 rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80"
                alt="hero"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
                alt="hero"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80"
                alt="hero"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Perks Bar ── */}
      <section className="border-b border-ink-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink-100">
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4 sm:py-2 first:pl-0 last:pr-0">
              <div className="w-10 h-10 bg-ember-50 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-ember-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-900">{label}</p>
                <p className="text-xs text-ink-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-2">Browse by</p>
            <h2 className="font-display text-4xl text-ink-900">Categories</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.filter((c) => c !== "All").map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="group bg-white border border-ink-100 p-5 text-center hover:border-ember-500 hover:bg-ember-50 transition-all duration-200"
            >
              <div className="text-3xl mb-2">{CATEGORY_ICONS[cat] || "🛍"}</div>
              <p className="text-sm font-medium text-ink-800 group-hover:text-ember-600 transition-colors">
                {cat}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-2">Hand-picked</p>
            <h2 className="font-display text-4xl text-ink-900">Featured</h2>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-ember-500 text-white py-20 text-center">
        <p className="font-mono text-sm uppercase tracking-widest opacity-70 mb-3">Limited Time</p>
        <h2 className="font-display text-5xl font-bold mb-4">20% Off Your First Order</h2>
        <p className="text-ember-100 mb-8">Use code <strong className="font-mono bg-white/20 px-2 py-0.5">WELCOME20</strong> at checkout</p>
        <Link
          to="/products"
          className="inline-block bg-white text-ember-600 px-8 py-3 font-medium text-sm hover:bg-ember-50 transition-colors"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
